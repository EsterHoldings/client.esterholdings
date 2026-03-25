<template>
  <svg
    viewBox="0 0 983 983"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_f_26_112)">
      <circle
        cx="491.5"
        cy="491.5"
        r="91.5"
        :fill="color" />
    </g>
    <defs>
      <filter
        id="filter0_f_26_112"
        x="0"
        y="0"
        width="983"
        height="983"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB">
        <feFlood
          flood-opacity="0"
          result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape" />
        <feGaussianBlur
          stdDeviation="200"
          result="effect1_foregroundBlur_26_112" />
      </filter>
    </defs>
  </svg>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{ color?: string }>(), { color: '#0052FE' })
</script>
