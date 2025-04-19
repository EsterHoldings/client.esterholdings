<template>
    <ul class="side-bar-cabinet__menu">
      <TheCabinetSideBarMenuItem
          v-for="menuItem in menuItems"
          :title="menuItem.title"
          :to="menuItem.to"
          :icon="menuItem.icon"
          :sideBarIsOpen="sideBarIsOpen"
          :key="menuItem.title"
          @click="handleClickMenuItem"
      />
    </ul>
</template>

<script lang="ts" setup>
import TheCabinetSideBarMenuItem from "~/components/block/TheCabinetSideBarMenuItem.vue";
import UiIconHome from "~/components/ui/UiIconHome.vue";
import UiIconClients from "~/components/ui/UiIconClients.vue";
import UiIconUser from "~/components/ui/UiIconUser.vue";
import UiIconReferral from "~/components/ui/UiIconReferral.vue";
import UiIconProfile from "~/components/ui/UiIconProfile.vue";
import UiIconSetting from "~/components/ui/UiIconSetting.vue";
import UiIconKeys from "~/components/ui/UiIconKeys.vue";

import {ref} from "vue";
import {useRouter} from "vue-router";
import UiIconSupport from "~/components/ui/UiIconSupport.vue";
import UiIconPayment from "~/components/ui/UiIconPayment.vue";

const router = useRouter();
const sideBarIsOpen = ref(true)
const menuItems = [
  {
    title: 'Dashboard',
    to: '/dashboard',
    icon: UiIconHome,
  },
  {
    title: 'Payment details',
    to: '/payments/details',
    icon: UiIconClients,
  },
  {
    title: 'Accounts',
    to: '/accounts',
    icon: UiIconUser,
  },
  {
    title: 'Referral system',
    to: '/referrals',
    icon: UiIconReferral,
  },
  {
    title: 'Billing',
    to: '/payments',
    icon: UiIconPayment,
  },
  {
    title: 'Settings',
    to: '/settings',
    icon: UiIconSetting,
  },
  {
    title: 'Support',
    to: '/support',
    icon: UiIconSupport,
  }
];

const handleClickMenuItem = (to: string) => {
  router.push(to);
};
</script>

<style lang="scss" scoped>
.side-bar-cabinet {
  &__menu {
    width: 100%;
  }
}
</style>
