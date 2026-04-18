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
  const version = "20260418-2";
  loadScript(`./supabase-config.js?v=${version}`)
    .then(() => loadScript(`./supabase-sync.js?v=${version}`))
    .then(() => globalThis.SURIKING_SUPABASE_READY || Promise.resolve())
    .then(() => loadScript(`./security-hardening.js?v=${version}`))
    .then(() => loadScript("./app-core.js?v=20260418-restore"))
    .then(() => loadScript("./app-detail.js?v=20260418-detail-1"))
    .catch((error) => {
      document.body.textContent = "앱을 불러오지 못했습니다. " + error.message;
      console.error(error);
    });
})();
