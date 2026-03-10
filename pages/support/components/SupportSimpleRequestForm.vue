<template>
  <PanelDefault class="support-simple rounded-2xl border border-[var(--color-stroke-ui-dark)] p-5 md:p-6">
    <div class="support-simple__header mb-5">
      <UiTextH4 class="truncate">{{ t("support.simple.title") }}</UiTextH4>
      <UiTextSmall class="support-simple__subtitle">{{ t("support.simple.subtitle") }}</UiTextSmall>
    </div>

    <div class="support-simple__grid">
      <UiFormControl
        :label="t('support.simple.replyEmailLabel')"
        :errors="replyEmailError ? [replyEmailError] : []">
        <UiInput
          :value="replyEmail"
          type="email"
          :placeholder="t('support.simple.replyEmailPlaceholder')"
          @input="replyEmail = String($event || '')"
          @blur="validateReplyEmail()" />
      </UiFormControl>

      <UiFormControl
        :label="t('support.simple.subjectLabel')"
        :errors="subjectError ? [subjectError] : []">
        <UiInput
          :value="subject"
          :placeholder="t('support.simple.subjectPlaceholder')"
          @input="subject = String($event || '')"
          @blur="validateSubject()" />
      </UiFormControl>

      <UiFormControl
        :label="t('support.simple.messageLabel')"
        :errors="messageError ? [messageError] : []">
        <div class="support-simple__editor">
          <div class="support-simple__toolbar">
            <button
              type="button"
              class="support-simple__tool"
              :title="t('support.simple.tools.bold')"
              @click="applyEditorCommand('bold')">
              B
            </button>
            <button
              type="button"
              class="support-simple__tool support-simple__tool--italic"
              :title="t('support.simple.tools.italic')"
              @click="applyEditorCommand('italic')">
              I
            </button>
            <button
              type="button"
              class="support-simple__tool support-simple__tool--underline"
              :title="t('support.simple.tools.underline')"
              @click="applyEditorCommand('underline')">
              U
            </button>
            <button
              type="button"
              class="support-simple__tool"
              :title="t('support.simple.tools.list')"
              @click="applyEditorCommand('insertUnorderedList')">
              •
            </button>
            <button
              type="button"
              class="support-simple__tool"
              :title="t('support.simple.tools.link')"
              @click="insertLink()">
              ⛓
            </button>
            <button
              type="button"
              class="support-simple__tool"
              :title="t('support.simple.tools.clear')"
              @click="applyEditorCommand('removeFormat')">
              ⌫
            </button>
          </div>
          <div
            ref="editorRef"
            class="support-simple__editor-input"
            contenteditable="true"
            :data-placeholder="t('support.simple.messagePlaceholder')"
            @input="handleEditorInput"
            @blur="validateMessage()"></div>
        </div>
      </UiFormControl>

      <UiFormControl :label="t('support.simple.attachmentsLabel')">
        <input
          ref="fileInputRef"
          type="file"
          class="hidden"
          multiple
          @change="handleSelectFiles" />
        <div class="support-simple__attachments">
          <UiButtonDefault
            state="info--small"
            type="button"
            :disabled="isSubmitting"
            @click="openFileDialog">
            {{ t("support.simple.addFiles") }}
          </UiButtonDefault>
          <UiTextSmall class="support-simple__hint">{{ t("support.simple.maxSizeHint") }}</UiTextSmall>
        </div>

        <ul
          v-if="selectedFiles.length"
          class="support-simple__files">
          <li
            v-for="(file, index) in selectedFiles"
            :key="`${file.name}-${file.size}-${index}`"
            class="support-simple__file-item">
            <span class="truncate">{{ shortFileName(file.name) }} ({{ formatFileSize(file.size) }})</span>
            <button
              type="button"
              class="support-simple__file-remove"
              :aria-label="t('support.simple.removeFileAria')"
              @click="removeFile(index)">
              ×
            </button>
          </li>
        </ul>
      </UiFormControl>
    </div>

    <div class="support-simple__actions">
      <UiButtonDefault
        state="info"
        class="support-simple__submit"
        :disabled="isSubmitting"
        @click="handleSubmit">
        <span v-if="!isSubmitting">{{ t("support.simple.submit") }}</span>
        <UiIconSpinnerDefault
          v-else
          class="h-4 w-4" />
      </UiButtonDefault>
    </div>
  </PanelDefault>
</template>

