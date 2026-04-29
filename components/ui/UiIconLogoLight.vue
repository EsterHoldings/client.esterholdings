<template>
  <UiIconLogo class="logo-light" />
</template>

<script setup lang="ts">
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
</script>

<style lang="scss" scoped>
.logo-light {
  display: block;
  filter: brightness(0) saturate(100%);
}
</style>
