<script setup lang="ts">
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import { useI18n } from "vue-i18n";
  import { computed } from "vue";

  const props = defineProps<{
    id: string;
    type: string;
    number: string;
    balance: string | number;
    isLoading?: boolean;
    isBalanceRefreshing?: boolean;
  }>();
  const emit = defineEmits<{
    (event: "refresh-balance"): void;
  }>();

  const { t } = useI18n({ useScope: "global" });
  const refreshBalanceTitle = computed(() => {
    const translated = t("cabinet.accounts.refreshBalance");
    return translated === "cabinet.accounts.refreshBalance" ? "Refresh balance" : translated;
  });

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
      refreshable: true,
    },
  ]);
</script>

<template>
  <div class="account-overview">
    <div class="account-overview__list">
      <article
        v-for="row in accountOverviewRows"
        :key="row.key"
        class="account-overview__row"
        :class="row.highlighted ? 'is-highlighted' : ''">
        <UiTextSmall class="account-overview__label">
          {{ row.label }}
        </UiTextSmall>

        <div
          v-if="!props.isLoading"
          class="account-overview__value-wrap">
          <div class="account-overview__value">
            {{ row.value }}
          </div>
          <button
            v-if="row.refreshable"
            type="button"
            class="account-overview__refresh-btn"
            :disabled="!!props.isBalanceRefreshing"
            :title="refreshBalanceTitle"
            @click.stop="emit('refresh-balance')">
            <UiIconUpdate
              class="h-[14px] w-[14px]"
              :spinning="!!props.isBalanceRefreshing" />
          </button>
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

  .account-overview__list {
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-card) 65%, transparent);
    overflow: hidden;
  }

  .account-overview__row {
    padding: 12px;
    min-height: 56px;
    display: grid;
    grid-template-columns: minmax(80px, 140px) minmax(0, 1fr);
    align-items: center;
    gap: 8px 12px;
    border-bottom: 1px solid var(--color-stroke-ui-light);
  }

  .account-overview__row:last-child {
    border-bottom: none;
  }

  .account-overview__row.is-highlighted {
    background: color-mix(in srgb, var(--ui-primary-main) 12%, var(--ui-background-card));
  }

  .account-overview__label {
    color: var(--ui-text-secondary);
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .account-overview__value-wrap {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .account-overview__value {
    min-width: 0;
    color: var(--ui-text-main);
    font-size: 17px;
    line-height: 1.25;
    font-weight: 700;
    text-align: right;
    word-break: break-word;
  }

  .account-overview__refresh-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: var(--ui-text-main);
    padding: 0;
    cursor: pointer;
  }

  .account-overview__refresh-btn:disabled {
    cursor: default;
    opacity: 0.6;
  }

  .account-overview__loader {
    color: var(--ui-text-main);
    justify-self: end;
  }

  @media (max-width: 640px) {
    .account-overview__row {
      grid-template-columns: 1fr;
      padding: 10px;
      gap: 6px;
    }

    .account-overview__value-wrap {
      justify-content: flex-start;
    }

    .account-overview__value {
      font-size: 16px;
      text-align: left;
    }
  }
</style>
