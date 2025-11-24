<script setup lang="ts">
import PanelDefault from '~/components/block/panels/PanelDefault.vue'
</script>

<template>
  <div>
    <div class="mb-5 w-full flex justify-between items-center gap-5">
      <slot name="top" />
    </div>

    <PanelDefault>
      <div>
        <slot name="content" />
      </div>
    </PanelDefault>
  </div>
</template>

<style scoped lang="scss">
</style>
