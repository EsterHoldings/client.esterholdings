<template>
  <div class="header-mobile">
    <div
      class="header__link"
      :class="{ header__link_active: props.linkKey === props.activeLink }">
      <UiTextH5>{{ props.name }}</UiTextH5>

      <UiIconChevronUp v-if="props.linkKey === props.activeLink" />
      <UiIconChevronDown v-else />
    </div>

    <div class="header__underline"></div>

    <TradingMenu
      :activeLink="props.activeLink"
      isMobile
      class="header-mobile_menu"
      v-if="props.linkKey === props.activeLink && props.linkKey === 'Trading'" />

    <PartnershipMenu
      :activeLink="props.activeLink"
      isMobile
      class="header-mobile_menu"
      v-if="props.linkKey === props.activeLink && props.linkKey === 'Partnership'" />

    <CompanyMenu
      :activeLink="props.activeLink"
      isMobile
      class="header-mobile_menu"
      v-if="props.linkKey === props.activeLink && props.linkKey === 'Company'" />
  </div>
</template>

<script setup>
  import UiIconChevronDown from "~/components/ui/UiIconChevronDown.vue";
  import UiIconChevronUp from "~/components/ui/UiIconChevronUp.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import TradingMenu from "./TradingMenu.vue";
  import PartnershipMenu from "./PartnershipMenu.vue";
  import CompanyMenu from "./CompanyMenu.vue";

  const props = defineProps({
    name: String,
    linkKey: String,
    headerItems: {
      type: Object,
      default: () => ({}),
    },
    activeLink: String,
  });
</script>

<style lang="scss" scoped>
  .header__link {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    width: 100%;
    color: #101010;
    text-decoration: none;
    padding-bottom: 22px;
    text-align: right;

    :deep(.h5) {
      font-size: 32px;
      line-height: 1.05;
      font-weight: 500;
      color: inherit;
    }

    :deep(svg) {
      width: 34px;
      height: 34px;
      color: inherit;
    }

    &:hover {
      color: #0051ff;
    }

    &_active {
      color: #0051ff;
    }
  }

  .header__underline {
    display: none;
  }

  .header-mobile_menu {
    :deep(.menu-mobile) {
      align-items: flex-end;
      gap: 0;
      padding-top: 0;
    }

    :deep(.menu-category) {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    :deep(.menu-category_title_mobile) {
      display: none;
    }

    :deep(.menu-category_link_mobile) {
      margin-bottom: 18px;
      padding-left: 0;
      text-align: right;
      color: #1a1a1a;
      font-size: 38px;
      line-height: 1.2;
      font-weight: 700;

      a {
        display: inline-block;
      }
    }

    :deep(.menu-category_link_mobile:last-child) {
      margin-bottom: 0;
    }
  }
</style>
