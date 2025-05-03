import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

export const currentTab = ref("Standard");

export const currentTabContent = {
  standard: "Standard",
};

export function useTabs() {
  const { tm, t } = useI18n();

  const raw = tm("landing.account_types__categories");

  const tabs = ref(
    Array.isArray(raw)
      ? raw.map((item: any, index: number) => {
          const key = `landing.account_types__categories[${index}]`;

          return {
            id: t(`${key}.id`),
            label: t(`${key}.label`),
          };
        })
      : []
  );

  return {
    tabs,
  };
}
