(() => {
  const STORAGE_KEYS = [
    "jipsuriwang-requests-live-v1",
    "jipsuriwang-workers-live-v1",
    "jipsuriwang-accounts-live-v1",
    "jipsuriwang-auth-v1"
  ];
  const SECURE_STORAGE_PREFIX = "jipsuriwang-secure-v1:";
  const SECURE_STORAGE_SECRET = "jipsuriwang-local-private-data-2026";
  const MAX_TEXT_LENGTH = 1200;

  const safeImageUrl = (value) => {
    const text = String(value || "");
    return /^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(text) ? text : "";
  };

  const escapeHtml = (value) => String(value || "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .slice(0, MAX_TEXT_LENGTH)
    .replace(/[<>"']/g, (char) => ({
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  function parseStoredValue(saved) {
    if (!saved) return null;
    if (!saved.startsWith(SECURE_STORAGE_PREFIX)) return JSON.parse(saved);
    const envelopeText = new TextDecoder().decode(base64ToBytes(saved.slice(SECURE_STORAGE_PREFIX.length)));
    const envelope = JSON.parse(envelopeText);
    const plainBytes = xorWithKeyStream(base64ToBytes(envelope.data), envelope.nonce);
    return JSON.parse(new TextDecoder().decode(plainBytes));
  }

  function secureSerialize(value) {
    const nonce = createStorageNonce();
    const plainBytes = new TextEncoder().encode(JSON.stringify(value));
    const cipherBytes = xorWithKeyStream(plainBytes, nonce);
    const envelope = {
      v: 1,
      alg: "sha256-keystream-xor",
      nonce,
      data: bytesToBase64(cipherBytes)
    };
    return `${SECURE_STORAGE_PREFIX}${bytesToBase64(new TextEncoder().encode(JSON.stringify(envelope)))}`;
  }

  function sanitizeValue(value, key = "") {
    if (Array.isArray(value)) {
      if (key === "images" || key === "completionImages") {
        return value.map(safeImageUrl).filter(Boolean).slice(0, 3);
      }
      return value.map((item) => sanitizeValue(item, key));
    }
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([entryKey, entryValue]) => [entryKey, sanitizeValue(entryValue, entryKey)])
      );
    }
    if (typeof value === "string") {
      if (key.endsWith("Hash") || key === "nonce" || key === "data" || key === "alg") return value;
      return escapeHtml(value);
    }
    return value;
  }

  function sanitizeStoredData() {
    STORAGE_KEYS.forEach((key) => {
      try {
        const saved = localStorage.getItem(key);
        if (!saved) return;
        const parsed = parseStoredValue(saved);
        localStorage.setItem(key, secureSerialize(sanitizeValue(parsed)));
      } catch (error) {
        console.warn("보안 정리 중 저장소를 건너뜀:", key, error);
      }
    });
  }

  function hardenBrowserSurface() {
    if (window.top !== window.self) {
      try {
        window.top.location = window.location;
      } catch {
        document.documentElement.innerHTML = "";
      }
    }

    const referrer = document.createElement("meta");
    referrer.name = "referrer";
    referrer.content = "same-origin";
    document.head.appendChild(referrer);

    document.querySelectorAll("form").forEach((form) => {
      form.setAttribute("autocomplete", "off");
    });
    document.querySelectorAll('input[type="password"]').forEach((input) => {
      input.setAttribute("autocomplete", "new-password");
      input.setAttribute("minlength", input.getAttribute("minlength") || "4");
      input.setAttribute("maxlength", "64");
    });

    const removeUnsafeNodes = () => {
      document.querySelectorAll("script[src]").forEach((script) => {
        const src = new URL(script.src, location.href);
        if (src.origin !== location.origin && src.origin !== "https://raw.githubusercontent.com") {
          script.remove();
        }
      });
      document.querySelectorAll("[onload],[onerror],[onclick],[onmouseover],[onfocus]").forEach((element) => {
        [...element.attributes].forEach((attribute) => {
          if (attribute.name.startsWith("on")) element.removeAttribute(attribute.name);
        });
      });
    };

    removeUnsafeNodes();
    new MutationObserver(removeUnsafeNodes).observe(document.documentElement, { childList: true, subtree: true });
  }

  function createStorageNonce() {
    const bytes = new Uint8Array(16);
    if (globalThis.crypto?.getRandomValues) {
      globalThis.crypto.getRandomValues(bytes);
    } else {
      bytes.forEach((_, index) => {
        bytes[index] = Math.floor(Math.random() * 256);
      });
    }
    return bytesToBase64(bytes);
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

  function bytesToBase64(bytes) {
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
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
    for (let shift = 56; shift >= 0; shift -= 8) {
      bytes.push(Math.floor(bitLength / 2 ** shift) & 0xff);
    }

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
        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }
      [a, b, c, d, e, f, g, h].forEach((value, index) => {
        hash[index] = (hash[index] + value) >>> 0;
      });
    }

    return hash.map((value) => value.toString(16).padStart(8, "0")).join("");
  }

  sanitizeStoredData();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hardenBrowserSurface);
  } else {
    hardenBrowserSurface();
  }
})();
