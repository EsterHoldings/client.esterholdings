import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

import Appearance from "../components/Appearance.vue";
import General from "../components/General.vue";
import Secure from "../components/Secure.vue";

export const currentTab = ref("general");

export const currentTabContent = {
  general: General,
  appearance: Appearance,
  secure: Secure,
};

export function useTabs() {
  const { tm, t } = useI18n();

  const tabs = computed(() => [
    {
      id: "general",
      label: t("admin.settings.tabs.general"),
      component: General,
    },
    {
      id: "appearance",
      label: t("admin.settings.tabs.appearance"),
      component: Appearance,
    },
    {
      id: "secure",
      label: t("admin.settings.tabs.secure"),
      component: Secure,
    },
  ]);

  return {
    tabs,
  };
}
