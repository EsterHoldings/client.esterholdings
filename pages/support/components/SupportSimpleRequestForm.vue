<template>
  <PanelDefault class="support-simple rounded-2xl border border-[var(--color-stroke-ui-dark)] p-5 md:p-6">
    <div class="support-simple__layout">
      <section class="support-simple__form-column">
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
                :disabled="isSubmitting || hasPendingUploads"
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
                :key="file.id"
                class="support-simple__file-item">
                <div class="support-simple__file-content">
                  <div class="support-simple__file-head">
                    <span class="truncate">{{ shortFileName(file.name) }} ({{ formatFileSize(file.size) }})</span>
                    <span
                      class="support-simple__file-status"
                      :class="{
                        'is-uploading': file.uploadStatus === 'uploading',
                        'is-uploaded': file.uploadStatus === 'uploaded',
                        'is-failed': file.uploadStatus === 'failed',
                      }">
                      {{ resolveUploadStatusLabel(file) }}
                    </span>
                  </div>

                  <div
                    v-if="file.uploadStatus === 'uploading'"
                    class="support-simple__file-progress-track">
                    <div
                      class="support-simple__file-progress-fill"
                      :style="{ width: `${Math.max(0, Math.min(100, file.uploadProgress))}%` }"></div>
                  </div>
                </div>

                <div class="support-simple__file-actions">
                  <button
                    v-if="file.uploadStatus === 'failed'"
                    type="button"
                    class="support-simple__file-retry"
                    :title="t('support.simple.retryUpload')"
                    @click="retryFileUpload(file.id)">
                    ↻
                  </button>
                  <button
                    type="button"
                    class="support-simple__file-remove"
                    :aria-label="t('support.simple.removeFileAria')"
                    @click="removeFile(index)">
                    ×
                  </button>
                </div>
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
      </section>

      <section class="support-simple__history">
        <div class="support-simple__history-head">
          <UiTextH4 class="support-simple__history-title">{{ historyText.historyTitle }}</UiTextH4>
          <button
            type="button"
            class="support-simple__history-refresh"
            :disabled="isHistoryLoading || isHistoryRefreshing"
            :aria-label="historyText.refreshAria"
            @click="reloadHistory">
            <UiIconSpinnerDefault
              v-if="isHistoryLoading || isHistoryRefreshing"
              class="!h-4 !w-4" />
            <UiIconUpdate
              v-else
              class="h-4 w-4" />
          </button>
        </div>

        <div
          v-if="isHistoryLoading && historyTickets.length === 0"
          class="support-simple__history-state">
          <UiIconSpinnerDefault class="!h-4 !w-4 !text-[var(--ui-text-main)]" />
          <span>{{ historyText.loadingHistory }}</span>
        </div>

        <div
          v-else-if="historyTickets.length === 0"
          class="support-simple__history-state">
          {{ historyText.emptyHistory }}
        </div>

        <div
          v-else
          class="support-simple__history-list">
          <article
            v-for="ticket in historyTickets"
            :key="ticket.id"
            class="support-simple__history-ticket">
            <button
              type="button"
              class="support-simple__history-ticket-head"
              :aria-expanded="ticket.expanded ? 'true' : 'false'"
              @click="toggleHistoryTicket(ticket)">
              <div class="support-simple__history-ticket-info">
                <div class="support-simple__history-ticket-subject truncate">{{ ticket.subject }}</div>
                <div class="support-simple__history-ticket-meta">
                  <span class="support-simple__history-ticket-status">{{ ticket.status }}</span>
                  <span>•</span>
                  <span>{{ ticket.lastMessageAtLabel }}</span>
                </div>
              </div>
              <span
                class="support-simple__history-ticket-caret"
                :class="{ 'is-expanded': ticket.expanded }">
                ▾
              </span>
            </button>

            <div
              v-if="ticket.expanded"
              class="support-simple__history-ticket-thread">
              <div
                v-if="ticket.loadingThread && ticket.thread.length === 0"
                class="support-simple__history-thread-state">
                <UiIconSpinnerDefault class="!h-4 !w-4 !text-[var(--ui-text-main)]" />
                <span>{{ historyText.loadingMessages }}</span>
              </div>

              <div
                v-else-if="ticket.thread.length === 0"
                class="support-simple__history-thread-state">
                {{ historyText.emptyMessages }}
              </div>

              <article
                v-for="entry in ticket.thread"
                :key="entry.id"
                class="support-simple__history-entry">
                <div class="support-simple__history-entry-head">
                  <strong class="truncate">{{ entry.authorName }}</strong>
                  <span class="support-simple__history-entry-date">{{ entry.createdAtLabel }}</span>
                </div>

                <p
                  v-if="entry.bodyText"
                  class="support-simple__history-entry-body">
                  {{ entry.bodyText }}
                </p>

                <div
                  v-if="entry.attachments.length"
                  class="support-simple__history-attachments">
                  <a
                    v-for="attachment in entry.attachments"
                    :key="attachment.id"
                    :href="attachment.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="support-simple__history-attachment">
                    <UiIconDocuments class="h-4 w-4 shrink-0 text-[var(--ui-text-secondary)]" />
                    <span class="truncate">{{ attachment.title }}</span>
                    <span
                      v-if="attachment.details"
                      class="support-simple__history-attachment-details">
                      {{ attachment.details }}
                    </span>
                  </a>
                </div>
              </article>
            </div>
          </article>
        </div>
      </section>
    </div>
  </PanelDefault>
