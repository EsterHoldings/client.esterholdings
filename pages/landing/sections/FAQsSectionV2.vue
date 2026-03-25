<template>
  <section class="faq-v2">
    <UiContainer>
      <h2>FAQs</h2>
      <div class="layout">
        <div class="left">
          <TheFaqAccordion :items="faqData" />
          <p class="help">
            {{ t("landing.sections.helpSection") }}
            <a
              href="https://stage.esterholdings.website/en#"
              target="_blank"
              rel="noopener noreferrer">
              {{ t("landing.sections.helpLinkText") }}
            </a>
          </p>
        </div>

        <div class="form">
          <div class="form__header">
            <h3>{{ t("landing.sections.faqs__form_title") }}</h3>
            <p>{{ t("landing.sections.faqs__form_subtitle") }}</p>
          </div>

          <input
            v-model="formData.name"
            class="form__input"
            type="text"
            :placeholder="t('landing.sections.faqs__form_placeholders.name')"
            autocomplete="name" />

          <input
            v-model="formData.email"
            class="form__input"
            type="email"
            :placeholder="t('landing.sections.faqs__form_placeholders.email')"
            autocomplete="email" />

          <textarea
            v-model="formData.description"
            class="form__textarea"
            :placeholder="t('landing.sections.faqs__form_placeholders.description')" />

          <div
            class="form__dropzone"
            :class="{ 'form__dropzone--hover': isDragging }"
            role="button"
            tabindex="0"
            aria-label="Upload file"
            @click="triggerFileInput"
            @keydown.enter.space.prevent="triggerFileInput"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop">
            <span>Drag 'n' drop some files here, or click to select files</span>
            <input
              ref="fileInputRef"
              type="file"
              class="form__file-input"
              multiple
              accept="image/png,image/jpeg,application/pdf"
              @change="onFileSelect" />
          </div>

          <button
            class="form__btn"
            type="button"
            @click="handleSubmit">
            {{ t("landing.sections.faqs__form_button") }}
          </button>
        </div>
      </div>
    </UiContainer>
  </section>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import TheFaqAccordion from "~/components/block/TheFaqAccordion.vue";

  const { t, tm } = useI18n();

  const faqDataRaw = tm("landing.sections.faqs__items") as any[];
  const faqData = ref(
    Array.isArray(faqDataRaw)
      ? faqDataRaw.map((_, index) => ({
          title: t(`landing.sections.faqs__items[${index}].title`),
          description: t(`landing.sections.faqs__items[${index}].description`),
          isActive: index === 1,
        }))
      : []
  );

  const formData = ref({ name: "", email: "", description: "", files: [] as File[] });
  const isDragging = ref(false);
  const fileInputRef = ref<HTMLInputElement | null>(null);

  const triggerFileInput = () => fileInputRef.value?.click();

  const onFileSelect = (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    formData.value.files = files;
  };

  const onDrop = (e: DragEvent) => {
    isDragging.value = false;
    formData.value.files = Array.from(e.dataTransfer?.files ?? []);
  };

  const handleSubmit = () => {
    // TODO: submit handler
  };
</script>

<style lang="scss" scoped>
  .faq-v2 {
    margin-top: 160px;
    margin-bottom: 94px;

    h2 {
      margin: 0;
      color: #000;
      font-size: 42px;
      line-height: 1.302;
      font-weight: 500;
    }
  }

  .layout {
    margin-top: 34px;
    display: grid;
    grid-template-columns: 1fr 555px;
    gap: 20px;
    align-items: start;
  }

  .left {
    padding-top: 89px;
  }

  .help {
    margin: 30px 0 0;
    color: #000;
    font-size: 16px;
    line-height: 1.302;
    font-weight: 400;

    a {
      color: #f75709;
      text-decoration: underline;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  /* Override TheFaqAccordion styles for Figma parity */
  :deep(.faq-item) {
    max-width: none !important;
  }

  :deep(.faq-title) {
    color: #0051ff !important;
    font-size: 22px !important;
    font-weight: 700 !important;
  }

  :deep(.faq-answer p) {
    color: #7b7b7b !important;
    font-size: 16px !important;
    font-weight: 500 !important;
  }

  :deep(.faq-divider) {
    background: #a1a1a1 !important;
    margin: 0 !important;
  }

  :deep(.faq-question) {
    padding: 15px 0 !important;
    gap: 12px;
  }

  /* ---- Form card ---- */
  .form {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: 630px;

    box-shadow:
      inset 0 3px 2px rgba(190, 181, 181, 0.1),
      inset 0 -2px 4px rgba(255, 255, 255, 0.5);
    border: 1px solid #fff;

    &__header {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    h3 {
      margin: 0;
      color: #f75709;
      font-size: 42px;
      line-height: 1.302;
      font-weight: 400;
    }

    p {
      margin: 0;
      color: #4d4d4d;
      font-size: 18px;
      line-height: 1.302;
      font-weight: 700;
    }

    &__input {
      width: 100%;
      border: 1px solid #a1a1a1;
      border-radius: 12px;
      padding: 16px;
      font-size: 16px;
      color: #111;
      background: transparent;
      outline: none;
      transition: border-color 0.2s;

      &::placeholder {
        color: #6b7280;
        font-weight: 400;
      }

      &:focus {
        border-color: #0051ff;
      }

      &:hover:not(:focus) {
        border-color: #888;
      }
    }

    &__textarea {
      flex: 1 0 0;
      width: 100%;
      min-height: 100px;
      border: 1px solid #a1a1a1;
      border-radius: 12px;
      padding: 16px;
      font-size: 16px;
      color: #111;
      background: transparent;
      outline: none;
      resize: none;
      transition: border-color 0.2s;
      font-family: inherit;

      &::placeholder {
        color: #6b7280;
        font-weight: 400;
      }

      &:focus {
        border-color: #0051ff;
      }

      &:hover:not(:focus) {
        border-color: #888;
      }
    }

    &__dropzone {
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px dashed #0051ff;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition:
        background 0.2s,
        border-color 0.2s;
      text-align: center;

      &:hover,
      &--hover {
        background: rgba(0, 81, 255, 0.04);
      }

      span {
        color: #6b7280;
        font-size: 16px;
        line-height: 1.302;
        pointer-events: none;
      }
    }

    &__file-input {
      display: none;
    }

    &__btn {
      width: 170px;
      height: 53px;
      background: #0051ff;
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition:
        background 0.2s,
        opacity 0.2s;
      font-family: inherit;

      &:hover {
        background: #003ecc;
      }

      &:active {
        opacity: 0.85;
      }
    }
  }

  @media (max-width: 1200px) {
    .layout {
      grid-template-columns: 1fr 460px;
    }
  }

  @media (max-width: 991px) {
    .faq-v2 {
      margin-top: 56px;
      margin-bottom: 56px;

      h2 {
        font-size: 34px;
      }
    }

    .layout {
      grid-template-columns: 1fr;
    }

    .left {
      padding-top: 0;
    }

    .form {
      min-height: auto;
      padding: 24px;

      h3 {
        font-size: 34px;
      }

      &__btn {
        width: 100%;
      }
    }
  }

  @media (max-width: 480px) {
    .form {
      padding: 20px;
      gap: 14px;
    }
  }
</style>
