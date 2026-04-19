(() => {
  const REQUEST_KEY = "jipsuriwang-requests-live-v1";
  const SECURE_STORAGE_PREFIX = "jipsuriwang-secure-v1:";
  let timer = null;

  function readRequests() {
    try {
      const saved = localStorage.getItem(REQUEST_KEY);
      if (!saved || saved.startsWith(SECURE_STORAGE_PREFIX)) return [];
      const requests = JSON.parse(saved);
      return Array.isArray(requests) ? requests : [];
    } catch {
      return [];
    }
  }

  function formatRequestNumber(request) {
    const date = formatDatePart(getRequestTime(request));
    const suffix = getRequestSuffix(request);
    return `SR-${date}-${suffix}`;
  }

  function getRequestTime(request) {
    const direct = Date.parse(request?.createdAt || request?.updatedAt || request?.statusHistory?.[0]?.at || "");
    if (Number.isFinite(direct)) return direct;

    const match = String(request?.id || "").match(/^(?:id|fieldtest)-([a-z0-9]+)/);
    if (!match) return Date.now();

    const value = Number.parseInt(match[1], 36);
    return Number.isFinite(value) ? value : Date.now();
  }

  function formatDatePart(time) {
    const parts = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date(time));
    const pick = (type) => parts.find((part) => part.type === type)?.value || "00";
    return `${pick("year")}${pick("month")}${pick("day")}`;
  }

  function getRequestSuffix(request) {
    const id = String(request?.id || "");
    const tail = id.split("-").filter(Boolean).pop() || id;
    return tail.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(-8).padStart(4, "0");
  }

  function updateRequestNumbers() {
    const requests = readRequests();
    if (!requests.length) return;

    const used = new Set();
    document.querySelectorAll(".request-card").forEach((card) => {
      const numberNode = card.querySelector(".request-id");
      if (!numberNode) return;

      const current = numberNode.textContent.replace(/^요청번호\s*/, "").trim();
      if (current.startsWith("SR-")) return;

      const request = requests.find((item) => {
        const id = String(item?.id || "");
        return id.startsWith(current) && !used.has(id);
      });
      if (!request) return;

      used.add(request.id);
      numberNode.textContent = `요청번호 ${formatRequestNumber(request)}`;
      numberNode.title = `원본 ID: ${request.id}`;
    });
  }

  function scheduleUpdate() {
    clearTimeout(timer);
    timer = setTimeout(updateRequestNumbers, 50);
  }

  updateRequestNumbers();
  new MutationObserver(scheduleUpdate).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("storage", scheduleUpdate);
})();
