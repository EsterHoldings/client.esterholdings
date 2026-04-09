<template>
  <div class="verification-widget dashboard-side-widget text-[var(--ui-text-main)]">
    <div class="verification-header-card">
      <div class="verification-header-card__left">
        <div class="verification-title-row">
          <div class="verification-title">
            {{ t("cabinet.dashboard.accountVerification.title") }}
          </div>
          <UiInfoHint
            :label="t('cabinet.dashboard.accountVerification.tooltipLabel')"
            :content="summaryText" />
        </div>
      </div>

      <div class="verification-profile">
        <UiImageCircle
          :twoChars="initials"
          :src="photoUrl" />
      </div>
    </div>

    <div class="verification-progress-card">
      <div class="verification-progress-card__top">
        <span class="verification-progress-card__count">{{ verifiedCountText }}</span>
        <span class="verification-progress-card__percent">{{ verificationProgressPercent }}%</span>
      </div>

      <div
        class="verification-progress-bar"
        :aria-label="verifiedCountText">
        <span
          class="verification-progress-bar__fill"
          :style="{ width: `${verificationProgressPercent}%` }"></span>
      </div>
    </div>

    <div class="verification-list-wrap">
      <div
        v-if="isLoading"
        class="verification-list">
        <div
          v-for="idx in 5"
          :key="idx"
          class="verification-step verification-step--skeleton animate-pulse">
          <div class="h-8 w-8 rounded-lg bg-[var(--color-stroke-ui-light)]"></div>
          <div class="flex-1 min-w-0 space-y-2">
            <div class="h-3 w-24 rounded bg-[var(--color-stroke-ui-light)]"></div>
            <div class="h-3 w-20 rounded bg-[var(--color-stroke-ui-light)]"></div>
          </div>
          <div class="h-5 w-20 rounded bg-[var(--color-stroke-ui-light)]"></div>
        </div>
      </div>

      <div
        v-else
        class="verification-list">
        <div
          v-for="step in orderedSteps"
          :key="step.key"
          class="verification-step">
          <button
            type="button"
            class="verification-step__button"
            @click="handleOpenStep(step.key)">
            <div
              class="verification-step__icon"
              :class="step.stateClass">
              <component
                :is="step.icon"
                class="verification-step__icon-svg" />
            </div>

            <div class="verification-step__meta">
              <div class="verification-step__title-row">
                <div
                  class="verification-step__title"
                  :title="step.title">
                  {{ step.title }}
                </div>
                <div class="verification-step__status verification-step__status--inline">
                  <span
                    class="verification-step__status-dot"
                    :class="step.stateClass"></span>
                  {{ step.statusLabel }}
                </div>
              </div>
              <div
                v-if="step.comment"
                class="verification-step__comment">
                {{ step.comment }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, inject, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { navigateTo, useLocalePath } from "~/.nuxt/imports";

  import CreateNewDeposit from "~/pages/payments/create/index.vue";
  import UiImageCircle from "~/components/ui/UiImageCircle.vue";
  import UiInfoHint from "~/components/ui/UiInfoHint.vue";
  import UiIconProfile from "~/components/ui/UiIconProfile.vue";
  import UiIconMails from "~/components/ui/UiIconMails.vue";
  import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
  import UiIconPayment from "~/components/ui/UiIconPayment.vue";

  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { useAuthStore } from "~/stores/authStore";

  type VerificationStatus = "pending" | "approved" | "rejected";
  type VerificationStepKey = "profile" | "email" | "documents" | "deposit";

  const { t } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const appCore = useAppCore();
  const authStore = useAuthStore();
  const modalControl = inject("modalControl") as { openModal?: Function } | undefined;

  const isLoading = ref(false);
  const verificationRequestData = reactive<Record<string, any>>({});

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const photoUrl = computed(() => authStore.photoUrl || "");
  const initials = computed(() => {
    const user = authStore.user;
    const first = user?.first_name?.[0] || "";
    const last = user?.last_name?.[0] || "";
    const value = `${first}${last}`.toUpperCase();
    return value.length ? value : "U";
  });

  const emailStatus = ref<VerificationStatus>("pending");
  const infoStatus = ref<VerificationStatus>("pending");
  const documentsStatus = ref<VerificationStatus>("pending");
  const depositStatus = ref<VerificationStatus>("pending");

  const normalizeStatus = (value: unknown, fallback: VerificationStatus): VerificationStatus => {
    if (typeof value !== "string") return fallback;
    const normalized = value.trim().toLowerCase();
    if (["approved", "done", "success", "verified"].includes(normalized)) return "approved";
    if (["rejected", "failed", "declined", "required"].includes(normalized)) return "rejected";
    return "pending";
  };

  const statusLabel = (status: VerificationStatus): string => {
    if (status === "approved") return resolveText("cabinet.dashboard.accountVerification.statuses.done", "Done");
    if (status === "rejected")
      return resolveText("cabinet.dashboard.accountVerification.statuses.required", "Required");
    return resolveText("cabinet.dashboard.accountVerification.statuses.inProgress", "In progress");
  };

  const stateClass = (status: VerificationStatus): "success" | "warning" | "danger" => {
    if (status === "approved") return "success";
    if (status === "rejected") return "danger";
    return "warning";
  };

  const getComment = (key: string): string => {
    const raw = verificationRequestData?.[key]?.comment;
    if (typeof raw !== "string") return "";
    return raw.trim();
  };

  const allSteps = computed(() => [
    {
      key: "profile" as VerificationStepKey,
      title: resolveText("cabinet.dashboard.accountVerification.steps.profile", "Profile data"),
      status: infoStatus.value,
      statusLabel: statusLabel(infoStatus.value),
      stateClass: stateClass(infoStatus.value),
      comment: getComment("info"),
      icon: UiIconProfile,
    },
    {
      key: "email" as VerificationStepKey,
      title: resolveText("cabinet.dashboard.accountVerification.steps.email", "Email verification"),
      status: emailStatus.value,
      statusLabel: statusLabel(emailStatus.value),
      stateClass: stateClass(emailStatus.value),
      comment: getComment("email"),
      icon: UiIconMails,
    },
    {
      key: "documents" as VerificationStepKey,
      title: resolveText("cabinet.dashboard.accountVerification.steps.documents", "Documents"),
      status: documentsStatus.value,
      statusLabel: statusLabel(documentsStatus.value),
      stateClass: stateClass(documentsStatus.value),
      comment: getComment("documents"),
      icon: UiIconDocuments,
    },
    {
      key: "deposit" as VerificationStepKey,
      title: resolveText("cabinet.dashboard.accountVerification.steps.deposit", "First deposit"),
      status: depositStatus.value,
      statusLabel: statusLabel(depositStatus.value),
      stateClass: stateClass(depositStatus.value),
      comment: getComment("deposit"),
      icon: UiIconPayment,
    },
  ]);

  const statusPriority: Record<VerificationStatus, number> = {
    approved: 0,
    pending: 1,
    rejected: 2,
  };

  const keyPriority: Record<VerificationStepKey, number> = {
    profile: 0,
    email: 1,
    documents: 2,
    deposit: 3,
  };

  const orderedSteps = computed(() =>
    [...allSteps.value].sort((a, b) => {
      const byStatus = statusPriority[a.status] - statusPriority[b.status];
      if (byStatus !== 0) return byStatus;
      return keyPriority[a.key] - keyPriority[b.key];
    })
  );

  const totalCount = computed(() => allSteps.value.length);
  const approvedCount = computed(() => allSteps.value.filter(step => step.status === "approved").length);
  const isFullyVerified = computed(
    () => totalCount.value > 0 && allSteps.value.every(step => step.status === "approved")
  );

  const verifiedCountText = computed(() =>
    resolveText("cabinet.dashboard.accountVerification.verifiedCount", "Verified {done}/{total}")
      .replace("{done}", String(approvedCount.value))
      .replace("{total}", String(totalCount.value))
  );

  const verificationProgressPercent = computed(() => {
    if (totalCount.value === 0) {
      return 0;
    }

    return Math.round((approvedCount.value / totalCount.value) * 100);
  });

  const summaryText = computed(() => {
    if (isFullyVerified.value) {
      return resolveText("cabinet.dashboard.accountVerification.complete", "Account fully verified");
    }

    return resolveText("cabinet.dashboard.accountVerification.notComplete", "Account is not fully verified");
  });

  const handleDashboardRefresh = () => {
    loadVerificationData();
  };

  const tryOpenDepositModal = (): boolean => {
    if (!modalControl?.openModal) return false;

    modalControl.openModal(CreateNewDeposit, {
      title: t("cabinet.billing.create"),
      initialTab: "deposit",
    });

    return true;
  };

  const resolveStepRoute = (key: VerificationStepKey): { path: string; query?: Record<string, string> } => {
    if (key === "documents") {
      return { path: "/profile", query: { tab: "documents" } };
    }

    if (key === "deposit") {
      return { path: "/payments", query: { openDeposit: "1" } };
    }

    return { path: "/profile", query: { tab: "general" } };
  };

  const handleOpenStep = async (key: VerificationStepKey): Promise<void> => {
    if (key === "deposit" && tryOpenDepositModal()) return;

    const target = resolveStepRoute(key);
    await navigateTo(localePath({ path: target.path, query: target.query ?? {} }));
  };

  const loadVerificationData = async () => {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
      const response = await appCore.verifications.get();
      Object.assign(verificationRequestData, response.data.data);

      emailStatus.value = normalizeStatus(verificationRequestData.email?.verification_status, "pending");
      infoStatus.value = normalizeStatus(verificationRequestData.info?.verification_status, "pending");
      documentsStatus.value = normalizeStatus(verificationRequestData.documents?.verification_status, "pending");
      depositStatus.value = normalizeStatus(verificationRequestData.deposit?.verification_status, "pending");
    } finally {
      setTimeout(() => {
        isLoading.value = false;
      }, 250);
    }
  };

  onMounted(async () => {
    await loadVerificationData();
    useEventBus.on("dashboardRefresh", handleDashboardRefresh);
  });

  onBeforeUnmount(() => {
    useEventBus.off("dashboardRefresh", handleDashboardRefresh);
  });
