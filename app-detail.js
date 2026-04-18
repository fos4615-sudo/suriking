(() => {
  const WORKER_STORAGE_KEY = "jipsuriwang-workers-live-v1";
  const SECURE_STORAGE_PREFIX = "jipsuriwang-secure-v1:";
  const SECURE_STORAGE_SECRET = "jipsuriwang-local-private-data-2026";
  const DEFAULT_WORKER_PHONE = "999-9999-9999";

  const detailStyle = `
    .supplier-card__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
    .supplier-card__select,.supplier-card__detail{width:auto;min-width:128px}
    .selected-worker-detail{display:grid;gap:16px}
    .selected-worker-detail__top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
    .selected-worker-detail__label{display:block;margin-bottom:6px;color:#8d4a2f;font-size:.82rem;font-weight:800;letter-spacing:.08em}
    .selected-worker-detail__top strong{display:block;font-size:1.1rem;color:#2b2119}
    .selected-worker-detail__top p,.selected-worker-detail__intro{margin:6px 0 0;color:#675b4f;line-height:1.6}
    .selected-worker-detail__metric{min-width:92px;padding:12px 14px;border-radius:16px;background:#f3eadf;text-align:center;color:#7a5735}
    .selected-worker-detail__metric span,.selected-worker-detail__metric strong{display:block}
    .selected-worker-detail__metric span{font-size:.78rem;font-weight:800}
    .selected-worker-detail__metric strong{font-size:1.05rem;color:#5a371c}
    .selected-worker-detail__grid,.selected-worker-detail__images{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
    .selected-worker-detail__images img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px;border:1px solid #eadfd2}
    @media (max-width:760px){.supplier-card__select,.supplier-card__detail{width:100%}.selected-worker-detail__top{display:grid}.selected-worker-detail__grid,.selected-worker-detail__images{grid-template-columns:1fr}.selected-worker-detail__metric{text-align:left}}
  `;

  function installStyle() {
    if (document.querySelector("#workerDetailPatchStyle")) return;
    const style = document.createElement("style");
    style.id = "workerDetailPatchStyle";
    style.textContent = detailStyle;
    document.head.appendChild(style);
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

  function getWorkers() {
    try {
      const workers = parseStoredValue(localStorage.getItem(WORKER_STORAGE_KEY));
      return Array.isArray(workers) ? workers : [];
    } catch {
      return [];
    }
  }

  function getWorkerCategories(worker) {
    if (Array.isArray(worker?.categories) && worker.categories.length) return worker.categories;
    return worker?.category ? [worker.category] : [];
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function renderImageMarkup(images) {
    if (!Array.isArray(images) || !images.length) return "";
    return `<div class="selected-worker-detail__images">${images.slice(0, 3).map((image) =>
      `<img src="${escapeHtml(image)}" alt="작업자 등록 사진">`
    ).join("")}</div>`;
  }

  function renderWorkerDetail(worker) {
    const categories = getWorkerCategories(worker).join(", ");
    return `
      <div class="selected-worker-detail">
        <div class="selected-worker-detail__top">
          <div>
            <span class="selected-worker-detail__label">작업자 상세보기</span>
            <strong>${escapeHtml(worker.name || "공사작업자")}</strong>
            <p>${escapeHtml(categories)} · ${escapeHtml(worker.specialty || "")}</p>
          </div>
          <div class="selected-worker-detail__metric">
            <span>누적 완료</span>
            <strong>${Number(worker.completedJobs || 0)}건</strong>
          </div>
        </div>
        <div class="selected-worker-detail__grid">
          <div class="info-box"><span>연락처</span><strong>${DEFAULT_WORKER_PHONE}</strong></div>
          <div class="info-box"><span>활동 지역</span><strong>${escapeHtml(worker.coverage || "-")}</strong></div>
          <div class="info-box"><span>대표 실적</span><strong>${escapeHtml(worker.performance || "-")}</strong></div>
        </div>
        <p class="selected-worker-detail__intro">${escapeHtml(worker.intro || "등록된 소개 내용이 없습니다.")}</p>
        ${renderImageMarkup(worker.images)}
      </div>
    `;
  }

  function findWorkerByButton(button) {
    const workerId = button.dataset.workerId;
    const workers = getWorkers();
    return workers.find((worker) => worker.id === workerId) || workers.find((worker) => {
      const card = button.closest(".supplier-card");
      return card && card.innerText.includes(worker.name);
    }) || null;
  }

  function enhanceSupplierCards() {
    document.querySelectorAll(".supplier-card").forEach((card) => {
      const selectButton = card.querySelector(".supplier-card__select");
      if (!selectButton || card.querySelector(".supplier-card__detail")) return;
      const actions = selectButton.parentElement;
      if (actions) actions.classList.add("supplier-card__actions");
      const detailButton = document.createElement("button");
      detailButton.type = "button";
      detailButton.className = "ghost-button supplier-card__detail";
      detailButton.dataset.workerId = selectButton.dataset.workerId || "";
      detailButton.textContent = "작업자 상세보기";
      selectButton.insertAdjacentElement("afterend", detailButton);
    });
  }

  function handleDetailClick(event) {
    const button = event.target.closest(".supplier-card__detail");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const worker = findWorkerByButton(button);
    const panel = document.querySelector("#selectedWorkerSummary");
    if (!worker || !panel) return;
    document.querySelectorAll(".supplier-card").forEach((card) => card.classList.remove("is-active"));
    button.closest(".supplier-card")?.classList.add("is-active");
    panel.className = "selected-worker-summary";
    panel.innerHTML = renderWorkerDetail(worker);
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function boot() {
    installStyle();
    enhanceSupplierCards();
    document.querySelector("#homeWorkerList")?.addEventListener("click", handleDetailClick);
    const target = document.querySelector("#homeWorkerList") || document.body;
    new MutationObserver(enhanceSupplierCards).observe(target, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
