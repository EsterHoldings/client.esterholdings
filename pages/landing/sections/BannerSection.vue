<template>
  <section class="banner-section">
    <UiContainer>
      <div class="banner-section__wrapper">

        <div class="banner-image">
          <UiImage class="banner-image__image" src="/static/banner-bg.png" />
          <UiImage class="banner-image__image" src="/static/banner-bg-front.png" />
        </div>

        <div class="banner-content">
          <h1 class="banner-title">Trade the Markets Like a Pro!</h1>
          <p class="banner-subtitle">
            Whether you're a beginner or a pro, our advanced tools and resources help you make informed trading decisions.
          </p>
          <button class="banner-button">Start trading today!</button>
        </div>

      </div>
    </UiContainer>
  </section>
</template>

<script lang="ts" setup>
import UiImage from "~/components/ui/UiImage.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
</script>

<style lang="scss" scoped>
.banner-section {
  padding: 60px 20px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
  margin-bottom: 200px;

  &__wrapper {
    position: relative;
    height: 450px;
    width: 100%;
  }
}

.banner-content {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 40px);
}

.banner-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.banner-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 20px;
}

.banner-button {
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #2a4af5;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background 0.3s;
}

.banner-button:hover {
  background-color: #1b36e0;
}

.banner-image {
  margin-top: 30px;
  width: 100%;
  z-index: 1;

  &__image {
    position: absolute;
    top: 0;
    width: 100%;
  }
}

.banner-image img {
  width: 100%;
  border-radius: 10px;
}
</style>