<template>
  <section class="account-types__wrapper">
    <UiContainer>
      <UiTextH3 class="account-types__title"
        >{{ t("landing.sections.accounts__title") }}
      </UiTextH3>

      <div class="account-types__tabs">
        <TabsDefault
          :tabsList="tabsList"
          @selectTab="handleActiveTab"
          :activeTabIndex="activeTabIndex"
        />
      </div>

      <div class="account-types">
        <transition name="slide-short" mode="out-in">
          <component
            :is="tabsList[activeTabIndex].component"
            :key="activeTabIndex"
          />
        </transition>
      </div>
    </UiContainer>
  </section>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";

import { ref, computed } from "vue";

import UiTextH3 from "~/components/ui/UiTextH3.vue";

import UiContainer from "~/components/ui/UiContainer.vue";
import TabsDefault from "~/components/block/tabs/TabsDefault.vue";

import Standard from "./components/Standart.vue";
import Pro from "./components/Pro.vue";
import Tandem from "./components/Tandem.vue";
import Islamic from "./components/Islamic.vue";

const { t, tm } = useI18n();

const accounts = tm("landing.sections.accounts__options");

const activeTabIndex = ref(0);

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

<style lang="scss" scoped>
.account-types {
  padding: 40px 20px;
  display: flex;
  justify-content: center;

  &__title {
    color: var(--ui-text-main);
    text-align: center;
    margin-bottom: 70px;
  }

  &__tabs {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.account-container {
  display: flex;
  gap: 20px;
  max-width: 1100px;
  width: 100%;
}

.account-card {
  flex: 1;
  height: 385px;
  border-radius: 15px;
  border: 1px solid var(--ui-stroke);
  cursor: pointer;
  transition: flex 0.3s ease-in-out, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.account-card.active {
  flex: 2;
  background-color: var(--ui-background-card);
  transform: scale(1.05);
  position: relative;
  overflow: hidden;

  &:before {
    content: attr(data-text);
    position: absolute;
    bottom: -10px;
    left: 20px;
    font-size: 180px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.07);
    text-transform: uppercase;
    filter: blur(4px);
    z-index: 0;
    white-space: nowrap;
    pointer-events: none;
  }

  .account-description {
    min-width: 353px;
  }
}

.account-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 47px;
  width: 80%;
  color: var(--ui-text-main);
}

.account-title {
  font-weight: bold;
}

.account-subtitle {
  margin-top: 5px;
  color: var(--ui-text-secondary);
}

.account-description {
  margin-top: 10px;
  color: var(--ui-text-secondary);
}

.account-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: var(--ui-text-main);

  &_title {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    height: 144px;
  }
}

.arrow {
  margin-top: 50px;
}

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

@media (max-width: 991px) {
  .account-container {
    flex-direction: column;
  }

  .account-types__title {
    font-size: 26px;
  }

  .account-content {
    padding: 40px;
  }

  .account-mini {
    &_title {
      writing-mode: horizontal-tb;
      text-orientation: initial;
      transform: none;
      height: auto;
    }
  }

  .arrow {
    transform: rotate(90deg);
  }

  .account-card.active {
    transform: scale(1);
  }
}

@media (max-width: 767px) {
  .account-description {
    min-width: 300px !important;
  }

  .account-content {
    padding: 10px;
  }
}
</style>
