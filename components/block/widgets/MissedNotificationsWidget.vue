<script setup lang="ts">
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiIconBell from "~/components/ui/UiIconBell.vue";
</script>

<template>
  <PanelDefault class="p-4 relative">
    <div class="flex flex-col justify-center items-center w-full h-full">
      <div class="flex flex-col justify-center items-center w-full">
        <UiTextSmall class="!text-[var(--color-warning)] mb-3">Missed Notifications</UiTextSmall>
        <UiTextH3 class="!text-[var(--color-warning)] flex items-center justify-center gap-2 px-4">3</UiTextH3>
        <div class="absolute right-2 top-2 flex items-center justify-center gap-2 px-1">
          <UiIconBell class="!h-[16px] !w-[16px]" />
        </div>
      </div>
    </div>
  </PanelDefault>
</template>

<style scoped lang="scss">

</style>

