<template>
  <div class="accounts__edit">
    <div
      v-if="props.title"
      class="accounts__edit__top">
      <UiTextH4>{{ props.title }}</UiTextH4>
    </div>

    <div
      class="accounts__edit__content"
      :class="{ 'without-top': !props.title }">
      <div class="accounts__edit__content__fields">
        <UiFormControl
          :label="t('cabinet.payments.details.createNew.name')"
          :errors="validatorPaymentDetailForm?.errorsFormData?.name?.errors">
          <UiInput
            :placeholder="t('cabinet.payments.details.createNew.namePlaceholder')"
            :value="formData.name"
            :isDirty="validatorPaymentDetailForm?.errorsFormData?.name?.isDirty"
            :isInvalid="validatorPaymentDetailForm?.errorsFormData?.name?.errors?.length > 0"
            @blur="validatorPaymentDetailForm?.doValidateField('name', $event.target.value)"
            @input="validatorPaymentDetailForm?.doValidateField('name', $event)" />
        </UiFormControl>

        <UiFormControl
          :label="paymentMethodLabel"
          :errors="validatorPaymentDetailForm?.errorsFormData?.paymentSystemId?.errors">
          <UiSelect
            :without-no-select="true"
            :data="paymentTypes"
            :value="formData.paymentSystemId"
            :isDirty="validatorPaymentDetailForm?.errorsFormData?.paymentSystemId?.isDirty"
            :isInvalid="validatorPaymentDetailForm?.errorsFormData?.paymentSystemId?.errors?.length > 0"
            @change="handleChangeSelectPaymentType"
            @blur="validatorPaymentDetailForm?.doValidateField('paymentSystemId', $event)" />
        </UiFormControl>

        <div v-if="selectedPaymentFields.length > 0">
          <UiFormControl
            v-for="field in selectedPaymentFields"
            :key="field.key"
            :label="field.label"
            :errors="fieldErrors[field.key] ? [fieldErrors[field.key]] : []">
            <UiInput
              :placeholder="field.placeholder"
              :value="formData.data[field.key] || ''"
              @input="handleInputPaymentField(field.key, $event)" />
          </UiFormControl>
        </div>
        <div
          v-else
          class="accounts__edit__description">
          Выберите платежную систему, чтобы заполнить реквизиты для выплат.
        </div>

        <UiFormControl
          label="Скриншоты реквизитов"
          :errors="documentsError ? [documentsError] : []">
          <div class="payment-documents">
            <div class="payment-documents__dropzone">
              <UiDragAndDrop
                class="payment-documents__drag"
                @files="handleFilesSelected" />
            </div>

            <div class="payment-documents__hint">
              Загрузите скриншот реквизитов из платежной системы (PNG, JPG, PDF, до 5 МБ).
            </div>

            <div
              v-if="selectedFiles.length > 0"
              class="payment-documents__list">
              <div
                v-for="(selectedFile, index) in selectedFiles"
                :key="selectedFile.file.name + selectedFile.file.lastModified"
                class="payment-documents__item">
                <div class="payment-documents__preview">
                  <UiImage
                    v-if="isImageFile(selectedFile.file)"
                    :src="selectedFile.previewUrl"
                    fitContain
                    fitPosition="center" />
                  <div
                    v-else
                    class="payment-documents__preview-file">
                    PDF
                  </div>
                </div>

                <div class="payment-documents__meta">
                  <div class="payment-documents__name">{{ selectedFile.file.name }}</div>
                  <div class="payment-documents__size">{{ formatFileSize(selectedFile.file.size) }}</div>
                </div>

                <button
                  type="button"
                  class="payment-documents__remove"
                  aria-label="Удалить файл"
                  @click="removeSelectedFile(index)">
                  <UiIconTrash class="payment-documents__remove-icon" />
                </button>
              </div>
            </div>
          </div>
        </UiFormControl>

        <div class="accounts__edit__actions">
          <UiButtonDefault
            class="accounts__edit__save-btn"
            state="info"
            :disabled="isLoading"
            @click="handleSubmitForm">
            <span v-if="!isLoading">{{ t("cabinet.accounts.accounts-form.actions.submit") }}</span>
            <UiIconSpinnerDefault v-if="isLoading" />
          </UiButtonDefault>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import axios from "axios";
  import { computed, inject, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiDragAndDrop from "~/components/ui/UiDragAndDrop.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconTrash from "~/components/ui/UiIconTrash.vue";
  import UiImage from "~/components/ui/UiImage.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";

  import useApi from "~/composables/useApi";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { formData } from "~/pages/payments/details/composables";
  import {
    resetValidationUPaymentDetailForm,
    validatePaymentDetailForm,
    validatorPaymentDetailForm,
  } from "~/pages/payments/details/composables/validation";

  type PaymentTypeOption = {
    id: string;
    value: string;
    text: string;
  };

  type PaymentSystemField = {
    key: string;
    label: string;
    placeholder: string;
    required: boolean;
    defaultValue: string;
  };

  type PaymentSystem = {
    id: string;
    name: string;
    fields: PaymentSystemField[];
  };

  type SelectedUploadFile = {
    file: File;
    previewUrl: string;
  };

  const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;
  const ALLOWED_DOCUMENT_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];

  const isLoading = ref(false);
  const documentsError = ref("");
  const selectedFiles = ref<SelectedUploadFile[]>([]);
  const fieldErrors = reactive<Record<string, string>>({});

  const { t } = useI18n({ useScope: "global" });
  const props = defineProps({
    title: {
      type: String,
      default: "",
    },
  });

  const app = useAppCore();
  const toast = useToast();
  const apiClient = new useApi(true);
  const { closeModal } = inject("modalControl") as { closeModal: Function };

  const paymentTypes = reactive<PaymentTypeOption[]>([]);
  const paymentSystems = reactive<PaymentSystem[]>([]);
  const selectedPaymentSystem = ref<PaymentSystem | null>(null);
  const fallbackPaymentField: PaymentSystemField = {
    key: "recipientAddress",
    label: "Recipient Address",
    placeholder: "Введите реквизиты для выплат",
    required: true,
    defaultValue: "",
  };

  const selectedPaymentFields = computed(() => {
    const current = selectedPaymentSystem.value;
    if (!current) {
      return [];
    }

    return current.fields.length > 0 ? current.fields : [fallbackPaymentField];
  });

  const paymentMethodLabel = computed(() => {
    const key = "cabinet.payments.details.createNew.paymentMethod";
    const translated = t(key);
    return translated === key ? "Платежный метод" : translated;
  });

  const humanizeFieldKey = (key: string): string => {
    const formatted = key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .trim();

    return formatted ? formatted.charAt(0).toUpperCase() + formatted.slice(1) : "Field";
  };

  const normalizePaymentSystemFields = (rawPdfc: unknown): PaymentSystemField[] => {
    if (!rawPdfc) {
      return [];
    }

    if (Array.isArray(rawPdfc)) {
      return rawPdfc
        .map((item, index) => {
          if (typeof item !== "object" || item === null) {
            return null;
          }

          const value = item as Record<string, any>;
          const key = String(value.key ?? value.id ?? `field_${index + 1}`);
          const label = String(value.label ?? humanizeFieldKey(key));
          const placeholder = String(value.placeholder ?? "Введите значение");
          const defaultValue = String(value.value ?? "");
          const required = value.required !== false;

          return { key, label, placeholder, defaultValue, required };
        })
        .filter((field): field is PaymentSystemField => Boolean(field));
    }

    if (typeof rawPdfc === "object") {
      return Object.entries(rawPdfc as Record<string, any>)
        .map(([key, item]) => {
          const value = typeof item === "object" && item !== null ? item : {};
          const label = String(value.label ?? humanizeFieldKey(key));
          const placeholder = String(value.placeholder ?? "Введите значение");
          const defaultValue = String(value.value ?? "");
          const required = value.required !== false;

          return {
            key,
            label,
            placeholder,
            defaultValue,
            required,
          };
        })
        .filter(field => field.key.length > 0);
    }

    return [];
  };

  const clearFieldErrors = () => {
    Object.keys(fieldErrors).forEach(key => {
      delete fieldErrors[key];
    });
  };

  const initializePaymentFields = () => {
    const nextData: Record<string, string> = {};

    selectedPaymentFields.value.forEach(field => {
      nextData[field.key] = field.defaultValue;
    });

    formData.data = nextData;
    clearFieldErrors();
  };

  const handleInputPaymentField = (key: string, value: string) => {
    formData.data[key] = value;
    if (fieldErrors[key]) {
      delete fieldErrors[key];
    }
  };

  const handleChangeSelectPaymentType = (val: string) => {
    validatorPaymentDetailForm.doValidateField("paymentSystemId", val);
    formData.paymentSystemId = val;
    selectedPaymentSystem.value = paymentSystems.find(x => x.id === String(val)) ?? null;
    initializePaymentFields();
  };

  const getPaymentTypes = async () => {
    const response = await app.paymentSystems.get();
    paymentTypes.splice(
      0,
      paymentTypes.length,
      ...response.data.map(({ id, name }) => ({
        id: String(id),
        value: String(id),
        text: String(name),
      }))
    );

    paymentSystems.splice(
      0,
      paymentSystems.length,
      ...response.data.map(({ id, name, pdfc }) => ({
        id: String(id),
        name: String(name),
        fields: normalizePaymentSystemFields(pdfc),
      }))
    );
  };

  const isImageFile = (file: File): boolean => file.type.startsWith("image/");

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const cleanupSelectedFiles = () => {
    selectedFiles.value.forEach(item => {
      URL.revokeObjectURL(item.previewUrl);
    });

    selectedFiles.value = [];
  };

  const handleFilesSelected = (files: File[] = []) => {
    if (!Array.isArray(files) || files.length === 0) {
      return;
    }

    const uploadableFiles = files.filter(file => {
      if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
        toast.error(`Файл ${file.name} имеет недопустимый формат.`);
        return false;
      }

      if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
        toast.error(`Файл ${file.name} превышает 5 МБ.`);
        return false;
      }

      return true;
    });

    const alreadyAdded = new Set(
      selectedFiles.value.map(item => `${item.file.name}:${item.file.size}:${item.file.lastModified}`)
    );

    uploadableFiles.forEach(file => {
      const uniq = `${file.name}:${file.size}:${file.lastModified}`;
      if (alreadyAdded.has(uniq)) {
        return;
      }

      selectedFiles.value.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
      alreadyAdded.add(uniq);
    });

    if (selectedFiles.value.length > 0) {
      documentsError.value = "";
    }
  };

  const removeSelectedFile = (index: number) => {
    const file = selectedFiles.value[index];
    if (!file) {
      return;
    }

    URL.revokeObjectURL(file.previewUrl);
    selectedFiles.value.splice(index, 1);
  };

  const validatePaymentFields = (): boolean => {
    clearFieldErrors();

    let isValid = true;

    selectedPaymentFields.value.forEach(field => {
      const value = String(formData.data[field.key] || "").trim();
      if (field.required && !value) {
        fieldErrors[field.key] = "Поле обязательно для заполнения";
        isValid = false;
      }
    });

    return isValid;
  };

  const uploadPaymentDetailDocuments = async () => {
    const uploadedDocuments: Array<Record<string, any>> = [];

    for (const item of selectedFiles.value) {
      const file = item.file;
      const presignResponse = await apiClient.post("client/s3/presign", {
        filename: file.name,
        contentType: file.type,
        path: "payment-details",
      });

      const { url, key } = presignResponse.data as { url: string; key: string };

      await axios.put(url, file, {
        headers: { "Content-Type": file.type },
      });

      uploadedDocuments.push({
        name: file.name,
        path: key,
        mime_type: file.type,
        size: file.size,
        uploaded_at: new Date().toISOString(),
      });
    }

    return uploadedDocuments;
  };

  const handleSubmitForm = async () => {
    validatePaymentDetailForm(async () => {
      const isPaymentFieldsValid = validatePaymentFields();
      if (!isPaymentFieldsValid) {
        return;
      }

      if (selectedFiles.value.length === 0) {
        documentsError.value = "Добавьте минимум один скриншот реквизитов для верификации.";
        return;
      }

      try {
        isLoading.value = true;
        documentsError.value = "";

        const uploadedDocuments = await uploadPaymentDetailDocuments();

        const payload = {
          paymentSystemId: formData.paymentSystemId,
          name: formData.name,
          data: formData.data,
          documents: uploadedDocuments,
        };

        const response = await app.paymentDetails.post(payload);

        toast.success(response.data.message || "Платёжные реквизиты созданы успешно.");
        closeModal();
        useEventBus.emit("loadDataForPaymentDetails");
      } catch (errorResponse: any) {
        const errorMessage = errorResponse?.response?.data?.message || "Не удалось сохранить платежные реквизиты.";
        toast.error(errorMessage);
      } finally {
        isLoading.value = false;
      }
    });
  };

  onMounted(async () => {
    resetValidationUPaymentDetailForm();
    cleanupSelectedFiles();
    selectedPaymentSystem.value = null;
    documentsError.value = "";
    clearFieldErrors();

    await getPaymentTypes();
  });

  onBeforeUnmount(() => {
    cleanupSelectedFiles();
  });