</template>

<script setup lang="ts">
  import axios, { AxiosProgressEvent } from "axios";
  import { computed, nextTick, onMounted, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import useAppCore from "~/composables/useAppCore";
  import { extractApiErrorMessageWithTranslator } from "~/composables/useApiMessages";
  import { translateSupportStatus } from "~/pages/support/composables/i18n";

  type SupportAttachmentKind = "image" | "video" | "file";
  type SupportAttachmentDisplay = "media" | "file";
  type SupportAttachmentStatus = "queued" | "uploading" | "uploaded" | "failed";

  interface SupportAttachment {
    id: string;
    file: File;
    name: string;
    mimeType: string;
    size: number;
    kind: SupportAttachmentKind;
    displayAs: SupportAttachmentDisplay;
    uploadStatus: SupportAttachmentStatus;
    uploadProgress: number;
    uploadedKey: string | null;
    uploadError: string | null;
  }

  interface SupportHistoryAttachment {
    id: string;
    title: string;
    url: string;
    details: string;
  }

  interface SupportHistoryEntry {
    id: string;
    authorName: string;
    createdAtLabel: string;
    bodyText: string;
    attachments: SupportHistoryAttachment[];
    createdAt: number;
  }

  interface SupportHistoryTicket {
    id: string;
    subject: string;
    status: string;
    lastMessageAtLabel: string;
    expanded: boolean;
    loadingThread: boolean;
    threadLoaded: boolean;
    thread: SupportHistoryEntry[];
  }

  const MAX_FILES_COUNT = 10;
  const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024;
  const UPLOAD_TIMEOUT_MS = 6 * 60 * 1000;

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

  const { t, te, locale } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();

  const editorRef = ref<HTMLDivElement | null>(null);
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const isSubmitting = ref(false);

  const replyEmail = ref("");
  const subject = ref("");
  const messageHtml = ref("");
  const selectedFiles = ref<SupportAttachment[]>([]);

  const replyEmailError = ref("");
  const subjectError = ref("");
  const messageError = ref("");
  const isHistoryLoading = ref(false);
  const isHistoryRefreshing = ref(false);
  const historyTickets = ref<SupportHistoryTicket[]>([]);

  const hasPendingUploads = computed(() =>
    selectedFiles.value.some(file => file.uploadStatus === "queued" || file.uploadStatus === "uploading")
  );
  const hasFailedUploads = computed(() => selectedFiles.value.some(file => file.uploadStatus === "failed"));
  const uploadedFiles = computed(() =>
    selectedFiles.value.filter(file => file.uploadStatus === "uploaded" && file.uploadedKey)
  );

  const resolveText = (key: string, fallback: string): string => {
    try {
      if (typeof te === "function" && te(key)) {
        return String(t(key));
      }
    } catch {
      // noop
    }
    return fallback;
  };
  const translateApi = (key: string, fallback: string): string => resolveText(key, fallback);

  const historyText = computed(() => ({
    historyTitle: resolveText("support.simple.historyTitle", "Request history"),
    refreshAria: resolveText("support.simple.historyRefreshAria", "Refresh request history"),
    loadingHistory: resolveText("support.simple.loadingHistory", "Loading request history..."),
    emptyHistory: resolveText("support.simple.emptyHistory", "You have no requests yet."),
    loadingMessages: resolveText("support.simple.loadingMessages", "Loading messages..."),
    emptyMessages: resolveText("support.simple.emptyMessages", "No messages in this request yet."),
    noSubject: resolveText("support.simple.noSubject", "No subject"),
    noLastUpdate: resolveText("support.simple.noLastUpdate", "No updates yet"),
    statusUnknown: resolveText("support.simple.statusUnknown", "unknown"),
    authorSupport: resolveText("support.simple.authorSupport", "Support"),
    attachmentFallbackTitle: resolveText("support.simple.attachmentFallbackTitle", "Attachment"),
  }));

  const openFileDialog = () => {
    if (isSubmitting.value || hasPendingUploads.value) {
      return;
    }

    fileInputRef.value?.click();
  };

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

  const resolveAttachmentKind = (mimeType: string): SupportAttachmentKind => {
    const normalized = mimeType.trim().toLowerCase();
    if (normalized.startsWith("image/")) return "image";
    if (normalized.startsWith("video/")) return "video";
    return "file";
  };

  const createPendingAttachment = (file: File): SupportAttachment => {
    const mimeType = (file.type || "application/octet-stream").trim();
    const kind = resolveAttachmentKind(mimeType);
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      name: file.name,
      mimeType,
      size: file.size,
      kind,
      displayAs: kind === "file" ? "file" : "media",
      uploadStatus: "queued",
      uploadProgress: 0,
      uploadedKey: null,
      uploadError: null,
    };
  };

  const updateFileState = (id: string, patch: Partial<SupportAttachment>) => {
    const target = selectedFiles.value.find(file => file.id === id);
    if (!target) return;
    Object.assign(target, patch);
  };

  const resolveUploadErrorMessage = (error: unknown): string => {
    const fallback = t("support.simple.uploadFailed");
    if (!error || typeof error !== "object") {
      return fallback;
    }

    const anyError = error as any;
    const status = Number(anyError?.response?.status ?? 0);
    if (status === 413) {
      return t("support.simple.validation.fileTooLarge");
    }

    return extractApiErrorMessageWithTranslator(anyError, translateApi, fallback) ?? fallback;
  };

  const requestSupportAttachmentPresign = async (file: SupportAttachment): Promise<{ url: string; key: string }> => {
    const response = await appCore.tickets.presignSupportAttachment({
      filename: file.name,
      content_type: file.mimeType || "application/octet-stream",
      size: file.size,
    });

    const payload = response?.data?.data ?? response?.data ?? null;
    const url = String(payload?.url ?? "").trim();
    const key = String(payload?.key ?? "").trim();
    if (!url || !key) {
      throw new Error(t("support.simple.presignFailed"));
    }

    return { url, key };
  };

  const uploadFileById = async (id: string) => {
    const target = selectedFiles.value.find(file => file.id === id);
    if (!target) return;
    if (target.uploadStatus === "uploaded" && target.uploadedKey) return;

    updateFileState(id, {
      uploadStatus: "uploading",
      uploadProgress: 0,
      uploadError: null,
      uploadedKey: null,
    });

    try {
      const presign = await requestSupportAttachmentPresign(target);
      await axios.put(presign.url, target.file, {
        headers: {
          "Content-Type": target.mimeType || "application/octet-stream",
        },
        timeout: UPLOAD_TIMEOUT_MS,
        onUploadProgress: (event: AxiosProgressEvent) => {
          const total = Number(event.total ?? target.size ?? 0);
          const loaded = Number(event.loaded ?? 0);
          const progress = total > 0 ? Math.round((loaded / total) * 100) : 0;
          updateFileState(id, {
            uploadStatus: "uploading",
            uploadProgress: Math.max(0, Math.min(100, progress)),
          });
        },
      });

      updateFileState(id, {
        uploadStatus: "uploaded",
        uploadProgress: 100,
        uploadedKey: presign.key,
        uploadError: null,
      });
    } catch (error) {
      const message = resolveUploadErrorMessage(error);
      updateFileState(id, {
        uploadStatus: "failed",
        uploadProgress: 0,
        uploadedKey: null,
        uploadError: message,
      });
      toast.error(`${target.name}: ${message}`);
    }
  };

  const uploadFilesSequentially = async (ids: string[]) => {
    for (const id of ids) {
      await uploadFileById(id);
    }
  };

  const handleSelectFiles = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    if (!files.length) return;

    const signatures = new Set(selectedFiles.value.map(file => `${file.name}:${file.size}:${file.file.lastModified}`));
    const addedAttachments: SupportAttachment[] = [];

    for (const file of files) {
      if (selectedFiles.value.length + addedAttachments.length >= MAX_FILES_COUNT) {
        toast.warning(t("support.simple.validation.maxFiles", { max: MAX_FILES_COUNT }));
        break;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.warning(`${t("support.simple.validation.fileTooLarge")} ${file.name}`);
        continue;
      }

      const signature = `${file.name}:${file.size}:${file.lastModified}`;
      if (signatures.has(signature)) {
        continue;
      }

      const prepared = createPendingAttachment(file);
      addedAttachments.push(prepared);
      signatures.add(signature);
    }

    if (addedAttachments.length > 0) {
      selectedFiles.value = selectedFiles.value.concat(addedAttachments);
      void uploadFilesSequentially(addedAttachments.map(file => file.id));
    }

    target.value = "";
    if (messageError.value) {
      validateMessage();
    }
  };

  const retryFileUpload = async (id: string) => {
    if (isSubmitting.value) return;
    await uploadFileById(id);
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
    if (hasPendingUploads.value) {
      toast.warning(t("support.simple.validation.waitUploads"));
      return;
    }
    if (hasFailedUploads.value) {
      toast.error(t("support.simple.validation.failedUploads"));
      return;
    }
    if (!isFormValid()) return;

    const uploadedAttachments = uploadedFiles.value
      .filter(file => Boolean(file.uploadedKey))
      .map(file => ({
        key: String(file.uploadedKey),
        name: file.name,
        mime_type: file.mimeType,
        size: file.size,
        kind: file.kind,
        display_as: file.displayAs,
      }));

    isSubmitting.value = true;
    try {
      await appCore.tickets.post({
        channel: "email",
        reply_email: replyEmail.value.trim(),
        subject: subject.value.trim(),
        message: messageHtml.value.trim(),
        uploaded_attachments: uploadedAttachments,
      });

      toast.success(t("support.simple.createdSuccess"));

      subject.value = "";
      messageHtml.value = "";
      selectedFiles.value = [];
      if (editorRef.value) {
        editorRef.value.innerHTML = "";
      }

      await loadHistoryTickets({ silent: true, expandLatest: true });
      emit("submitted");
    } catch (errorResponse) {
      console.error("support simple submit failed", errorResponse);
      toast.error(
        extractApiErrorMessageWithTranslator(errorResponse, translateApi, t("support.simple.submitFailed")) ??
          t("support.simple.submitFailed")
      );
    } finally {
      isSubmitting.value = false;
    }
  };

  const resolveUploadStatusLabel = (file: SupportAttachment): string => {
    if (file.uploadStatus === "uploaded") return t("support.simple.uploaded");
    if (file.uploadStatus === "failed") return t("support.simple.uploadFailed");
    if (file.uploadStatus === "uploading") {
      return `${t("support.simple.uploading")} ${Math.max(0, Math.min(100, file.uploadProgress))}%`;
    }

    return t("support.simple.uploadQueued");
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

  const normalizeText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

  const buildFullName = (firstName?: string | null, lastName?: string | null): string => {
    return [normalizeText(firstName), normalizeText(lastName)].filter(Boolean).join(" ").trim();
  };

  const parseMessageCreatedAt = (value: unknown): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const parsed = Date.parse(String(value ?? ""));
    return Number.isFinite(parsed) ? parsed : Date.now();
  };

  const formatThreadDate = (value: unknown): string => {
    const timestamp = parseMessageCreatedAt(value);
    try {
      return new Date(timestamp).toLocaleString(locale.value || undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  };

  const formatAttachmentSize = (value: unknown): string => {
    const bytes = Number(value ?? 0);
    if (!Number.isFinite(bytes) || bytes <= 0) return "";
    return formatFileSize(bytes);
  };

  const resolveTicketChannel = (ticket: Record<string, unknown>): "chat" | "email" => {
    const channel = normalizeText(ticket.channel).toLowerCase();
    if (channel === "email") return "email";
    if (channel === "chat") return "chat";
    return normalizeText(ticket.reply_email) !== "" ? "email" : "chat";
  };

  const resolveAttachmentUrl = (attachment: Record<string, unknown>): string => {
    return normalizeText(
      attachment.url ?? attachment.preview_url ?? attachment.previewUrl ?? attachment.path_url ?? attachment.pathUrl
    );
  };

  const resolveAttachmentTitle = (attachment: Record<string, unknown>, fallbackUrl: string): string => {
    const explicit = normalizeText(attachment.name ?? attachment.filename);
    if (explicit) return explicit;

    try {
      const parsed = new URL(fallbackUrl);
      const fromPath = decodeURIComponent(parsed.pathname.split("/").pop() ?? "");
      return fromPath || historyText.value.attachmentFallbackTitle;
    } catch {
      return historyText.value.attachmentFallbackTitle;
    }
  };

  const convertMessageBodyToPlainText = (value: unknown): string => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    return raw
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/\u00a0/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const mapTicketMessagesToHistoryEntries = (messages: Array<Record<string, unknown>>): SupportHistoryEntry[] => {
    return messages
      .map((message, messageIndex) => {
        const messageId = normalizeText(message.id) || `message-${messageIndex}`;
        const authorName =
          normalizeText(message.author) ||
          buildFullName(normalizeText(message.author_first_name), normalizeText(message.author_last_name)) ||
          normalizeText(message.author_email) ||
          historyText.value.authorSupport;
        const createdAtRaw = message.created_at ?? message.createdAt;
        const createdAt = parseMessageCreatedAt(createdAtRaw);
        const createdAtLabel = formatThreadDate(createdAtRaw);
        const bodyText = convertMessageBodyToPlainText(message.body);

        const rawMeta = message.meta;
        const rawAttachments =
          rawMeta && typeof rawMeta === "object" && Array.isArray((rawMeta as Record<string, unknown>).attachments)
            ? ((rawMeta as Record<string, unknown>).attachments as Array<unknown>)
            : [];

        const attachments: SupportHistoryAttachment[] = rawAttachments
          .map((rawAttachment, attachmentIndex) => {
            if (!rawAttachment || typeof rawAttachment !== "object") return null;

            const attachment = rawAttachment as Record<string, unknown>;
            const url = resolveAttachmentUrl(attachment);
            if (!url) return null;

            const attachmentId = normalizeText(attachment.id) || `${messageId}-attachment-${attachmentIndex}`;
            const title = resolveAttachmentTitle(attachment, url);
            const sizeLabel = formatAttachmentSize(attachment.size);
            const mimeType = normalizeText(attachment.mime_type ?? attachment.mimeType);

            return {
              id: attachmentId,
              title,
              url,
              details: [sizeLabel, mimeType].filter(Boolean).join(" • "),
            } as SupportHistoryAttachment;
          })
          .filter((attachment): attachment is SupportHistoryAttachment => Boolean(attachment));

        return {
          id: messageId,
          authorName,
          createdAtLabel,
          bodyText,
          attachments,
          createdAt,
        };
      })
      .sort((left, right) => left.createdAt - right.createdAt);
  };

  const fetchEmailTickets = async (): Promise<Array<Record<string, unknown>>> => {
    const response = await appCore.tickets.get({
      page: 1,
      perPage: 50,
      orderBy: "last_message_at",
      orderDirection: "desc",
    });
    const payload = response?.data;

    if (Array.isArray(payload?.data)) {
      return payload.data as Array<Record<string, unknown>>;
    }
    if (Array.isArray(payload)) {
      return payload as Array<Record<string, unknown>>;
    }

    return [];
  };

  const fetchAllMessagesForTicket = async (ticketId: string): Promise<Array<Record<string, unknown>>> => {
    const messages: Array<Record<string, unknown>> = [];
    let page = 1;

    while (page <= 20) {
      const response = await appCore.tickets.getTicketMessages(ticketId, {
        page,
        pageSize: 100,
        sort: "desc",
      });
      const payload = response?.data;
      const items = Array.isArray(payload?.data)
        ? (payload.data as Array<Record<string, unknown>>)
        : Array.isArray(payload)
          ? (payload as Array<Record<string, unknown>>)
          : [];

      if (items.length === 0) break;
      messages.push(...items);

      const hasMore = Boolean(payload?.has_more);
      if (!hasMore) break;
      page += 1;
    }

    return messages;
  };

  const ensureTicketThreadLoaded = async (ticket: SupportHistoryTicket) => {
    if (ticket.threadLoaded || ticket.loadingThread) return;
    ticket.loadingThread = true;

    try {
      const messages = await fetchAllMessagesForTicket(ticket.id);
      ticket.thread = mapTicketMessagesToHistoryEntries(messages);
      ticket.threadLoaded = true;
    } catch {
      ticket.thread = [];
      ticket.threadLoaded = true;
    } finally {
      ticket.loadingThread = false;
    }
  };

  const loadHistoryTickets = async (options: { silent?: boolean; expandLatest?: boolean } = {}) => {
    const silent = options.silent === true;
    if (silent) {
      isHistoryRefreshing.value = true;
    } else {
      isHistoryLoading.value = true;
    }

    try {
      const tickets = await fetchEmailTickets();
      const previousById = new Map(historyTickets.value.map(ticket => [ticket.id, ticket]));
      const nextTickets: SupportHistoryTicket[] = [];

      for (const rawTicket of tickets) {
        if (resolveTicketChannel(rawTicket) !== "email") {
          continue;
        }

        const ticketId = normalizeText(rawTicket.id);
        if (!ticketId) continue;

        const previous = previousById.get(ticketId);
        nextTickets.push({
          id: ticketId,
          subject: normalizeText(rawTicket.subject) || historyText.value.noSubject,
          status:
            translateSupportStatus(normalizeText(rawTicket.status), resolveText) || historyText.value.statusUnknown,
          lastMessageAtLabel: normalizeText(rawTicket.last_message_at) || historyText.value.noLastUpdate,
          expanded: previous?.expanded ?? false,
          loadingThread: false,
          threadLoaded: previous?.threadLoaded ?? false,
          thread: previous?.thread ?? [],
        });
      }

      historyTickets.value = nextTickets;

      if (options.expandLatest === true && historyTickets.value.length > 0) {
        historyTickets.value[0].expanded = true;
        await ensureTicketThreadLoaded(historyTickets.value[0]);
      }
    } catch (error) {
      console.error("support simple history load failed", error);
    } finally {
      if (silent) {
        isHistoryRefreshing.value = false;
      } else {
        isHistoryLoading.value = false;
      }
    }
  };

  const reloadHistory = async () => {
    await loadHistoryTickets({ silent: true });
  };

  const toggleHistoryTicket = async (ticket: SupportHistoryTicket) => {
    ticket.expanded = !ticket.expanded;
    if (ticket.expanded) {
      await ensureTicketThreadLoaded(ticket);
    }
  };

  onMounted(async () => {
    replyEmail.value = (props.defaultEmail || "").trim();
    await nextTick();
    if (editorRef.value) {
      editorRef.value.innerHTML = "";
    }
    await loadHistoryTickets();
  });
</script>

<style scoped>
  .support-simple {
    background: var(--ui-background-panel);
  }

  .support-simple__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  .support-simple__form-column,
  .support-simple__history {
    min-width: 0;
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

  .support-simple__file-content {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .support-simple__file-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .support-simple__file-status {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--ui-text-secondary);
  }

  .support-simple__file-status.is-uploading {
    color: var(--ui-primary-main);
  }

  .support-simple__file-status.is-uploaded {
    color: var(--ui-sticker-success);
  }

  .support-simple__file-status.is-failed {
    color: var(--ui-sticker-danger);
  }

  .support-simple__file-progress-track {
    width: 100%;
    height: 4px;
    border-radius: 999px;
    background: var(--color-stroke-ui-dark);
    overflow: hidden;
  }

  .support-simple__file-progress-fill {
    height: 100%;
    border-radius: 999px;
    background: var(--ui-primary-main);
    transition: width 0.2s linear;
  }

  .support-simple__file-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .support-simple__file-retry {
    border: 0;
    background: transparent;
    color: var(--ui-primary-main);
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
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

  .support-simple__history {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .support-simple__history-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .support-simple__history-title {
    margin: 0;
    font-size: 20px;
    line-height: 1.2;
  }

  .support-simple__history-refresh {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-dark);
    background: transparent;
    color: var(--ui-text-main);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      background 0.2s ease,
      opacity 0.2s ease;
  }

  .support-simple__history-refresh:hover {
    background: var(--color-stroke-ui-dark);
  }

  .support-simple__history-refresh:disabled {
    cursor: default;
    opacity: 0.6;
  }

  .support-simple__history-state {
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 12px;
    background: var(--ui-background);
    color: var(--ui-text-secondary);
    min-height: 52px;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
  }

  .support-simple__history-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .support-simple__history-ticket {
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 12px;
    background: var(--ui-background);
    overflow: hidden;
  }

  .support-simple__history-ticket-head {
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--ui-text-main);
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    text-align: left;
    cursor: pointer;
  }

  .support-simple__history-ticket-info {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .support-simple__history-ticket-subject {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
  }

  .support-simple__history-ticket-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    line-height: 1.2;
    color: var(--ui-text-secondary);
  }

  .support-simple__history-ticket-status {
    text-transform: capitalize;
  }

  .support-simple__history-ticket-caret {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-secondary);
    transition: transform 0.2s ease;
  }

  .support-simple__history-ticket-caret.is-expanded {
    transform: rotate(180deg);
  }

  .support-simple__history-ticket-thread {
    border-top: 1px solid var(--color-stroke-ui-dark);
    padding: 10px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .support-simple__history-thread-state {
    min-height: 46px;
    border: 1px dashed var(--color-stroke-ui-dark);
    border-radius: 10px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--ui-text-secondary);
    text-align: center;
  }

  .support-simple__history-entry {
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 10px;
    background: var(--ui-background-panel);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .support-simple__history-entry-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .support-simple__history-entry-date {
    font-size: 12px;
    color: var(--ui-text-secondary);
    white-space: nowrap;
  }

  .support-simple__history-entry-body {
    white-space: pre-line;
    color: var(--ui-text-main);
    font-size: 14px;
    line-height: 1.45;
  }

  .support-simple__history-attachments {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .support-simple__history-attachment {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 10px;
    padding: 8px;
    color: inherit;
    text-decoration: none;
    min-width: 0;
  }

  .support-simple__history-attachment:hover {
    background: var(--color-stroke-ui-dark);
  }

  .support-simple__history-attachment-details {
    margin-left: auto;
    color: var(--ui-text-secondary);
    font-size: 12px;
    white-space: nowrap;
  }

  @media (max-width: 767px) {
    .support-simple {
      padding: 16px;
    }

    .support-simple__layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .support-simple__history {
      margin-top: 4px;
      padding-top: 14px;
      border-top: 1px solid var(--color-stroke-ui-dark);
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

    .support-simple__history-ticket-head,
    .support-simple__history-ticket-thread {
      padding-left: 10px;
      padding-right: 10px;
    }

    .support-simple__history-entry-head {
      flex-direction: column;
      align-items: flex-start;
    }

    .support-simple__history-entry-date {
      white-space: normal;
    }

    .support-simple__history-attachment {
      align-items: flex-start;
      flex-direction: column;
    }

    .support-simple__history-attachment-details {
      margin-left: 0;
    }
  }
</style>
