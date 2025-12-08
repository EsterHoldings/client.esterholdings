<script setup lang="ts">
import PanelDefault from "~/components/block/panels/PanelDefault.vue";

const props = defineProps<{ plain?: boolean }>();
</script>

<template>
  <div>
    <div class="mb-5 flex w-full items-center justify-between gap-5">
      <slot name="top" />
    </div>

    <PanelDefault v-if="!props.plain">
      <div>
        <slot name="content" />
      </div>
    </PanelDefault>
    <div v-else>
      <slot name="content" />
    </div>
  </div>
</template>
