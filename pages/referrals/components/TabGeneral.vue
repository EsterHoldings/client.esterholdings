<template>
  <PanelDefault>
    <div class="referrals__tab--general">
      <div class="referrals__tab--general_qr">
        <UiTextH4 class="referrals__tab--general_qr_link-title"
          >Referral Link</UiTextH4
        >
        <UiQRCode link="https://www.youtube.com/watch?v=9M9TnYTwfzM" />

        <UiTextH5 class="referrals__tab--general_qr-link">
          <span class="referrals__tab--general_qr-link-text" ref="referralText"
            >https://www.youtube.com/watch?v=9M9TnYTwfzM</span
          >
          <span class="referrals__tab--general_qr-link-icon">
            <UiIconCopy title="Copy" @click="copyReferral" />
          </span>
        </UiTextH5>
      </div>

      <div class="referrals__tab--general_levels">
        <UiTextH4 class="referrals__tab--general_levels-title">Levels</UiTextH4>

        <div class="referrals__tab--general_levels_list">
          <div class="level-row">
            <span>Level 1</span>
            <span>17</span>
          </div>

          <div class="level-row">
            <span>Level 2</span>
            <span>9</span>
          </div>

          <div class="level-row">
            <span>Level 3</span>
            <span>3</span>
          </div>
        </div>

        <YourLevelProgress current="150" total="200" />
      </div>

      <div class="referrals__tab--general_history">
        <UiTextH4 class="referrals__tab--general_history-title"
          >History</UiTextH4
        >

        <UiTextH5
          v-for="(item, index) in history"
          :key="index"
          class="referrals__tab--general_history-item"
        >
          {{ item }}</UiTextH5
        >
      </div>
    </div>
  </PanelDefault>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "vue-toastification";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiQRCode from "~/components/ui/UiQRCode.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";

import UiIconCopy from "~/components/ui/UiIconCopy.vue";

import YourLevelProgress from "./YourLevelProgress.vue";

const toast = useToast();

const referralText = ref<HTMLElement | null>(null);
const history = [
  "You got a new referral user@email.com",
  "You got a new referral user@email",
  "You earned a bonus",
  "You withdrew $25",
];

const copyReferral = async () => {
  const text = referralText.value?.textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copy");
  } catch (err) {
    console.error("Ошибка копирования:", err);
  }
};
</script>

<style lang="scss" scoped>
.referrals__tab--general {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 20px;

  &_qr {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;

    &_link-title {
      color: var(--ui-text-main);
    }

    &-link {
      position: relative;
      padding: 10px 30px 10px 10px;
      display: inline-flex;
      align-items: center;
      max-width: 240px;
      background: var(--ui-background-sidebar);
      border-radius: 10px;

      &-text {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: inline-block;
        max-width: 100%;
        color: var(--ui-text-main);
      }

      &-icon {
        position: absolute;
        right: 7px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ui-text-main);
      }
    }
  }

  &_levels {
    width: 260px;
    padding: 20px;

    display: flex;
    flex-direction: column;
    gap: 40px;

    &-title {
      color: var(--ui-text-main);
    }

    &_list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 25px;
    }
  }

  .level-row {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    color: var(--ui-text-main);
  }

  &_history {
    padding: 20px;

    display: flex;
    flex-direction: column;
    gap: 30px;

    &-title {
      color: var(--ui-text-main);
    }

    &-item {
      color: var(--ui-text-main);
    }
  }
}
</style>
