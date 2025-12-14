<template>
  <UiContainer>
    <div>
      <PanelDefault class="!p-0 overflow-hidden">
        <div class="flex flex-row max-lg:flex-col min-w-0">
          <div
            class="w-[240px] shrink-0 max-lg:w-full border-[var(--ui-primary-main)] p-2 max-lg:p-2 border-r max-lg:border-r-0 max-lg:border-b bg-[var(--ui-background)]"
          >
            <TabsAsList
              :tabsList="tabsList"
              @selectTab="handleActiveTab"
              :activeTabIndex="activeTabIndex"
            />
          </div>

          <div class="flex-1 w-full min-w-0">
            <Transition
              enter-active-class="transition ease-linear duration-100"
              enter-from-class="opacity-0 translate-x-4"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="transition ease-linear duration-100"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-4"
              mode="out-in"
            >
              <div class="w-full min-w-0">
                <div
                  class="text-[--ui-text-main] h-[66px] w-full px-4 sm:px-5 border-b border-solid border-[var(--ui-primary-main)] flex items-center justify-start bg-[var(--ui-background)]"
                >
                  {{ tabsList[activeTabIndex].label }}
                </div>
                <div class="p-3 sm:p-5 overflow-y-auto min-w-0 bg-[var(--ui-background)]">
                  <component
                    :is="tabsList[activeTabIndex].component"
                    :key="activeTabIndex"
                  />
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </PanelDefault>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import { definePageMeta } from "~/.nuxt/imports";

import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import TabsAsList from "~/components/block/tabs/TabsAsList.vue";
import UiIconSetting from "~/components/ui/UiIconSetting.vue";
import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
import UiIconUser from "~/components/ui/UiIconUser.vue";

import TabGeneral from "./components/TabGeneral.vue";
import TabSettings from "./components/TabSettings.vue";
import TabTerms from "./components/TabTerms.vue";

definePageMeta({
  layout: "cabinet",
  middleware: ["auth-client", "client-check-auth"],
});

const { t } = useI18n();
const activeTabIndex = ref(0);

const tabsList = computed(() => [
  {
    label: t("cabinet.referrals.index.tabs.general"),
    icon: UiIconUser,
    component: TabGeneral,
  },
  {
    label: t("cabinet.referrals.index.tabs.settings"),
    icon: UiIconSetting,
    component: TabSettings,
  },
  {
    label: t("cabinet.referrals.index.tabs.terms"),
    icon: UiIconDocuments,
    component: TabTerms,
  },
]);

const handleActiveTab = (tabIndex: number) => {
  activeTabIndex.value = tabIndex;
};
</script>

<style scoped>
.slide-short-enter-active,
.slide-short-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.slide-short-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-short-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-short-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-short-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
