<template>
  <section class="advantages-v2">
    <UiContainer>
      <h2 class="title">
        {{ t("landing.sections.advantages_title_before") }}
        <span>{{ t("landing.sections.advantages_title_accent") }}</span
        >:
      </h2>
      <div class="grid">
        <article
          v-for="(_, index) in advantages"
          :key="index"
          class="item">
          <p class="value">{{ t(`landing.sections.advantages[${index}].value`) }}</p>
          <p class="label">{{ t(`landing.sections.advantages[${index}].label`) }}</p>
        </article>
      </div>
    </UiContainer>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from "vue-i18n";
  import UiContainer from "~/components/ui/UiContainer.vue";

  const { t, tm } = useI18n();
  const advantages = tm("landing.sections.advantages");
</script>

<style lang="scss" scoped>
  .advantages-v2 {
    padding: 80px 0;

    .title {
      margin: 0 0 40px;
      color: #000;
      font-size: 42px;
      font-weight: 400;
      line-height: 1.5;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 32px 60px;
    }

    .item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .value {
      margin: 0;
      font-size: 90px;
      font-weight: 400;
      color: #8b97a8;
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .label {
      margin: 0;
      color: #0051ff;
      text-transform: uppercase;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
  }

  @media (max-width: 991px) {
    .advantages-v2 {
      padding: 60px 0;

      .value {
        font-size: 64px;
      }
    }
  }

  @media (max-width: 575px) {
    .advantages-v2 {
      padding: 48px 0;

      .grid {
        grid-template-columns: 1fr;
      }

      .value {
        font-size: 52px;
      }
    }
  }
</style>
