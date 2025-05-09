<template>
  <header class="header">
    <NuxtLink to="/"><UiIconLogo /></NuxtLink>
  </header>
</template>

<script lang="ts" setup>
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
</script>

<style scoped lang="scss">
.router-link-exact-active {
  color: red;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 40, 0.05);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
</style>