</script>

<style scoped>
  .verification-widget {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
    border-radius: 14px;
    border: 0;
    background: var(--ui-background-panel);
    padding: 12px;
  }

  .dashboard-side-widget {
    --dashboard-side-widget-height: 100%;
    min-height: var(--dashboard-side-widget-height);
    height: var(--dashboard-side-widget-height);
  }

  .verification-header-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin: -12px -12px 0;
    padding: 12px;
    box-sizing: border-box;
    border-radius: 0;
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-main) 10%, transparent) 0%, transparent 70.44%),
      var(--ui-background-card);
  }

  .verification-header-card__left {
    min-width: 0;
  }

  .verification-title-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .verification-title {
    font-size: 17px;
    font-weight: 700;
    line-height: 1.1;
  }

  .verification-profile {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .verification-progress-card {
    border-radius: 12px;
    background: transparent;
    padding: 8px 0 2px;
  }

  .verification-progress-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .verification-progress-card__count,
  .verification-progress-card__percent {
    font-size: 12px;
    font-weight: 600;
    color: var(--ui-text-secondary);
  }

  .verification-progress-bar {
    margin-top: 8px;
    border-radius: 12px;
    overflow: hidden;
    height: 10px;
    background: color-mix(in srgb, var(--color-stroke-ui-light) 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-text-main) 10%, transparent);
  }

  .verification-progress-bar__fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--ui-primary-main) 82%, transparent) 0%,
      color-mix(in srgb, var(--color-success) 88%, transparent) 100%
    );
    transition: width 0.25s ease;
  }

  .verification-list-wrap {
    position: relative;
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .verification-list-wrap::after {
    content: "";
    position: absolute;
    left: 0;
    right: 4px;
    bottom: 0;
    height: 28px;
    pointer-events: none;
    z-index: 2;
    background: linear-gradient(180deg, transparent 0%, var(--ui-background-panel) 92%);
  }

  .verification-list {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    gap: 8px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;
    padding-bottom: 0;
  }

  .verification-step {
    border-radius: 12px;
    border: 0;
    background: transparent;
  }

  .verification-step__button {
    width: 100%;
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    align-items: flex-start;
    gap: 10px;
    border: 1px solid transparent;
    background: var(--ui-background-card);
    padding: 9px 12px;
    border-radius: 12px;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
    text-align: left;
    cursor: pointer;
  }

  .verification-step__button:hover {
    background: transparent;
    border-color: var(--color-stroke-ui-light);
  }

  .verification-step__button:focus-visible {
    outline: 1px solid var(--ui-primary-main);
    outline-offset: 1px;
  }

  .verification-step--skeleton {
    pointer-events: none;
  }

  .verification-step__icon {
    width: 28px;
    height: 28px;
    margin-top: 2px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: var(--ui-background-card);
    flex-shrink: 0;
  }

  .verification-step__icon-svg {
    width: 18px;
    height: 18px;
  }

  .verification-step__icon.success {
    color: var(--color-success);
  }

  .verification-step__icon.warning {
    color: var(--color-ui-warning);
  }

  .verification-step__icon.danger {
    color: var(--color-danger);
  }

  .verification-step__meta {
    min-width: 0;
    width: 100%;
  }

  .verification-step__title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .verification-step__title {
    font-size: 13px;
    font-weight: 700;
    color: var(--ui-text-main);
    line-height: 1.25;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .verification-step__status {
    font-size: 11px;
    color: var(--ui-text-secondary);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .verification-step__status--inline {
    margin-top: 0;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .verification-step__status-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
  }

  .verification-step__status-dot.success {
    background: var(--color-success);
  }

  .verification-step__status-dot.warning {
    background: var(--color-ui-warning);
  }

  .verification-step__status-dot.danger {
    background: var(--color-danger);
  }

  .verification-step__comment {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.3;
    color: var(--ui-text-secondary);
    white-space: normal;
    overflow-wrap: anywhere;
  }

  @media (max-width: 767px) {
    .verification-step__title-row {
      align-items: flex-start;
      flex-wrap: wrap;
    }
  }

  @media (min-width: 768px) {
    .verification-header-card {
      height: 64px;
    }
  }

  @media (max-width: 1023px) {
    .dashboard-side-widget {
      min-height: 0;
      height: auto;
    }

    .verification-list {
      height: auto;
      overflow: visible;
      padding-right: 0;
      padding-bottom: 0;
    }

    .verification-list-wrap::after {
      display: none;
    }
  }
</style>
