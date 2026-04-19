(() => {
  const CONFIG = globalThis.SURIKING_SUPABASE || {};
  const STATE_ID = "live";
  const REQUEST_KEY = "jipsuriwang-requests-live-v1";
  const WORKER_KEY = "jipsuriwang-workers-live-v1";
  const ACCOUNT_KEY = "jipsuriwang-accounts-live-v1";
  const SECURE_STORAGE_PREFIX = "jipsuriwang-secure-v1:";
  const SECURE_STORAGE_SECRET = "jipsuriwang-local-private-data-2026";
  const SYNC_KEYS = new Set([REQUEST_KEY, WORKER_KEY, ACCOUNT_KEY]);
  const STATUS_ORDER = ["요청", "낙찰", "공사중", "공사완료", "입금완료"];
  const isEnabled = Boolean(CONFIG.url && CONFIG.anonKey);
  let saveTimer = null;
  let isApplyingRemote = false;

  function supabaseUrl(path) {
    return `${String(CONFIG.url).replace(/\/$/, "")}${path}`;
  }

  async function request(path, options = {}) {
    const response = await fetch(supabaseUrl(path), {
      ...options,
      headers: {
        apikey: CONFIG.anonKey,
        Authorization: `Bearer ${CONFIG.anonKey}`,
        Accept: "application/json",
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase ${response.status}: ${await response.text()}`);
    }
    return response.status === 204 ? null : response.json();
  }

  function hasPayload(payload) {
    return Boolean(payload && (
      Array.isArray(payload.requests) ||
      Array.isArray(payload.workers) ||
      Array.isArray(payload.accounts)
    ));
  }

  async function loadRemote() {
    const payload = await loadRemotePayload();
    if (!hasPayload(payload)) return;
    applyPayloadToLocalStorage(mergePayloads(payload, getPayload()));
  }

  function getPayload() {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      requests: readStoredArray(REQUEST_KEY),
      workers: readStoredArray(WORKER_KEY),
      accounts: readStoredArray(ACCOUNT_KEY)
    };
  }

  function mergePayloads(remotePayload, localPayload) {
    const remote = hasPayload(remotePayload) ? remotePayload : {};
    const local = hasPayload(localPayload) ? localPayload : {};
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      requests: mergeRequests(remote.requests, local.requests),
      workers: mergeByIdentity(remote.workers, local.workers, getWorkerKey),
      accounts: mergeByIdentity(remote.accounts, local.accounts, getAccountKey)
    };
  }

  function mergeRequests(remoteRequests, localRequests) {
    return mergeByIdentity(remoteRequests, localRequests, getRequestKey, mergeRequest);
  }

  function mergeRequest(remoteRequest, localRequest) {
    const merged = {
      ...remoteRequest,
      ...localRequest,
      status: pickMostAdvancedStatus(remoteRequest?.status, localRequest?.status),
      customerConfirmed: Boolean(remoteRequest?.customerConfirmed || localRequest?.customerConfirmed),
      awardedBidId: localRequest?.awardedBidId || remoteRequest?.awardedBidId || null,
      bids: mergeByIdentity(remoteRequest?.bids, localRequest?.bids, getBidKey),
      chatMessages: mergeByIdentity(remoteRequest?.chatMessages, localRequest?.chatMessages, getChatKey).sort(compareCreatedAt),
      completionImages: mergePrimitiveList(remoteRequest?.completionImages, localRequest?.completionImages),
      images: mergePrimitiveList(remoteRequest?.images, localRequest?.images)
    };
    delete merged.chats;
    return merged;
  }

  function pickMostAdvancedStatus(remoteStatus, localStatus) {
    return statusRank(localStatus) > statusRank(remoteStatus) ? localStatus : (remoteStatus || localStatus || "요청");
  }

  function statusRank(status) {
    const index = STATUS_ORDER.indexOf(status);
    return index < 0 ? 0 : index;
  }

  function compareCreatedAt(a, b) {
    return String(a?.createdAt || "").localeCompare(String(b?.createdAt || ""));
  }

  function mergeByIdentity(remoteItems, localItems, keyGetter, mergeItem = (remoteItem, localItem) => ({ ...remoteItem, ...localItem })) {
    const merged = new Map();
    [...toArray(remoteItems), ...toArray(localItems)].forEach((item) => {
      const key = keyGetter(item);
      if (!key) return;
      merged.set(key, merged.has(key) ? mergeItem(merged.get(key), item) : item);
    });
    return Array.from(merged.values());
  }

  function mergePrimitiveList(remoteItems, localItems) {
    return Array.from(new Set([...toArray(remoteItems), ...toArray(localItems)].filter(Boolean)));
  }

  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function getRequestKey(item) {
    return item?.id || "";
  }

  function getWorkerKey(item) {
    return item?.id || item?.name || "";
  }

  function getAccountKey(item) {
    return item?.loginHash || `${item?.role || ""}:${item?.name || ""}`;
  }

  function getBidKey(item) {
    return item?.id || `${item?.workerName || ""}:${item?.amount || ""}:${item?.note || ""}`;
  }

  function getChatKey(item) {
    return item?.id || `${item?.createdAt || ""}:${item?.authorName || ""}:${item?.text || item?.message || ""}`;
  }

  function readStoredArray(key) {
    try {
      const value = parseStoredValue(localStorage.getItem(key));
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  async function saveRemote() {
    const remotePayload = await loadRemotePayload();
    const mergedPayload = mergePayloads(remotePayload, getPayload());
    await request("/rest/v1/app_state?on_conflict=id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify([{ id: STATE_ID, payload: mergedPayload }])
    });
    applyPayloadToLocalStorage(mergedPayload);
  }

  async function loadRemotePayload() {
    const rows = await request(`/rest/v1/app_state?id=eq.${encodeURIComponent(STATE_ID)}&select=payload`);
    return Array.isArray(rows) && rows[0] ? rows[0].payload : null;
  }

  function applyPayloadToLocalStorage(payload) {
    isApplyingRemote = true;
    localStorage.setItem(REQUEST_KEY, JSON.stringify(payload.requests || []));
    localStorage.setItem(WORKER_KEY, JSON.stringify(payload.workers || []));
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(payload.accounts || []));
    isApplyingRemote = false;
  }

  function scheduleSave(key) {
    if (!isEnabled || isApplyingRemote || !SYNC_KEYS.has(key)) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveRemote().catch((error) => console.error("Supabase 저장 실패:", error));
    }, 500);
  }

  function installStorageHook() {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = (key, value) => {
      originalSetItem(key, value);
      scheduleSave(key);
    };
  }

  function parseStoredValue(saved) {
    if (!saved) return [];
    if (!saved.startsWith(SECURE_STORAGE_PREFIX)) return JSON.parse(saved);
    const envelopeText = new TextDecoder().decode(base64ToBytes(saved.slice(SECURE_STORAGE_PREFIX.length)));
    const envelope = JSON.parse(envelopeText);
    const plainBytes = xorWithKeyStream(base64ToBytes(envelope.data), envelope.nonce);
    return JSON.parse(new TextDecoder().decode(plainBytes));
  }

  function xorWithKeyStream(bytes, nonce) {
    const output = new Uint8Array(bytes.length);
    let offset = 0;
    let counter = 0;
    while (offset < bytes.length) {
      const mask = hexToBytes(digestTextFallback(`${SECURE_STORAGE_SECRET}:${nonce}:${counter}`));
      for (let index = 0; index < mask.length && offset < bytes.length; index += 1) {
        output[offset] = bytes[offset] ^ mask[index];
        offset += 1;
      }
      counter += 1;
    }
    return output;
  }

  function base64ToBytes(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  function hexToBytes(value) {
    const bytes = new Uint8Array(value.length / 2);
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
    }
    return bytes;
  }

  function digestTextFallback(value) {
    const bytes = Array.from(new TextEncoder().encode(value));
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);
    for (let shift = 56; shift >= 0; shift -= 8) bytes.push(Math.floor(bitLength / 2 ** shift) & 0xff);
    const rightRotate = (number, bits) => (number >>> bits) | (number << (32 - bits));
    const constants = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    const hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    for (let offset = 0; offset < bytes.length; offset += 64) {
      const words = Array(64).fill(0);
      for (let index = 0; index < 16; index += 1) {
        const start = offset + index * 4;
        words[index] = ((bytes[start] << 24) | (bytes[start + 1] << 16) | (bytes[start + 2] << 8) | bytes[start + 3]) >>> 0;
      }
      for (let index = 16; index < 64; index += 1) {
        const s0 = rightRotate(words[index - 15], 7) ^ rightRotate(words[index - 15], 18) ^ (words[index - 15] >>> 3);
        const s1 = rightRotate(words[index - 2], 17) ^ rightRotate(words[index - 2], 19) ^ (words[index - 2] >>> 10);
        words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = hash;
      for (let index = 0; index < 64; index += 1) {
        const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + s1 + ch + constants[index] + words[index]) >>> 0;
        const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (s0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + temp1) >>> 0; d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
      }
      [a, b, c, d, e, f, g, h].forEach((value, index) => { hash[index] = (hash[index] + value) >>> 0; });
    }
    return hash.map((value) => value.toString(16).padStart(8, "0")).join("");
  }

  installStorageHook();
  globalThis.SURIKING_SUPABASE_READY = isEnabled
    ? loadRemote().catch((error) => console.error("Supabase 불러오기 실패:", error))
    : Promise.resolve();
})();
