<template>
  <PageStructureDefault>
    <template #header>
      <UiTextH4 class="text-[var(--ui-text-main)]">AML Policy</UiTextH4>
    </template>

    <template #content>
      <PageStructureContent
        :plain="true"
        v-if="!isInitialLoading">
        <template #content>
          <div class="about-company">
            <UiTextH3 class="about-company_title">AML Policy</UiTextH3>

            <div class="about-company_img"></div>

            <div class="about-company_text">
              <UiTextParagraph>
                <span>Money Laundering</span> — all procedures to conceal the origins of criminal proceeds to make them
                appear legitimate. Ester Holdings Ltd. aims to detect, manage and mitigate such risks.
              </UiTextParagraph>

              <UiTextParagraph>
                The Company continuously monitors exposure to money laundering and terrorism financing risks. Knowing
                the customer and understanding their instructions enables better risk assessment.
              </UiTextParagraph>
            </div>

            <UiTextH3 class="about-company_title">Customer Due Diligence</UiTextH3>
            <ul class="about-company_list">
              <li>Identify and verify individual and corporate customers using valid documentation.</li>
              <li>Collect personal or company details during registration at my.esterholdings.website.</li>
              <li>Require proof of identity and address via valid documents (passport, utility bill, etc.).</li>
              <li>Verify credit/debit card for transactions while masking sensitive data.</li>
              <li>Request source of funds/wealth in high-risk cases.</li>
              <li>Conduct ongoing monitoring for risk or unusual behavior.</li>
            </ul>

            <UiTextH3 class="about-company_title">Payments Policy</UiTextH3>
            <UiTextParagraph>
              Payments are regulated under the "Regulations for Non-Trading Operations," available on the Company
              Website under “Regulatory Documents and Agreements.”
            </UiTextParagraph>

            <UiTextH3 class="about-company_title">Personnel</UiTextH3>
            <h2 class="about-company_subtitle">AML Compliance Officer</h2>
            <ul class="about-company_list">
              <li>Ensures AML compliance and maintains internal AML programs.</li>
              <li>Establishes audit functions and reports breaches to the Board.</li>
              <li>Trains staff and investigates suspicious activities.</li>
              <li>Keeps proper AML records and monitors international AML developments.</li>
            </ul>

            <h2 class="about-company_subtitle">Employees</h2>
            <ul class="about-company_list">
              <li>Must know and comply with AML policy.</li>
              <li>Vetted at hiring with criminal checks and monitored during employment.</li>
              <li>Must report AML violations confidentially.</li>
            </ul>

            <UiTextH3 class="about-company_title">Employee Training</UiTextH3>
            <ul class="about-company_list">
              <li>Training provided internally or via external consultants.</li>
              <li>Each new employee follows a training plan with tests over 2–3 months.</li>
              <li>Content covers AML responsibilities, detection methods, and FATF typologies.</li>
              <li>Focus on identifying and reporting suspicious transactions without tipping off subjects.</li>
            </ul>

            <UiTextH3 class="about-company_title">Reporting Suspicious Activity</UiTextH3>
            <UiTextParagraph>
              All suspicious activities must be reported to the AML Compliance Officer. The company may conduct internal
              investigations, freeze or close accounts, and inform authorities, cooperating fully with law enforcement
              where required by law.
            </UiTextParagraph>
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
  import { nextTick, ref } from "vue";

  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
  import UiTextH3 from "~/components/ui/UiTextH3.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

  definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

  const isInitialLoading = ref(true);
  nextTick(() => {
    isInitialLoading.value = false;
  });
</script>
