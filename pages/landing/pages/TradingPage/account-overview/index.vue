<template>
  <UiContainer>
    <div class="flex flex-col gap-[30px]">
      <UiTextH3 class="text-center text-[var(--ui-text-main)]">
        Account overview
      </UiTextH3>

      <div class="flex flex-col items-center justify-center gap-[30px]">
        <TabsDefault
            :tabsList="tabsList"
            @selectTab="handleActiveTab"
            :activeTabIndex="activeTabIndex"
        />

        <Transition
            mode="out-in"
            enter-active-class="transition-opacity transition-transform duration-100 ease-in-out"
            enter-from-class="opacity-0 translate-x-[30px]"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="transition-opacity transition-transform duration-100 ease-in-out"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-[30px]"
        >
          <component
              :is="tabsList[activeTabIndex].component"
              :key="activeTabIndex"
          />
        </Transition>
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {ref, computed} from "vue";
import {useRoute} from "vue-router";
import {definePageMeta} from "~/.nuxt/imports";

import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import TabsDefault from "~/components/block/tabs/TabsDefault.vue";

import Standard from "./components/Standard.vue";
import Pro from "./components/Pro.vue";
import Tandem from "./components/Tandem.vue";
import Islamic from "./components/Islamic.vue";

definePageMeta({
  layout: "main",
  alias: "/account-overview",
});

const {t} = useI18n();
const route = useRoute();

const activeTabIndex = ref(Number(route.query.index) || 0);

const tabsList = computed(() => {
  return [
    {
      label: t("landing.sections.accounts__options[0].title"),
      component: Standard,
    },
    {
      label: t("landing.sections.accounts__options[1].title"),
      component: Pro,
    },
    {
      label: t("landing.sections.accounts__options[2].title"),
      component: Islamic,
    },
    {
      label: t("landing.sections.accounts__options[3].title"),
      component: Tandem,
    },
  ];
});

const handleActiveTab = (tabIndex: number) => {
  activeTabIndex.value = tabIndex;
};
</script>
