import { ref } from "vue";
import Appearance from "../components/Appearance.vue";
import General from "../components/General.vue";
import Secure from "../components/Secure.vue";

// ✅ Массив вкладок
export const tabs = ref([
  { id: "general", label: "General" },
  { id: "appearance", label: "Appearance" },
  { id: "secure", label: "Secure" },
]);

export const currentTab = ref("general");

export const currentTabContent = {
  general: General,
  appearance: Appearance,
  secure: Secure,
};