</script>

<style lang="scss" scoped>
  .accounts__edit {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;

    &__top {
      min-height: 50px;
      padding-left: 40px;
      padding-right: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      border-bottom: 1px solid var(--color-stroke-ui-dark);
    }

    &__content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;

      &.without-top {
        border-top: none;
      }

      &__fields {
        padding: 40px;

        .ui-form-control {
          margin-bottom: 20px;

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }

    &__description {
      margin-bottom: 16px;
      color: var(--ui-text-secondary);
      font-size: 13px;
    }

    &__actions {
      margin-top: 12px;
      padding-bottom: max(8px, calc(env(safe-area-inset-bottom, 0px) + 6px));
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    &__save-btn {
      min-height: 40px;
    }
  }

  .payment-documents {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .payment-documents__dropzone {
    position: relative;
    min-height: 120px;
  }

  .payment-documents__drag {
    position: absolute;
    inset: 0;
  }

  .payment-documents__hint {
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .payment-documents__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .payment-documents__item {
    min-height: 62px;
    display: grid;
    grid-template-columns: 62px 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
  }

  .payment-documents__preview {
    width: 62px;
    height: 62px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background);
  }

  .payment-documents__preview-file {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-main);
    font-size: 12px;
    font-weight: 700;
  }

  .payment-documents__meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .payment-documents__name {
    color: var(--ui-text-main);
    font-size: 13px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .payment-documents__size {
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .payment-documents__remove {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid var(--color-stroke-ui-light);
    background: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-sticker-danger);
    transition: background-color 0.2s ease;
  }

  .payment-documents__remove:hover {
    background: color-mix(in srgb, var(--ui-sticker-danger) 14%, transparent);
  }

  .payment-documents__remove-icon {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 768px) {
    .accounts__edit {
      &__top {
        padding-left: 20px;
        padding-right: 20px;
      }

      &__content {
        &__fields {
          padding: 20px;
        }
      }

      &__actions {
        margin-top: 12px;
      }

      &__save-btn {
        width: 100%;
      }
    }

    .payment-documents__item {
      grid-template-columns: 54px 1fr auto;
      min-height: 54px;
    }

    .payment-documents__preview {
      width: 54px;
      height: 54px;
    }
  }
</style>
