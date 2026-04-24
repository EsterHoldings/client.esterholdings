<template>
  <UiContainer>
    <div>
      <div class="mb-5 flex items-center justify-between gap-3">
        <UiTextH4 class="text-[var(--ui-text-main)]">
          {{ t("cabinet.menu.profile_verification") }}
        </UiTextH4>

        <span
          v-if="profileInfoHeaderLabel"
          class="shrink-0 text-right text-[13px] font-medium"
          :class="{
            'text-[var(--ui-text-secondary)]': profileInfoHeaderState === 'initial',
            'text-[var(--color-warning)]': profileInfoHeaderState === 'pending',
            'text-[var(--color-success)]': profileInfoHeaderState === 'approved',
            'text-[var(--color-danger)]': profileInfoHeaderState === 'rejected',
          }">
          {{ profileInfoHeaderLabel }}
        </span>
      </div>

      <PanelDefault>
        <div class="p-5">
          <TabGeneral @profile-info-status-change="handleProfileInfoStatusChange" />
        </div>
      </PanelDefault>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref, watch } from "vue";
  import { definePageMeta, navigateTo, useLocalePath, useRoute } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";

  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import TabGeneral from "~/pages/profile/components/TabGeneral.vue";

  definePageMeta({
    layout: "cabinet",
    middleware: ["auth-client", "client-check-auth"],
  });

  type ProfileInfoVerificationState = "initial" | "pending" | "approved" | "rejected";

  const { t } = useI18n();
  const route = useRoute();
  const localePath = useLocalePath();
  const profileInfoHeaderState = ref<ProfileInfoVerificationState>("initial");
  const profileInfoHeaderLabel = ref("");

  const needsSettingsRedirect = computed(() => {
    const key = String(route.query?.tab ?? "")
      .trim()
      .toLowerCase();

    return ["security", "password", "change_password"].includes(key);
  });

  const redirectToSettings = async (): Promise<void> => {
    if (!needsSettingsRedirect.value) {
      return;
    }

    await navigateTo(localePath({ path: "/settings" }), { replace: true });
  };

  onMounted(async () => {
    await redirectToSettings();
  });

  watch(
    () => route.query?.tab,
    async () => {
      await redirectToSettings();
    }
  );

  const handleProfileInfoStatusChange = (payload: { state: ProfileInfoVerificationState; label: string }) => {
    profileInfoHeaderState.value = payload.state;
    profileInfoHeaderLabel.value = payload.label;
  };
</script>
