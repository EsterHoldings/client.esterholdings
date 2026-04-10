<template>
  <PageStructureDefault>
    <template #header>
      <UiTextH4 class="text-[var(--ui-text-main)]">{{ t("cabinet.aml.pageTitle") }}</UiTextH4>
    </template>

    <template #content>
      <PageStructureContent
        :plain="true"
        v-if="!isInitialLoading">
        <template #content>
          <div class="about-company">
            <UiTextH3 class="about-company_title">{{ t("cabinet.aml.sections.intro.title") }}</UiTextH3>

            <div class="about-company_img"></div>

            <div class="about-company_text">
              <UiTextParagraph>{{ t("cabinet.aml.sections.intro.paragraphs.0") }}</UiTextParagraph>
              <UiTextParagraph>{{ t("cabinet.aml.sections.intro.paragraphs.1") }}</UiTextParagraph>
            </div>

            <UiTextH3 class="about-company_title">{{ t("cabinet.aml.sections.customerDueDiligence.title") }}</UiTextH3>
            <ul class="about-company_list">
              <li
                v-for="(item, index) in customerDueDiligenceItems"
                :key="`customer-due-diligence-${index}`">
                {{ item }}
              </li>
            </ul>

            <UiTextH3 class="about-company_title">{{ t("cabinet.aml.sections.payments.title") }}</UiTextH3>
            <UiTextParagraph>{{ t("cabinet.aml.sections.payments.paragraph") }}</UiTextParagraph>

            <UiTextH3 class="about-company_title">{{ t("cabinet.aml.sections.personnel.title") }}</UiTextH3>
            <h2 class="about-company_subtitle">{{ t("cabinet.aml.sections.personnel.officerTitle") }}</h2>
            <ul class="about-company_list">
              <li
                v-for="(item, index) in officerItems"
                :key="`officer-item-${index}`">
                {{ item }}
              </li>
            </ul>

            <h2 class="about-company_subtitle">{{ t("cabinet.aml.sections.personnel.employeesTitle") }}</h2>
            <ul class="about-company_list">
              <li
                v-for="(item, index) in employeeItems"
                :key="`employee-item-${index}`">
                {{ item }}
              </li>
            </ul>

            <UiTextH3 class="about-company_title">{{ t("cabinet.aml.sections.training.title") }}</UiTextH3>
            <ul class="about-company_list">
              <li
                v-for="(item, index) in trainingItems"
                :key="`training-item-${index}`">
                {{ item }}
              </li>
            </ul>

            <UiTextH3 class="about-company_title">{{ t("cabinet.aml.sections.suspiciousActivity.title") }}</UiTextH3>
            <UiTextParagraph>{{ t("cabinet.aml.sections.suspiciousActivity.paragraph") }}</UiTextParagraph>
          </div>
        </template>
      </PageStructureContent>

      <template v-else>
        <div class="flex min-h-[55vh] w-full flex-col items-center justify-center text-[var(--ui-text-main)]">
          <UiIconLogo class="mb-4 h-[44px] w-[44px]" />
          <UiIconSpinnerDefault class="h-[44px] w-[44px]" />
        </div>
      </template>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
  import { definePageMeta } from "~/.nuxt/imports";
  import { computed, nextTick, ref } from "vue";
  import { useI18n } from "vue-i18n";

  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
  import UiTextH3 from "~/components/ui/UiTextH3.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

  definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

  const { t } = useI18n({ useScope: "global" });
  const isInitialLoading = ref(true);
  const customerDueDiligenceItems = computed(() =>
    Array.from({ length: 6 }, (_, index) => t(`cabinet.aml.sections.customerDueDiligence.items.${index}`))
  );
  const officerItems = computed(() =>
    Array.from({ length: 4 }, (_, index) => t(`cabinet.aml.sections.personnel.officerItems.${index}`))
  );
  const employeeItems = computed(() =>
    Array.from({ length: 3 }, (_, index) => t(`cabinet.aml.sections.personnel.employeeItems.${index}`))
  );
  const trainingItems = computed(() =>
    Array.from({ length: 4 }, (_, index) => t(`cabinet.aml.sections.training.items.${index}`))
  );
  nextTick(() => {
    isInitialLoading.value = false;
  });
</script>
