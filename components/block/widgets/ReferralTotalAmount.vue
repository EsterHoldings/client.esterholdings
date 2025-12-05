<script setup lang="ts">
import UiIconWithdraw from "~/components/ui/UiIconWithdraw.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiIconPayment from "~/components/ui/UiIconPayment.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
</script>

<template>
  <PanelDefault class="p-4 relative">
    <div class="flex flex-col justify-center items-center w-full h-full">
      <div class="flex flex-col justify-center items-center w-full">
        <UiTextSmall class="!text-[var(--color-success)]">Referral total amount</UiTextSmall>
        <UiTextH3 class="!text-[var(--color-success)]">$ 24.00</UiTextH3>
      </div>
      <div class="absolute right-2 top-2 flex items-center justify-center gap-2 px-1">
        <UiIconWithdraw class="text-[var(--ui-text-main)] !w-[16px] !h-[16px] !hover:text-[red]" />
        <UiIconPayment class="text-[var(--ui-text-main)] !w-[16px] !h-[16px] !hover:text-[red]" />
      </div>
    </div>
  </PanelDefault>
</template>

<style scoped lang="scss">

</style>

