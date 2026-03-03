<script setup lang="ts">
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import { useI18n } from "vue-i18n";
  import { computed } from "vue";

  const props = defineProps<{
    id: string;
    type: string;
    number: string;
    balance: string | number;
    isLoading?: boolean;
  }>();

  const { t } = useI18n({ useScope: "global" });

  const formattedBalance = computed(() => {
    const parsedBalance = Number(props.balance);

    if (Number.isFinite(parsedBalance)) {
      return `$ ${parsedBalance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `$ ${String(props.balance ?? "0.00")}`;
  });

  const accountOverviewRows = computed(() => [
    {
      key: "id",
      label: "ID",
      value: props.id,
    },
    {
      key: "number",
      label: t("cabinet.accounts.columns.number"),
      value: props.number,
    },
    {
      key: "type",
      label: t("cabinet.accounts.columns.type"),
      value: props.type || "-",
    },
    {
      key: "balance",
      label: t("cabinet.accounts.columns.balance"),
      value: formattedBalance.value,
      highlighted: true,
    },
  ]);
</script>

<template>
  <div class="account-overview">
    <div class="account-overview__grid">
      <article
        v-for="row in accountOverviewRows"
        :key="row.key"
        class="account-overview__item"
        :class="row.highlighted ? 'is-highlighted' : ''">
        <UiTextSmall class="account-overview__label">
          {{ row.label }}
        </UiTextSmall>

        <div
          v-if="!props.isLoading"
          class="account-overview__value">
          {{ row.value }}
        </div>
        <UiIconSpinnerDefault
          v-else
          class="account-overview__loader" />
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .account-overview {
    width: 100%;
  }

  .account-overview__grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .account-overview__item {
    border-radius: 12px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-card) 65%, transparent);
    padding: 12px;
    min-height: 86px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
  }

  .account-overview__item.is-highlighted {
    border-color: color-mix(in srgb, var(--ui-primary-main) 55%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-primary-main) 12%, var(--ui-background-card));
  }

  .account-overview__label {
    color: var(--ui-text-secondary);
    line-height: 1.25;
  }

  .account-overview__value {
    color: var(--ui-text-main);
    font-size: 18px;
    line-height: 1.25;
    font-weight: 700;
    word-break: break-word;
  }

  .account-overview__loader {
    color: var(--ui-text-main);
  }

  @media (max-width: 860px) {
    .account-overview__grid {
      grid-template-columns: 1fr;
    }

    .account-overview__item {
      min-height: 72px;
      padding: 10px;
    }

    .account-overview__value {
      font-size: 16px;
    }
  }
</style>
