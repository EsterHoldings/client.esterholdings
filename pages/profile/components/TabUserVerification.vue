<template>
  <div class="user-verification__wrapper">
    <div class="user-verification__left">
      <PanelDefault>
        <UiTextH5 class="user-verification__left__title">Verification status</UiTextH5>
        <ul class="user-verification__left__verification-list">
          <li>
            <UiIconFailed />
            <span>{{
                t("cabinet.dashboard.accountVerification.addressFailed")
              }}</span>
          </li>

          <li>
            <UiIconSuccess />
            <span>{{
                t("cabinet.dashboard.accountVerification.documentVerified")
              }}</span>
          </li>

          <li>
            <UiIconWarning />
            <span>{{
                t("cabinet.dashboard.accountVerification.paymentInProgress")
              }}</span>
          </li>

          <li>
            <UiIconWarning />
            <span>{{
                t("cabinet.dashboard.accountVerification.profileInProgress")
              }}</span>
          </li>
        </ul>
      </PanelDefault>
    </div>
    <div class="user-verification__right">
      <PanelDefault class="user-photo__right__panel">
        Verification history...
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiIconFailed from "~/components/ui/UiIconFailed.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";

const { locale, t } = useI18n({ useScope: "global" });
</script>

<style lang="scss" scoped>
.user {
  &-verification {
    &__wrapper {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }
    &__left {
      width: 50%;

      & > div {
        padding: 20px;
      }

      &__title {
        margin-bottom: 20px;
      }

      &__verification-list {
        list-style: none;

        li {
          height: 50px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--color-stroke-ui-dark);

          svg {
            margin-left: 10px;
          }

          span {
            margin-left: 40px;
            margin-right: 10px;
          }
        }
      }
    }
    &__right {
      width: 50%;

      & > div {
        padding: 20px;
      }

      &__panel {
        padding: 20px;
        height: 100%;
        width: 100%;
      }
    }
  }

  &-photo {
    &-uploader {
      color: var(--ui-text-main);
    }

    &__right__panel {
      color: var(--ui-text-main);
    }
  }
}
</style>