<script setup lang="ts">
  import { nextTick, onMounted, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import useAppCore from "~/composables/useAppCore";

  const props = withDefaults(
    defineProps<{
      defaultEmail?: string;
    }>(),
    {
      defaultEmail: "",
    }
  );

  const emit = defineEmits<{
    (event: "submitted"): void;
  }>();

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();

  const editorRef = ref<HTMLDivElement | null>(null);
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const isSubmitting = ref(false);

  const replyEmail = ref("");
  const subject = ref("");
  const messageHtml = ref("");
  const selectedFiles = ref<File[]>([]);

  const replyEmailError = ref("");
  const subjectError = ref("");
  const messageError = ref("");

  const openFileDialog = () => fileInputRef.value?.click();

  const validateReplyEmail = (): boolean => {
    const value = replyEmail.value.trim();
    if (!value) {
      replyEmailError.value = t("support.simple.validation.replyEmailRequired");
      return false;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!isValidEmail) {
      replyEmailError.value = t("support.simple.validation.replyEmailInvalid");
      return false;
    }

    replyEmailError.value = "";
    return true;
  };

  const validateSubject = (): boolean => {
    const value = subject.value.trim();
    if (!value) {
      subjectError.value = t("support.simple.validation.subjectRequired");
      return false;
    }

    if (value.length > 200) {
      subjectError.value = t("support.simple.validation.subjectMax");
      return false;
    }

    subjectError.value = "";
    return true;
  };

  const validateMessage = (): boolean => {
    const plain = stripHtml(messageHtml.value);
    if (!plain && selectedFiles.value.length === 0) {
      messageError.value = t("support.simple.validation.messageRequired");
      return false;
    }

    messageError.value = "";
    return true;
  };

  const handleEditorInput = () => {
    messageHtml.value = editorRef.value?.innerHTML ?? "";
    if (messageError.value) {
      validateMessage();
    }
  };

  const applyEditorCommand = (command: string) => {
    editorRef.value?.focus();
    document.execCommand(command, false);
    handleEditorInput();
  };

  const insertLink = () => {
    const link = window.prompt(t("support.simple.linkPrompt"), "https://");
    if (!link) return;
    editorRef.value?.focus();
    document.execCommand("createLink", false, link.trim());
    handleEditorInput();
  };

  const handleSelectFiles = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    if (!files.length) return;

    const maxFiles = 10;
    const maxBytes = 200 * 1024 * 1024;
    const nextFiles = [...selectedFiles.value];

    for (const file of files) {
      if (nextFiles.length >= maxFiles) {
        toast.warning(t("support.simple.validation.maxFiles", { max: maxFiles }));
        break;
      }

      if (file.size > maxBytes) {
        toast.warning(`${t("support.simple.validation.fileTooLarge")} ${file.name}`);
        continue;
      }

      nextFiles.push(file);
    }

    selectedFiles.value = nextFiles;
    target.value = "";
    if (messageError.value) {
      validateMessage();
    }
  };

  const removeFile = (index: number) => {
    selectedFiles.value.splice(index, 1);
    if (messageError.value) {
      validateMessage();
    }
  };

  const isFormValid = (): boolean => {
    const emailValid = validateReplyEmail();
    const subjectValid = validateSubject();
    const messageValid = validateMessage();
    return emailValid && subjectValid && messageValid;
  };

  const handleSubmit = async () => {
    if (isSubmitting.value) return;
    if (!isFormValid()) return;

    const payload = new FormData();
    payload.append("channel", "email");
    payload.append("reply_email", replyEmail.value.trim());
    payload.append("subject", subject.value.trim());
    payload.append("message", messageHtml.value.trim());

    selectedFiles.value.forEach(file => {
      payload.append("files[]", file);
    });

    isSubmitting.value = true;
    try {
      await appCore.tickets.post(payload as any, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(t("support.simple.createdSuccess"));

      subject.value = "";
      messageHtml.value = "";
      selectedFiles.value = [];
      if (editorRef.value) {
        editorRef.value.innerHTML = "";
      }

      emit("submitted");
    } catch (errorResponse) {
      console.error("support simple submit failed", errorResponse);
      toast.error(t("support.simple.submitFailed"));
    } finally {
      isSubmitting.value = false;
    }
  };

  const stripHtml = (value: string): string =>
    value
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const shortFileName = (value: string): string => {
    const text = value.trim();
    if (text.length <= 42) return text;
    return `${text.slice(0, 20)}...${text.slice(-18)}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  onMounted(async () => {
    replyEmail.value = (props.defaultEmail || "").trim();
    await nextTick();
    if (editorRef.value) {
      editorRef.value.innerHTML = "";
    }
  });
</script>

<style scoped>
  .support-simple {
    background: var(--ui-background-panel);
  }

  .support-simple__subtitle {
    display: block;
    margin-top: 6px;
    color: var(--ui-text-secondary);
  }

  .support-simple__grid {
    display: grid;
    gap: 16px;
  }

  .support-simple__editor {
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 12px;
    background: var(--ui-background);
    overflow: hidden;
  }

  .support-simple__toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px;
    border-bottom: 1px solid var(--color-stroke-ui-dark);
    background: var(--color-stroke-ui-light);
  }

  .support-simple__tool {
    min-width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 1px solid var(--color-stroke-ui-dark);
    color: var(--ui-text-main);
    background: transparent;
    cursor: pointer;
    font-weight: 700;
  }

  .support-simple__tool--italic {
    font-style: italic;
  }

  .support-simple__tool--underline {
    text-decoration: underline;
  }

  .support-simple__tool:hover {
    background: var(--color-stroke-ui-dark);
  }

  .support-simple__editor-input {
    min-height: 180px;
    padding: 12px;
    color: var(--ui-text-main);
    outline: none;
    white-space: pre-wrap;
  }

  .support-simple__editor-input:empty::before {
    content: attr(data-placeholder);
    color: var(--ui-text-secondary);
    pointer-events: none;
  }

  .support-simple__attachments {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .support-simple__hint {
    color: var(--ui-text-secondary);
  }

  .support-simple__files {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .support-simple__file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 10px;
    padding: 8px 10px;
    background: var(--ui-background);
  }

  .support-simple__file-remove {
    border: 0;
    background: transparent;
    color: var(--ui-text-secondary);
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
  }

  .support-simple__actions {
    margin-top: 18px;
    display: flex;
    justify-content: flex-end;
  }

  .support-simple__submit {
    min-width: 220px;
  }

  @media (max-width: 767px) {
    .support-simple {
      padding: 16px;
    }

    .support-simple__editor-input {
      min-height: 140px;
    }

    .support-simple__actions {
      justify-content: stretch;
    }

    .support-simple__submit {
      width: 100%;
      min-width: 0;
    }
  }
</style>
