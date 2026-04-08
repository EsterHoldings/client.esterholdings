<template>
  <div class="logo-light">
    <img
      class="logo-light__symbol"
      src="/brand/logo-symbol-flat.png"
      alt="Ester Holdings symbol" />
    <img
      class="logo-light__wordmark"
      src="/brand/logo-wordmark-flat.png"
      alt="Ester Holdings" />
  </div>
</template>

<style scoped lang="scss">
  .logo-light {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    width: 100%;
    max-width: 114px;
    min-width: 0;
  }

  .logo-light__symbol,
  .logo-light__wordmark {
    display: block;
    flex-shrink: 0;
    filter: brightness(0);
  }

  .logo-light__symbol {
    width: 30px;
    height: auto;
  }

  .logo-light__wordmark {
    width: 74px;
    height: auto;
  }
</style>
