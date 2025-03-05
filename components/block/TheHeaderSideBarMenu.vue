<template>
  <nav class="nav">
    <ul class="nav-menu">
      <TheHeaderSideBarMenuItem
          v-for="menuItem in menuItems"
          :title="menuItem.title"
          :to="menuItem.to"
          :icon="menuItem.icon"
          :sideBarIsOpen="sideBarIsOpen"
          :key="menuItem.title"
          @click="handleClickMenuItem"
      >{{ menuItem.icon }}</TheHeaderSideBarMenuItem>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import TheHeaderSideBarMenuItem from "~/components/block/TheHeaderSideBarMenuItem.vue";

import UiIconHome from "~/components/ui/UiIconHome.vue";
import UiIconClients from "~/components/ui/UiIconClients.vue";
import UiIconUser from "~/components/ui/UiIconUser.vue";
import UiIconReferral from "~/components/ui/UiIconReferral.vue";
import UiIconProfile from "~/components/ui/UiIconProfile.vue";
import UiIconSetting from "~/components/ui/UiIconSetting.vue";
import UiIconKeys from "~/components/ui/UiIconKeys.vue";

import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  sideBarIsOpen: {
    type: Boolean,
    default: false
  }
})

const menuItems = [
  {
    title: 'Dashboard',
    to: '/admin/dashboard',
    icon: UiIconHome
  },
  {
    title: 'Clients',
    to: '/admin/clients',
    icon: UiIconClients
  },
  {
    title: 'Accounts',
    to: '/admin/accounts',
    icon: UiIconUser
  },
  {
    title: 'Referral system',
    to: '/admin/referral',
    icon: UiIconReferral
  },
  {
    title: 'Profile',
    to: '/admin/profile',
    icon: UiIconProfile
  },
  {
    title: 'Settings',
    to: '/admin/settings',
    icon: UiIconSetting
  },
  {
    title: 'Access',
    to: '/admin/access',
    icon: UiIconKeys
  },
];

const handleClickMenuItem = (to: string) => {
  router.push(to);
};
</script>

<style scoped lang="scss">
.nav {
  min-height: calc(100vh - 141px);
}
</style>
