<template>
  <div class="your-level">
    <UiTextH5>{{ t("cabinet.referrals.general.yourLevel") }}</UiTextH5>
    <div class="your-level__bar">
      <div
        class="your-level__bar-fill"
        :style="{ width: percent + '%' }"></div>
    </div>
    <UiTextH5 class="your-level__points">
      {{ t("cabinet.referrals.general.pointsProgress", { current, total }) }}
    </UiTextH5>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  const { current, total } = defineProps<{
    current: string | number;
    total: string | number;
  }>();
  const { t } = useI18n({ useScope: "global" });

  const percent = computed(() => {
    const curr = Number(current);
    const tot = Number(total);
    return tot > 0 ? Math.min(100, (curr / tot) * 100) : 0;
  });
</script>

<style scoped lang="scss">
  .your-level {
    margin-top: 20px;

    &__bar {
      height: 12px;
      border-radius: 20px;
      background-color: #1c2541;
      overflow: hidden;
      margin: 10px 0;
    }

    &__bar-fill {
      height: 100%;
      background-color: #397eff;
      border-radius: 20px;
      transition: width 0.3s;
    }

    &__points {
      color: var(--ui-text-main);
    }
  }
</style>
