<template>
  <div class="footer__wrapper">
    <UiContainer>
      <footer class="footer">
          <UiTextSmall>Copyright © Ester Holdings Inc. All rights reserved</UiTextSmall>
      </footer>
    </UiContainer>
  </div>
</template>

<script lang="ts" setup>
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
</script>

<style lang="scss" scoped>
.footer {
  color: var(--ui-text-main);
  padding: 0 20px;

  width: 100%;
  height: 100px;

  display: flex;
  align-items: center;
  justify-content: center;

  &__wrapper {
    padding-left: 100px;
  }
}
</style>
