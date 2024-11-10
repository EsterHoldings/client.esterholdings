<template>
  <footer>
    <div class="footer">
      <UiTextH1>Logo</UiTextH1>
    </div>
  </footer>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
@import "@/assets/styles/variables";

footer {
  padding: 10px 0;

  .footer {
    border-radius: 10px;
    border: 1px solid #8b9ba4;

    width: 100%;
    height: 200px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
