<script setup lang="ts">
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiIconClients from "~/components/ui/UiIconClients.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
</script>

<template>
<PanelDefault class="p-4 relative">
  <div class="flex flex-col justify-center items-center w-full h-full">
    <div class="flex flex-col justify-center items-center w-full">
      <UiTextSmall class="!text-[var(--color-success)]">Total amount</UiTextSmall>
      <UiTextH3 class="!text-[var(--color-success)]">$ 4 292.00</UiTextH3>
    </div>
    <div class="absolute right-2 top-2 flex items-center justify-center gap-2 px-1">
      <UiIconClients class="!h-[16px] !w-[16px]" />
    </div>
  </div>
</PanelDefault>
</template>

<style scoped lang="scss">

</style>