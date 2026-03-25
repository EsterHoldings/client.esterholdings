<template>
  <section class="updates-v2">
    <UiContainer>
      <h2>{{ t("landing.sections.latest_updates__title") }}</h2>
      <div class="cards">
        <article
          class="card"
          v-for="(item, index) in newsItems"
          :key="index">
          <img
            :src="item.src"
            alt="" />
          <div class="body">
            <h3>{{ item.title }}</h3>
            <p>{{ item.subTitle }}</p>
            <time>{{ item.time }}</time>
          </div>
        </article>
      </div>
    </UiContainer>
  </section>
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import useAppCore from "~/composables/useAppCore";
  import type { NewsItem } from "~/composables/core/modules/news/news.types";

  const { t } = useI18n();
  const appCore = useAppCore();

  const newsItems = ref<{ src: string; title: string; subTitle: string; time: string }[]>([]);

  const mapToCard = (item: NewsItem) => ({
    src: item.image,
    title: item.title,
    subTitle: item.subtitle,
    time: item.publishedAt,
  });

  const loadNews = async () => {
    const response = await appCore.news.getLatest({ limit: 3 });
    newsItems.value = response.data.data.map(mapToCard);
  };

  onMounted(loadNews);
</script>

<style lang="scss" scoped>
  .updates-v2 {
    margin-top: 160px;

    h2 {
      margin: 0;
      color: #000;
      font-size: 42px;
      line-height: 1.302;
      font-weight: 500;
    }

    .cards {
      margin-top: 34px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
    }

    .card {
      border: 6px solid #fff;
      border-radius: 20px;
      overflow: hidden;
      background: linear-gradient(-32deg, #fff 12%, #f1f1f1 89%);
      display: flex;
      flex-direction: column;

      img {
        width: 100%;
        height: 242px;
        object-fit: cover;
        display: block;
      }

      .body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      h3 {
        margin: 0;
        color: #000;
        font-size: 22px;
        line-height: 1.302;
        font-weight: 700;
      }

      p {
        margin: 10px 0 0;
        color: #7b7b7b;
        font-size: 14px;
        line-height: 1.302;
        font-weight: 500;
      }

      time {
        margin-top: 30px;
        display: block;
        color: #7b7b7b;
        font-size: 14px;
        line-height: 1.302;
        font-weight: 700;
      }
    }
  }

  @media (max-width: 991px) {
    .updates-v2 {
      margin-top: 56px;

      h2 {
        font-size: 34px;
      }

      .cards {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
