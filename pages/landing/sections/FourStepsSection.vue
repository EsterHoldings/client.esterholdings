<template>
  <section class="four-steps__wrapper">
    <div class="four-steps">
      <h2 class="four-steps__title">
        Open an account in <span class="highlight">4 simple steps</span>
      </h2>

      <div class="four-steps__container">
        <div
            v-for="(step, index) in steps"
            :key="index"
            class="four-steps__item"
        >
          <span class="four-steps__number">{{ index + 1 }}</span>
          <div class="four-steps__content">
            <h3 class="four-steps__heading">{{ step.title }}</h3>
            <p class="four-steps__description">{{ step.description }}</p>
          </div>
          <div v-if="index < steps.length - 1" class="four-steps__divider"></div>
        </div>
      </div>

      <UiButtonDefault state="primary" class="four-steps__button">Open account</UiButtonDefault>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

const steps = ref([
  {
    title: "Register",
    description:
        "Choose an account type and complete our fast and secure application form",
  },
  {
    title: "Verify",
    description: "Use our digital onboarding system for fast verification",
  },
  {
    title: "Fund",
    description:
        "Fund your trading account using a wide range of funding methods",
  },
  {
    title: "Trade",
    description:
        "Start trading on your live account and access +2,100 instruments",
  },
]);
</script>

<style lang="scss" scoped>
.four-steps__wrapper {
  padding: 50px 20px;
  display: flex;
  justify-content: center;
  text-align: center;
}

.four-steps {
  max-width: 900px;
  width: 100%;
}

.four-steps__title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 30px;
}

.highlight {
  color: #ff6600;
}

.four-steps__container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.four-steps__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  text-align: center;
}

.four-steps__number {
  font-size: 24px;
  font-weight: bold;
  color: #ff6600;
}

.four-steps__content {
  margin-top: 5px;
}

.four-steps__heading {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.four-steps__description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 180px;
  margin: 5px auto;
}

.four-steps__divider {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.3);
}

.four-steps__button {
  margin: 100px auto;
}
</style>