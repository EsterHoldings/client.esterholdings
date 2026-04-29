<script setup lang="ts">
  import UiContainer from "~/components/ui/UiContainer.vue";
</script>

<template>
  <UiContainer>
    <div class="mt-5 mb-6 flex w-full items-center justify-between sm:mt-6 sm:mb-6">
      <slot name="header" />
    </div>

    <slot name="content" />
  </UiContainer>
</template>
