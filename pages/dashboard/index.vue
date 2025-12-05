<template>
  <UiContainer>
    <div class="pb-10 text-white">
      <div class="mb-6">
        <UiTextH4 class="text-[var(--ui-text-main)]">
          {{ t("cabinet.dashboard.title") }}
        </UiTextH4>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div class="col-span-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <TotalAmountWidget />
          <PendingTransactionsWidget />
          <MissedNotificationsWidget />
          <ReferralTotalAmount />
        </div>

        <!-- Статус верификации -->
        <PanelDefault class="col-span-1">
          <div class="rounded-2xl p-[1.6rem]">
            <div class="mb-4 flex items-center justify-between gap-4">
              <div>
                <div class="text-[18px] font-semibold text-[var(--ui-text-main)]">
                  {{ t("cabinet.dashboard.accountVerification.title") }}
                </div>
                <div class="text-sm text-[var(--ui-text-secondary)]">
                  {{ t("cabinet.dashboard.accountVerification.subtitle") }}
                </div>
              </div>

              <div class="flex items-center justify-end">
                <div class="flex flex-col mr-3">
                  <UiTextH5 class="flex justify-end items-center">Test User</UiTextH5>
                  <UiTextParagraph class="flex justify-end items-center">
                    <strong>test@gmail.com</strong>
                  </UiTextParagraph>
                  <UiTextSmall class="flex justify-end items-center">10.05.1993</UiTextSmall>
                </div>
                <NuxtLink to="/profile">
                  <UiImageCircle
                      :twoChars="'TU'"
                      :src="''"
                  />
                </NuxtLink>
              </div>
            </div>

            <ul class="mt-3 mb-5 list-none p-0 text-sm text-[var(--ui-text-secondary)]">
              <li class="flex h-[35px] items-center justify-start">
                <span class="w-28 shrink-0"></span>
                <UiIconFailed />
                <span class="ml-5">{{ t("cabinet.dashboard.accountVerification.addressFailed") }}</span>
              </li>

              <li class="flex h-[35px] items-center justify-start">
                <span class="w-28 shrink-0">Документы</span>
                <UiIconSuccess />
                <span class="ml-5">{{ t("cabinet.dashboard.accountVerification.documentVerified") }}</span>
              </li>

              <li class="flex h-[35px] items-center justify-start">
                <span class="w-28 shrink-0">1-й Депозит</span>
                <UiIconWarning />
                <span class="ml-5">{{ t("cabinet.dashboard.accountVerification.paymentInProgress") }}</span>
              </li>

              <li class="flex h-[35px] items-center justify-start">
                <span class="w-28 shrink-0">Профиль</span>
                <UiIconWarning />
                <span class="ml-5">{{ t("cabinet.dashboard.accountVerification.profileInProgress") }}</span>
              </li>
            </ul>
          </div>
        </PanelDefault>

        <!-- Краткий список аккаунтов или избранные (не более 5 шт.) -->
        <div class="col-span-2">
          <PanelDefault>
            <div class="rounded-2xl p-[1.6rem]">
              <div class="mb-5 flex items-center justify-between gap-4">
                <div class="text-[18px] font-semibold text-[var(--ui-text-main)]">
                  {{ t("cabinet.dashboard.mt4.title") }}
                </div>

                <div>
                  <NuxtLink to="/accounts">
                    <UiButtonDefault state="primary">
                      {{ t("cabinet.dashboard.mt4.openNewAccount") }}
                    </UiButtonDefault>
                  </NuxtLink>
                </div>
              </div>

              <table class="w-full border-collapse text-sm text-white">
                <thead>
                <tr>
                  <th class="pb-2 text-left font-normal text-[var(--ui-text-secondary)]">
                    {{ t("cabinet.dashboard.mt4.table.account") }}
                  </th>
                  <th class="pb-2 text-left font-normal text-[var(--ui-text-secondary)]">
                    {{ t("cabinet.dashboard.mt4.table.type") }}
                  </th>
                  <th class="pb-2 text-left font-normal text-[var(--ui-text-secondary)]">
                    {{ t("cabinet.dashboard.mt4.table.balance") }}
                  </th>
                  <th class="pb-2 text-left font-normal text-[var(--ui-text-secondary)]">
                    {{ t("cabinet.dashboard.mt4.table.status") }}
                  </th>
                </tr>
                </thead>

                <tbody>
                <tr>
                  <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)]">123456</td>
                  <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)]">Real</td>
                  <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)]">$5,000.00</td>
                  <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)]">
                      <span class="font-medium text-[#1cbf73]">
                        {{ t("cabinet.dashboard.mt4.table.active") }}
                      </span>
                  </td>
                </tr>

                <tr>
                  <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)]">234567</td>
                  <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)]">Real</td>
                  <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)]">$5,000.00</td>
                  <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)]">
                      <span class="font-medium text-[#1cbf73]">
                        {{ t("cabinet.dashboard.mt4.table.active") }}
                      </span>
                  </td>
                </tr>

                <tr>
                  <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)]">345678</td>
                  <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)]">Demo</td>
                  <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)]">$10,000.00</td>
                  <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)]">
                      <span class="font-medium text-[#a3aed0]">
                        {{ t("cabinet.dashboard.mt4.table.inactive") }}
                      </span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </PanelDefault>
        </div>

        <!-- Список транзакций (Сортировка от новых к старым, и сначала всегда идут те транзакции которые в обработке) -->
        <TransactionsWidget class="col-span-2" />
      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import { definePageMeta } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";
import { onBeforeUnmount, onMounted } from "vue";
import { useNuxtApp } from "nuxt/app";

import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiIconFailed from "~/components/ui/UiIconFailed.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";

import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import TransactionsWidget from "~/components/block/widgets/TransactionsWidget.vue";
import TotalAmountWidget from "~/components/block/widgets/TotalAmountWidget.vue";
import PendingTransactionsWidget from "~/components/block/widgets/PendingTransactionsWidget.vue";
import MissedNotificationsWidget from "~/components/block/widgets/MissedNotificationsWidget.vue";
import ReferralTotalAmount from "~/components/block/widgets/ReferralTotalAmount.vue";
import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";

definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

const { t } = useI18n({ useScope: "global" });
const { $echo } = useNuxtApp();

onMounted(() => {
  // @ts-ignore
  const sub = (window as any).Echo?.channel("test") ?? $echo.channel("test");
  sub.listen(".Ping", (e: any) => {
    console.log("[TEST] Ping received:", e);
  });
});

onBeforeUnmount(() => {
  try {
    // @ts-ignore
    $echo.leave("test");
  } catch {}
});
</script>
