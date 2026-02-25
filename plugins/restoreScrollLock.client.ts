import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.$router.afterEach(to => {
    // Сбрасываем любые блокировки скролла, которые могли остаться от предыдущих экранов/меню
    if (process.client) {
      const body = document.body;
      const html = document.documentElement;
      const isCabinetRoute = String(to.meta?.layout ?? "") === "cabinet";

      if (isCabinetRoute) {
        body.classList.remove("scroll-unlocked", "overflow-hidden", "fixed");
        body.classList.add("cabinet-scroll-lock");
        body.style.setProperty("overflow", "hidden", "important");
        body.style.setProperty("overflow-y", "hidden", "important");
        body.style.position = "";
        body.style.width = "";
        body.style.height = "100dvh";

        html.classList.remove("scroll-unlocked", "overflow-hidden", "fixed");
        html.classList.add("cabinet-scroll-lock");
        html.style.setProperty("overflow", "hidden", "important");
        html.style.setProperty("overflow-y", "hidden", "important");
        html.style.height = "100dvh";

        return;
      }

      body.classList.remove("cabinet-scroll-lock");
      html.classList.remove("cabinet-scroll-lock");

      body.style.overflow = "auto";
      body.style.setProperty("overflow", "auto", "important");
      body.style.setProperty("overflow-y", "auto", "important");
      body.style.overflowY = "auto";
      body.style.position = "";
      body.style.width = "";
      body.classList.remove("overflow-hidden", "fixed");
      body.style.height = "auto";

      html.style.overflow = "auto";
      html.style.setProperty("overflow", "auto", "important");
      html.style.setProperty("overflow-y", "auto", "important");
      html.style.overflowY = "auto";
      html.classList.remove("overflow-hidden", "fixed");
      html.style.height = "auto";

      // add helper class that force-unlocks via CSS !important
      body.classList.add("scroll-unlocked");
      html.classList.add("scroll-unlocked");

      // in case a previous inline style lingers, clear scroll lock after tick
      requestAnimationFrame(() => {
        body.style.overflow = "auto";
        body.style.setProperty("overflow", "auto", "important");
        body.style.setProperty("overflow-y", "auto", "important");
        html.style.overflow = "auto";
        html.style.setProperty("overflow", "auto", "important");
        html.style.setProperty("overflow-y", "auto", "important");
      });
    }
  });
});
