<template>
  <section class="steps-v2">
    <UiContainer>
      <h2>
        {{ t("landing.sections.four_steps_section.title.before") }}
        <span>{{ t("landing.sections.four_steps_section.title.highlight") }}</span>
      </h2>
      <div class="steps-grid">
        <article
          v-for="(step, index) in steps"
          :key="index"
          class="step">
          <div class="step__icon">
            <img
              alt=""
              class="step__icon-ellipse"
              aria-hidden="true" />
            <span>{{ index + 1 }}</span>
          </div>
          <div class="step__body">
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </div>
        </article>
      </div>
      <UiButtonV2
        to="/auth/registration"
        class="steps-v2__cta">
        {{ t("landing.sections.four_steps_section.button") }}
      </UiButtonV2>
    </UiContainer>
  </section>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import UiButtonV2 from "~/components/ui/UiButtonV2.vue";
  import UiContainer from "~/components/ui/UiContainer.vue";

  const { t, tm } = useI18n();

  const steps = computed(() => {
    const items = tm("landing.sections.four_steps_section.items") as any[];
    if (!Array.isArray(items)) return [];
    return items.map((_, index) => ({
      title: t(`landing.sections.four_steps_section.items[${index}].title`),
      text: t(`landing.sections.four_steps_section.items[${index}].text`),
    }));
  });
</script>

<style lang="scss" scoped>
  .steps-v2 {
    margin-top: 160px;

    h2 {
      margin: 0;
      color: #000;
      font-size: 42px;
      line-height: 1.302;
      font-weight: 500;

      span {
        color: #0051ff;
      }
    }
  }

  .steps-grid {
    margin-top: 34px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .step {
    display: flex;
    flex-direction: column;
    gap: 20px;

    &__icon {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 20px;
      background: #fff;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: flex-end;
      justify-content: flex-start;
      padding: 10px 0 10px 14px;
      flex-shrink: 0;
      overflow: visible;

      span {
        position: relative;
        z-index: 1;
        color: #0051ff;
        font-size: 42px;
        font-weight: 500;
        line-height: 1;
      }
    }

    &__icon-ellipse {
      position: absolute;
      top: -18px;
      right: -18px;
      width: 54px;
      height: 54px;
      object-fit: contain;
      z-index: 2;
    }

    &__body {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    h3 {
      margin: 0;
      color: #0051ff;
      font-size: 28px;
      font-weight: 500;
      line-height: normal;
    }

    p {
      margin: 0;
      color: #7b7b7b;
      font-size: 16px;
      font-weight: 400;
      line-height: normal;
    }
  }

  .steps-v2__cta {
    margin-top: 34px;
  }

  @media (max-width: 991px) {
    .steps-v2 {
      margin-top: 56px;

      h2 {
        font-size: 34px;
      }
    }

    .steps-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 575px) {
    .steps-grid {
      grid-template-columns: 1fr;
    }

    .steps-v2__cta {
      width: 100%;
    }
  }
</style>
