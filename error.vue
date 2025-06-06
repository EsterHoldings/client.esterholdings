<template>
  <div class="not-found">
    <h1 class="title">404</h1>

    <p class="message">Page not found</p>

    <UiButtonDefault state="primary">
      <NuxtLink to="/">Go back home</NuxtLink>
    </UiButtonDefault>
  </div>
</template>

<script setup></script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--ui-background);
  color: var(--ui-text-main);
  text-align: center;
  padding: 2rem;
}

.title {
  font-size: 6rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.message {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}
</style>
