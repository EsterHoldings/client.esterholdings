<template>
  <ul
    ref="menuRef"
    class="cabinet-sidebar-menu w-full p-3 lg:p-0 flex flex-row items-start justify-evenly gap-0 lg:flex-col lg:justify-start lg:gap-1">
    <li
      class="cabinet-sidebar-menu__indicator"
      :style="indicatorStyle"
      aria-hidden="true"></li>
    <CabinetSidebarMenuItem
      v-for="menuItem in menuItems"
      :key="menuItem.title"
      :title="menuItem.title"
      :to="menuItem.to"
      :icon="menuItem.icon"
      :notificationsCount="menuItem.notificationsCount ?? null"
      :sideBarIsOpen="sideBarIsOpen"
      :registerItemRef="registerItemRef"
      :useExternalActiveHighlight="true"
      @click="handleClickMenuItem" />

    <UiSpacer />

    <CabinetSidebarMenuItem
      v-for="menuItem in secondMenuItems"
      :key="menuItem.title"
      :title="menuItem.title"
      :to="menuItem.to"
      :icon="menuItem.icon"
      :sideBarIsOpen="sideBarIsOpen"
      :notificationsCount="menuItem.notificationsCount ?? null"
      :registerItemRef="registerItemRef"
      :useExternalActiveHighlight="true"
      @click="handleClickMenuItem" />
  </ul>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { useI18n } from "vue-i18n";

  import CabinetSidebarMenuItem from "~/components/block/CabinetSidebarMenuItem.vue";
  import UiIconHome from "~/components/ui/UiIconHome.vue";
  import UiIconUser from "~/components/ui/UiIconUser.vue";
  import UiIconReferral from "~/components/ui/UiIconReferral.vue";
  import UiIconSupport from "~/components/ui/UiIconSupport.vue";
  import UiIconPayment from "~/components/ui/UiIconPayment.vue";
  import UiIconPaymentDetail from "~/components/ui/UiIconPaymentDetail.vue";
  import UiIconSetting from "~/components/ui/UiIconSetting.vue";
  import UiSpacer from "~/components/ui/UiSpacer.vue";

  const props = withDefaults(
    defineProps<{
      supportUnreadCount?: number;
      billingNotificationsCount?: number;
      verificationNotificationsCount?: number;
    }>(),
    {
      supportUnreadCount: 0,
      billingNotificationsCount: 0,
      verificationNotificationsCount: 0,
    }
  );

  const { locale, t } = useI18n({ useScope: "global" });
  const addCurrentLocaleToPath = (path = "") => `/${locale.value}/${path}`;

  const router = useRouter();
  const route = useRoute();
  const sideBarIsOpen = ref(true);
  const dashboardRootPath = computed(() => `/${locale.value}`);
  const menuRef = ref<HTMLElement | null>(null);
  const itemRefs = reactive<Record<string, HTMLElement | null>>({});
  const indicatorStyle = ref<Record<string, string>>({
    opacity: "0",
    transform: "translate3d(0, 0, 0)",
  });

  const menuItems = computed(() => [
    { title: t("cabinet.menu.dashboard"), to: dashboardRootPath.value, icon: UiIconHome },
    { title: t("cabinet.menu.accounts"), to: addCurrentLocaleToPath("accounts"), icon: UiIconUser },
    {
      title: t("cabinet.menu.billing"),
      to: addCurrentLocaleToPath("payments"),
      icon: UiIconPayment,
      notificationsCount: props.billingNotificationsCount,
    },
    {
      title: t("cabinet.menu.payment_details"),
      to: addCurrentLocaleToPath("payments/details"),
      icon: UiIconPaymentDetail,
    },
    { title: t("cabinet.menu.referral_system"), to: addCurrentLocaleToPath("referrals"), icon: UiIconReferral },
  ]);

  const secondMenuItems = computed(() => [
    {
      title: t("cabinet.menu.support"),
      to: addCurrentLocaleToPath("support"),
      icon: UiIconSupport,
      notificationsCount: props.supportUnreadCount,
    },
    {
      title: t("cabinet.menu.profile_verification"),
      to: addCurrentLocaleToPath("profile"),
      icon: UiIconUser,
      notificationsCount: props.verificationNotificationsCount,
    },
    {
      title: t("cabinet.menu.settings"),
      to: addCurrentLocaleToPath("settings"),
      icon: UiIconSetting,
    },
  ]);

  const allMenuItems = computed(() => [...menuItems.value, ...secondMenuItems.value]);

  const isItemPathActive = (targetPath: string): boolean => {
    const currentPath = String(route.path ?? "");
    return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
  };

  const resolveActiveTargetPath = (): string => {
    const matches = allMenuItems.value
      .map(item => String(item.to ?? ""))
      .filter(Boolean)
      .filter(isItemPathActive)
      .sort((left, right) => right.length - left.length);

    return matches[0] ?? "";
  };

  const registerItemRef = (path: string, el: HTMLElement | null) => {
    itemRefs[path] = el;
    void updateIndicator();
  };

  const updateIndicator = async () => {
    await nextTick();

    const container = menuRef.value;
    const activePath = resolveActiveTargetPath();
    const activeItem = activePath ? itemRefs[activePath] : null;

    if (!container || !activeItem) {
      indicatorStyle.value = {
        ...indicatorStyle.value,
        opacity: "0",
      };
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const top = itemRect.top - containerRect.top;
    const left = itemRect.left - containerRect.left;

    indicatorStyle.value = {
      opacity: "1",
      width: `${itemRect.width}px`,
      height: `${itemRect.height}px`,
      transform: `translate3d(${left}px, ${top}px, 0)`,
    };
  };

  const handleClickMenuItem = (to: string) => {
    router.push(to);
  };

  const handleWindowResize = () => {
    void updateIndicator();
  };

  watch(
    () => route.fullPath,
    () => {
      void updateIndicator();
    },
    { immediate: true }
  );

  watch(
    () => allMenuItems.value.map(item => item.to).join("|"),
    () => {
      void updateIndicator();
    }
  );

  onMounted(() => {
    window.addEventListener("resize", handleWindowResize, { passive: true });
    void updateIndicator();
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleWindowResize);
  });
</script>

<style scoped>
  .cabinet-sidebar-menu {
    position: relative;
    isolation: isolate;
  }

  .cabinet-sidebar-menu__indicator {
    list-style: none;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 32%, transparent);
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--ui-primary-main) 28%, transparent) 0%,
        color-mix(in srgb, var(--ui-primary-main) 12%, transparent) 100%
      );
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, white 38%, transparent),
      0 12px 30px -24px color-mix(in srgb, var(--ui-primary-main) 58%, transparent);
    backdrop-filter: blur(18px) saturate(1.08);
    transition:
      transform 0.28s ease,
      width 0.28s ease,
      height 0.28s ease,
      opacity 0.18s ease;
    pointer-events: none;
  }

  .cabinet-sidebar-menu :deep(li) {
    z-index: 1;
  }
</style>
