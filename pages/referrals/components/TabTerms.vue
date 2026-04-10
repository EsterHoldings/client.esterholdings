<template>
  <PanelDefault class="!border-none text-[var(--ui-text-main)]">
    <div class="flex flex-col gap-4 p-4">
      <UiTextH4 class="text-[var(--ui-text-main)]">
        {{ t("cabinet.referrals.terms.title") }}
      </UiTextH4>
      <UiTextSmall class="text-[var(--ui-text-secondary)]">
        {{ t("cabinet.referrals.terms.subtitle") }}
      </UiTextSmall>

      <section class="term-card">
        <UiTextH5 class="term-title">{{ termsContent.gamification.title }}</UiTextH5>
        <p class="term-text">
          {{ termsContent.gamification.text }}
        </p>
      </section>

      <section class="term-card">
        <div class="term-head">
          <div class="term-icon">🌟</div>
          <UiTextH5 class="term-title">{{ termsContent.coreElementsTitle }}</UiTextH5>
        </div>
        <div class="chip-row">
          <span
            v-for="item in termsContent.coreElements"
            :key="item"
            class="pill tag"
            >{{ item }}</span
          >
        </div>
      </section>

      <div class="grid gap-4">
        <section class="term-grid two-col">
          <div class="term-card">
            <div class="term-head">
              <div class="term-icon">📈</div>
              <UiTextH5 class="term-title">{{ termsContent.careerTitle }}</UiTextH5>
            </div>
            <div class="level-grid">
              <div
                v-for="step in termsContent.levelProgression"
                :key="step.title"
                class="level-card">
                <div class="font-semibold">{{ step.title }}</div>
                <div class="pill-meta">{{ termsContent.xpLabel }}: {{ step.xp }}</div>
                <div class="pill-meta">{{ termsContent.commissionLabel }}: {{ step.commission }}</div>
                <div class="pill-meta">{{ termsContent.bonusLabel }}: {{ step.bonus }}</div>
                <div class="pill-meta">{{ step.perks }}</div>
              </div>
            </div>
          </div>

          <div class="term-card">
            <div class="term-head">
              <div class="term-icon">💰</div>
              <UiTextH5 class="term-title">{{ termsContent.network.title }}</UiTextH5>
            </div>
            <p class="term-text">
              {{ termsContent.network.text }}
            </p>
            <div class="stat-grid">
              <div class="stat-row header">
                <span>{{ termsContent.network.table.level }}</span>
                <span>{{ termsContent.network.table.partners }}</span>
                <span>{{ termsContent.network.table.percent }}</span>
                <span>{{ termsContent.network.table.income }}</span>
              </div>
              <div
                v-for="row in termsContent.network.rows"
                :key="row.level"
                class="stat-row">
                <span>{{ row.level }}</span>
                <span>{{ row.count }}</span>
                <span>{{ row.percent }}</span>
                <span>{{ row.income }}</span>
              </div>
            </div>
            <p class="term-text mt-2">{{ termsContent.network.total }}</p>
          </div>
        </section>

        <section class="term-grid two-col">
          <div class="term-card">
            <div class="term-head">
              <div class="term-icon">🎯</div>
              <UiTextH5 class="term-title">{{ termsContent.xpActionsTitle }}</UiTextH5>
            </div>
            <div class="pill-list">
              <div
                v-for="xp in termsContent.xpRules"
                :key="xp.title"
                class="pill flat">
                <span class="font-semibold">{{ xp.title }}</span>
                <span class="pill-meta">{{ xp.reward }}</span>
              </div>
            </div>
          </div>

          <div class="term-card">
            <div class="term-head">
              <div class="term-icon">🛡</div>
              <UiTextH5 class="term-title">{{ termsContent.missionsTitle }}</UiTextH5>
            </div>
            <div class="pill-list">
              <div
                v-for="mission in termsContent.missions"
                :key="mission.title"
                class="pill flat">
                <span class="font-semibold">{{ mission.title }}</span>
                <span class="pill-meta">{{ mission.reward }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="term-grid two-col">
          <div class="term-card">
            <div class="term-head">
              <div class="term-icon">🏅</div>
              <UiTextH5 class="term-title">{{ termsContent.badgesTitle }}</UiTextH5>
            </div>
            <div class="pill-list">
              <div
                v-for="badge in termsContent.badges"
                :key="badge.title"
                class="pill flat">
                <span class="font-semibold">{{ badge.title }}</span>
                <span class="pill-meta">{{ badge.bonus }}</span>
              </div>
            </div>
          </div>

          <div class="term-card">
            <div class="term-head">
              <div class="term-icon">🎖</div>
              <UiTextH5 class="term-title">{{ termsContent.ratingsTitle }}</UiTextH5>
            </div>
            <div class="pill-list">
              <div
                v-for="rating in termsContent.ratingPrizes"
                :key="rating.title"
                class="pill flat">
                <span class="font-semibold">{{ rating.title }}</span>
                <span class="pill-meta">{{ rating.prize }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="term-card">
          <div class="term-head">
            <div class="term-icon">🎁</div>
            <UiTextH5 class="term-title">{{ termsContent.seasonalTitle }}</UiTextH5>
          </div>
          <div class="pill-list horizontal">
            <div
              v-for="event in termsContent.seasonalEvents"
              :key="event"
              class="pill tag">
              {{ event }}
            </div>
          </div>
        </section>

        <section class="term-card">
          <UiTextH5 class="term-title">{{ termsContent.summary.title }}</UiTextH5>
          <p class="term-text">
            {{ termsContent.summary.text }}
          </p>
        </section>
      </div>
    </div>
  </PanelDefault>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";

  const { t } = useI18n({ useScope: "global" });

  const termsContent = computed(() => ({
    gamification: {
      title: t("cabinet.referrals.terms.gamification.title"),
      text: t("cabinet.referrals.terms.gamification.text"),
    },
    coreElementsTitle: t("cabinet.referrals.terms.coreElementsTitle"),
    coreElements: [
      t("cabinet.referrals.terms.coreElements.career"),
      t("cabinet.referrals.terms.coreElements.xp"),
      t("cabinet.referrals.terms.coreElements.missions"),
      t("cabinet.referrals.terms.coreElements.badges"),
      t("cabinet.referrals.terms.coreElements.ratings"),
      t("cabinet.referrals.terms.coreElements.seasonal"),
    ],
    careerTitle: t("cabinet.referrals.terms.careerTitle"),
    xpLabel: t("cabinet.referrals.terms.xpLabel"),
    commissionLabel: t("cabinet.referrals.terms.commissionLabel"),
    bonusLabel: t("cabinet.referrals.terms.bonusLabel"),
    levelProgression: [
      {
        title: t("cabinet.referrals.terms.levels.rookie.title"),
        xp: t("cabinet.referrals.terms.levels.rookie.xp"),
        commission: t("cabinet.referrals.terms.levels.rookie.commission"),
        bonus: t("cabinet.referrals.terms.levels.rookie.bonus"),
        perks: t("cabinet.referrals.terms.levels.rookie.perks"),
      },
      {
        title: t("cabinet.referrals.terms.levels.advanced.title"),
        xp: t("cabinet.referrals.terms.levels.advanced.xp"),
        commission: t("cabinet.referrals.terms.levels.advanced.commission"),
        bonus: t("cabinet.referrals.terms.levels.advanced.bonus"),
        perks: t("cabinet.referrals.terms.levels.advanced.perks"),
      },
      {
        title: t("cabinet.referrals.terms.levels.expert.title"),
        xp: t("cabinet.referrals.terms.levels.expert.xp"),
        commission: t("cabinet.referrals.terms.levels.expert.commission"),
        bonus: t("cabinet.referrals.terms.levels.expert.bonus"),
        perks: t("cabinet.referrals.terms.levels.expert.perks"),
      },
      {
        title: t("cabinet.referrals.terms.levels.master.title"),
        xp: t("cabinet.referrals.terms.levels.master.xp"),
        commission: t("cabinet.referrals.terms.levels.master.commission"),
        bonus: t("cabinet.referrals.terms.levels.master.bonus"),
        perks: t("cabinet.referrals.terms.levels.master.perks"),
      },
      {
        title: t("cabinet.referrals.terms.levels.legendary.title"),
        xp: t("cabinet.referrals.terms.levels.legendary.xp"),
        commission: t("cabinet.referrals.terms.levels.legendary.commission"),
        bonus: t("cabinet.referrals.terms.levels.legendary.bonus"),
        perks: t("cabinet.referrals.terms.levels.legendary.perks"),
      },
    ],
    network: {
      title: t("cabinet.referrals.terms.network.title"),
      text: t("cabinet.referrals.terms.network.text"),
      table: {
        level: t("cabinet.referrals.terms.network.table.level"),
        partners: t("cabinet.referrals.terms.network.table.partners"),
        percent: t("cabinet.referrals.terms.network.table.percent"),
        income: t("cabinet.referrals.terms.network.table.income"),
      },
      rows: [
        {
          level: t("cabinet.referrals.terms.network.rows.level1.level"),
          count: t("cabinet.referrals.terms.network.rows.level1.count"),
          percent: t("cabinet.referrals.terms.network.rows.level1.percent"),
          income: t("cabinet.referrals.terms.network.rows.level1.income"),
        },
        {
          level: t("cabinet.referrals.terms.network.rows.level2.level"),
          count: t("cabinet.referrals.terms.network.rows.level2.count"),
          percent: t("cabinet.referrals.terms.network.rows.level2.percent"),
          income: t("cabinet.referrals.terms.network.rows.level2.income"),
        },
        {
          level: t("cabinet.referrals.terms.network.rows.level3.level"),
          count: t("cabinet.referrals.terms.network.rows.level3.count"),
          percent: t("cabinet.referrals.terms.network.rows.level3.percent"),
          income: t("cabinet.referrals.terms.network.rows.level3.income"),
        },
      ],
      total: t("cabinet.referrals.terms.network.total"),
    },
    xpActionsTitle: t("cabinet.referrals.terms.xpActionsTitle"),
    xpRules: [
      {
        title: t("cabinet.referrals.terms.xpRules.registration.title"),
        reward: t("cabinet.referrals.terms.xpRules.registration.reward"),
      },
      {
        title: t("cabinet.referrals.terms.xpRules.firstClient.title"),
        reward: t("cabinet.referrals.terms.xpRules.firstClient.reward"),
      },
      {
        title: t("cabinet.referrals.terms.xpRules.tenLots.title"),
        reward: t("cabinet.referrals.terms.xpRules.tenLots.reward"),
      },
      {
        title: t("cabinet.referrals.terms.xpRules.subIb.title"),
        reward: t("cabinet.referrals.terms.xpRules.subIb.reward"),
      },
      {
        title: t("cabinet.referrals.terms.xpRules.activeClients.title"),
        reward: t("cabinet.referrals.terms.xpRules.activeClients.reward"),
      },
    ],
    missionsTitle: t("cabinet.referrals.terms.missionsTitle"),
    missions: [
      {
        title: t("cabinet.referrals.terms.missions.firstStep.title"),
        reward: t("cabinet.referrals.terms.missions.firstStep.reward"),
      },
      {
        title: t("cabinet.referrals.terms.missions.master.title"),
        reward: t("cabinet.referrals.terms.missions.master.reward"),
      },
      {
        title: t("cabinet.referrals.terms.missions.buildNetwork.title"),
        reward: t("cabinet.referrals.terms.missions.buildNetwork.reward"),
      },
      {
        title: t("cabinet.referrals.terms.missions.millionLots.title"),
        reward: t("cabinet.referrals.terms.missions.millionLots.reward"),
      },
    ],
    badgesTitle: t("cabinet.referrals.terms.badgesTitle"),
    badges: [
      {
        title: t("cabinet.referrals.terms.badges.bronze.title"),
        bonus: t("cabinet.referrals.terms.badges.bronze.bonus"),
      },
      {
        title: t("cabinet.referrals.terms.badges.silver.title"),
        bonus: t("cabinet.referrals.terms.badges.silver.bonus"),
      },
      {
        title: t("cabinet.referrals.terms.badges.gold.title"),
        bonus: t("cabinet.referrals.terms.badges.gold.bonus"),
      },
      {
        title: t("cabinet.referrals.terms.badges.diamond.title"),
        bonus: t("cabinet.referrals.terms.badges.diamond.bonus"),
      },
      {
        title: t("cabinet.referrals.terms.badges.recruiter.title"),
        bonus: t("cabinet.referrals.terms.badges.recruiter.bonus"),
      },
    ],
    ratingsTitle: t("cabinet.referrals.terms.ratingsTitle"),
    ratingPrizes: [
      {
        title: t("cabinet.referrals.terms.ratings.bestMonth.title"),
        prize: t("cabinet.referrals.terms.ratings.bestMonth.prize"),
      },
      {
        title: t("cabinet.referrals.terms.ratings.topRefer.title"),
        prize: t("cabinet.referrals.terms.ratings.topRefer.prize"),
      },
      {
        title: t("cabinet.referrals.terms.ratings.turnover.title"),
        prize: t("cabinet.referrals.terms.ratings.turnover.prize"),
      },
      {
        title: t("cabinet.referrals.terms.ratings.fourth.title"),
        prize: t("cabinet.referrals.terms.ratings.fourth.prize"),
      },
      {
        title: t("cabinet.referrals.terms.ratings.fifth.title"),
        prize: t("cabinet.referrals.terms.ratings.fifth.prize"),
      },
    ],
    seasonalTitle: t("cabinet.referrals.terms.seasonalTitle"),
    seasonalEvents: [
      t("cabinet.referrals.terms.seasonal.springBattle"),
      t("cabinet.referrals.terms.seasonal.winterMarathon"),
      t("cabinet.referrals.terms.seasonal.weeklySurprise"),
      t("cabinet.referrals.terms.seasonal.exclusivePrizes"),
    ],
    summary: {
      title: t("cabinet.referrals.terms.summary.title"),
      text: t("cabinet.referrals.terms.summary.text"),
    },
  }));
</script>

<style scoped>
  .term-block {
    background: transparent;
    border-radius: 12px;
    padding: 12px 2px;
    color: var(--ui-text-main);
  }

  .term-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .term-title {
    color: var(--ui-text-main);
  }

  .term-text {
    color: var(--ui-text-secondary);
    line-height: 1.5;
    margin-top: 6px;
  }

  .term-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-stroke-ui-dark);
    border: 1px solid var(--color-stroke-ui-light);
  }

  .term-list,
  .pill-grid {
    display: grid;
    gap: 4px;
    margin-top: 8px;
  }

  .pill {
    padding: 4px 0;
    display: grid;
    gap: 2px;
  }

  .pill.flat {
    padding: 6px 0;
  }

  .term-grid {
    display: grid;
    gap: 12px;
  }

  .term-grid.two-col {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  @media (min-width: 900px) {
    .term-grid.two-col {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .term-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.04));
    border-radius: 12px;
    padding: 12px 14px;
  }

  .pill-list {
    display: grid;
    gap: 6px;
    margin-top: 8px;
  }

  .pill-list.horizontal {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pill.tag {
    border-radius: 12px;
    padding: 6px 10px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.05));
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .pill-meta {
    font-size: 12px;
    color: var(--ui-text-secondary);
  }

  .stat-grid {
    margin-top: 8px;
    display: grid;
    gap: 6px;
  }

  .stat-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    font-size: 13px;
    color: var(--ui-text-main);
  }

  .stat-row.header {
    color: var(--ui-text-secondary);
    font-weight: 600;
    border-bottom: 1px solid var(--color-stroke-ui-light);
    padding-bottom: 4px;
  }

  .level-grid {
    display: grid;
    gap: 8px;
    margin-top: 8px;
  }

  .level-card {
    background: var(--color-stroke-ui-dark);
    border-radius: 10px;
    padding: 8px 10px;
    display: grid;
    gap: 2px;
    color: var(--ui-text-main);
  }

  .bulletless {
    list-style: none;
    padding-left: 0;
    gap: 10px;
  }
</style>
