(()=>{
  if (!document.querySelector("#seedDemoBtn")) {
    const button = document.createElement("button");
    button.id = "seedDemoBtn";
    button.type = "button";
    button.hidden = true;
    document.body.appendChild(button);
  }
  const script = document.createElement("script");
  script.src = "./app-core.js?v=20260418-restore";
  script.defer = true;
  document.head.appendChild(script);
})();
