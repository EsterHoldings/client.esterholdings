<template>
  <PanelDefault>
    <div class="flex flex-col gap-4 p-4">
      <UiTextH4 class="text-[var(--ui-text-main)]">
        {{ t("cabinet.referrals.terms.title") }}
      </UiTextH4>
      <UiTextSmall class="text-[var(--ui-text-secondary)]">
        {{ t("cabinet.referrals.terms.subtitle") }}
      </UiTextSmall>

      <ul class="space-y-2 text-[var(--ui-text-main)]">
        <li v-for="(item, idx) in rules" :key="idx" class="rounded-lg border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] px-3 py-2">
          <UiTextSmall>{{ item }}</UiTextSmall>
        </li>
      </ul>
    </div>
  </PanelDefault>
</template>

<script setup lang="ts">
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const rules = [
  t("cabinet.referrals.terms.rule1"),
  t("cabinet.referrals.terms.rule2"),
  t("cabinet.referrals.terms.rule3"),
  t("cabinet.referrals.terms.rule4"),
];
</script>

<style scoped></style>
