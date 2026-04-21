(()=>{
  if (!document.querySelector("#seedDemoBtn")) {
    const button = document.createElement("button");
    button.id = "seedDemoBtn";
    button.type = "button";
    button.hidden = true;
    document.body.appendChild(button);
  }
  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  const applyPromoCopy = () => {
    const lead = document.querySelector(".hero__lead");
    if (lead) {
      lead.textContent = "수수료 0원. 집수리 요청을 올리면 작업자가 입찰하고, 마음에 드는 작업자를 직접 선택해 공사완료까지 확인하세요.";
    }
    document.title = "집수리왕 | 수수료 0원 집수리 무료 매칭";
    const upsertMeta = (selector, attrs) => {
      let meta = document.head.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        document.head.appendChild(meta);
      }
      Object.entries(attrs).forEach(([key, value]) => meta.setAttribute(key, value));
    };
    upsertMeta('meta[name="description"]', {
      name: "description",
      content: "집수리왕은 수수료 0원으로 집수리 요청, 작업자 입찰, 직접 낙찰, 공사완료 확인까지 진행하는 무료 집수리 매칭 플랫폼입니다."
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: "수수료 0원. 집수리 요청을 올리고 입찰 작업자를 직접 선택해 공사완료까지 확인하세요."
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: "https://suriking.kr/assets/og-image.svg"
    });
  };
  const version = "20260421-traffic1";
  loadScript(`./supabase-config.js?v=${version}`)
    .then(() => loadScript(`./visitor-analytics.js?v=${version}`).catch((error) => console.error("방문자 통계 로드 실패:", error)))
    .then(() => loadScript(`./supabase-sync.js?v=${version}`))
    .then(() => globalThis.SURIKING_SUPABASE_READY || Promise.resolve())
    .then(() => loadScript(`./security-hardening.js?v=${version}`))
    .then(() => loadScript("./app-core.js?v=20260421-traffic1"))
    .then(() => loadScript("./app-detail.js?v=20260418-detail-1"))
    .then(() => loadScript(`./request-number-fix.js?v=${version}`))
    .then(applyPromoCopy)
    .catch((error) => {
      document.body.textContent = "앱을 불러오지 못했습니다. " + error.message;
      console.error(error);
    });
})();
