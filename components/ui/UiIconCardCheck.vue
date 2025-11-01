<template>
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      opacity="0.2"
      d="M13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26Z"
      :fill="isRecommended ? '#F75709' : '#1B63FF'" />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13 6L19.0622 9.5V16.5L13 20L6.93782 16.5V9.5L13 6Z"
      :stroke="isRecommended ? '#F75709' : '#224DDA'"
      stroke-width="2" />
  </svg>
</template>

<script setup lang="ts">
  interface Props {
    isRecommended?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    isRecommended: false,
  });
</script>
