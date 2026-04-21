(() => {
  const CONFIG = globalThis.SURIKING_SUPABASE || {};
  const STATE_ID = "traffic";
  const VISITOR_KEY = "suriking-visitor-id-v1";
  const UNIQUE_DAY_KEY = "suriking-unique-days-v1";
  const MAX_DAYS = 730;

  if (!CONFIG.url || !CONFIG.anonKey) return;

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

  function getVisitorId() {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const value = globalThis.crypto?.randomUUID?.() || `visitor-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_KEY, value);
    return value;
  }

  function getKoreanDateKey() {
    const parts = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    const pick = (type) => parts.find((part) => part.type === type)?.value || "00";
    return `${pick("year")}-${pick("month")}-${pick("day")}`;
  }

  function readUniqueDays() {
    try {
      const value = JSON.parse(localStorage.getItem(UNIQUE_DAY_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function markUniqueDay(dateKey) {
    const days = readUniqueDays();
    const isUniqueToday = !days.includes(dateKey);
    if (isUniqueToday) {
      days.push(dateKey);
      localStorage.setItem(UNIQUE_DAY_KEY, JSON.stringify(days.slice(-MAX_DAYS)));
    }
    return isUniqueToday;
  }

  async function loadPayload() {
    const rows = await request(`/rest/v1/app_state?id=eq.${encodeURIComponent(STATE_ID)}&select=payload`);
    return Array.isArray(rows) && rows[0]?.payload ? rows[0].payload : { version: 1, daily: {} };
  }

  async function savePayload(payload) {
    await request("/rest/v1/app_state?on_conflict=id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify([{ id: STATE_ID, payload }])
    });
  }

  function trimDaily(daily) {
    return Object.fromEntries(
      Object.entries(daily || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-MAX_DAYS)
    );
  }

  async function trackVisit() {
    const dateKey = getKoreanDateKey();
    const visitorId = getVisitorId();
    const isUniqueToday = markUniqueDay(dateKey);
    const payload = await loadPayload();
    const daily = trimDaily(payload.daily || {});
    const day = daily[dateKey] || { pageViews: 0, uniqueVisitors: 0, visits: 0 };

    day.pageViews = Number(day.pageViews || 0) + 1;
    day.visits = Number(day.visits || 0) + 1;
    day.uniqueVisitors = Number(day.uniqueVisitors || 0) + (isUniqueToday ? 1 : 0);
    day.lastVisitedAt = new Date().toISOString();
    day.lastPath = location.pathname || "/";

    daily[dateKey] = day;
    await savePayload({
      version: 1,
      updatedAt: new Date().toISOString(),
      daily,
      // 개인정보 보호를 위해 IP, 이름, ID는 저장하지 않습니다.
      lastVisitorHash: await digestText(visitorId)
    });
  }

  async function digestText(value) {
    if (!globalThis.crypto?.subtle) return "fallback";
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 16);
  }

  globalThis.SURIKING_TRAFFIC_READY = trackVisit().catch((error) => {
    console.error("방문자 통계 저장 실패:", error);
  });
})();
