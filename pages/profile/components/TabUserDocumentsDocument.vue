<template>
  <div
    class="group grid items-center px-6 py-4 hover:bg-[var(--color-stroke-ui-dark)] transition gap-x-3 [grid-template-columns:47px_1fr_1fr_1fr_30px]"
    role="row">
    <button
      type="button"
      class="h-10 w-10 rounded-xl overflow-hidden grid place-items-center bg-[var(--ui-primary-main)]/15 ring-1 ring-[var(--ui-primary-main)]/30"
      :class="imageUrl ? 'cursor-pointer' : 'cursor-default'"
      @click="handleOpenImage">
      <template v-if="previewMeta.type === 'image' && previewMeta.src">
        <img
          :src="previewMeta.src"
          alt=""
          class="h-full w-full object-cover" />
      </template>
      <template v-else>
        <span
          class="document-file-badge"
          :class="`is-${previewMeta.type}`">
          {{ previewMeta.label }}
        </span>
      </template>
    </button>

    <div class="truncate text-[var(--ui-text-main)] text-base">
      {{ displayName }}
    </div>

    <div
      class="truncate text-left text-sm font-medium"
      :class="statusClass">
      {{ statusText }}
    </div>

    <div class="truncate text-left whitespace-nowrap text-sm text-[var(--ui-text-main)]/80">
      {{ data.created_at }}
    </div>

    <div class="flex items-center justify-end">
      <button
        type="button"
        :disabled="inProcessRemoving"
        @click="handleRemoveDocument"
        :aria-label="t('cabinet.profile.components.tab-user-documents.actions.delete')"
        class="inline-flex items-center justify-center w-9 h-9 hover:bg-[var(--color-stroke-ui-light)]/70 disabled:opacity-60 transition">
        <UiIconSpinnerDefault v-if="inProcessRemoving" />
        <UiIconTrash
          v-else
          class="text-[var(--ui-text-main)]" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import useAppCore from "~/composables/useAppCore";

  import UiIconTrash from "~/components/ui/UiIconTrash.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

  type State = "pending" | "approved" | "rejected";

  interface DocData {
    id: string | number;
    created_at: string;
    state: State;
    document_type?: string;
    document_data?: { number?: string; [k: string]: any };
    document_url?: string;
    thumb_url?: string;
    preview_url?: string;
    url?: string;
    mime_type?: string;
    path?: string;
    name?: string;
  }

  const props = defineProps<{ data: DocData }>();
  const emits = defineEmits<{
    (e: "documentWasRemoved"): void;
  }>();

  const appCore = useAppCore();
  const inProcessRemoving = ref(false);

  const { t } = useI18n({ useScope: "global" });
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif"];
  const textExtensions = ["txt", "text", "md", "csv", "json", "xml", "log"];

  const displayName = computed(() => {
    if (props.data?.document_data?.number) return props.data.document_data.number;
    const documentType = String(props.data?.document_type ?? "")
      .trim()
      .toLowerCase();

    if (["", "document", "documents", "passport", "id", "id_card", "identity", "identity_document"].includes(documentType)) {
      return t("cabinet.profile.components.tab-user-documents.documentLabel");
    }

    return t("cabinet.profile.components.tab-user-documents.documentLabel");
  });

  const statusText = computed(() => {
    switch (props.data.state) {
      case "pending":
        return t("cabinet.profile.components.tab-user-documents.statuses.pending");
      case "approved":
        return t("cabinet.profile.components.tab-user-documents.statuses.approved");
      default:
        return t("cabinet.profile.components.tab-user-documents.statuses.rejected");
    }
  });

  const statusClass = computed(() => {
    switch (props.data.state) {
      case "pending":
        return "text-[var(--color-warning)]";
      case "approved":
        return "text-[var(--color-success)]";
      default:
        return "text-[var(--color-danger)]";
    }
  });

  const extractFileExtension = (value: string): string => {
    const normalized = String(value || "")
      .split("?")[0]
      .split("#")[0]
      .trim()
      .toLowerCase();
    const segments = normalized.split(".");

    return segments.length > 1 ? segments.pop() || "" : "";
  };

  const resolvePreviewKind = (): "image" | "pdf" | "text" | "file" => {
    const mimeType = String(props.data.mime_type || "")
      .trim()
      .toLowerCase();
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.startsWith("text/") || mimeType.includes("json") || mimeType.includes("xml")) return "text";

    const extension = extractFileExtension(
      props.data.thumb_url ||
        props.data.preview_url ||
        props.data.document_url ||
        props.data.url ||
        props.data.path ||
        props.data.name ||
        ""
    );

    if (imageExtensions.includes(extension)) return "image";
    if (extension === "pdf") return "pdf";
    if (textExtensions.includes(extension)) return "text";
    return "file";
  };

  const imageUrl = computed(
    () =>
      props.data.document_url ||
      props.data.url ||
      props.data.preview_url ||
      props.data.thumb_url ||
      props.data.path ||
      ""
  );

  const previewMeta = computed(() => {
    const type = resolvePreviewKind();

    return {
      type,
      src:
        type === "image"
          ? String(
              props.data.thumb_url || props.data.preview_url || props.data.document_url || props.data.url || ""
            ).trim()
          : "",
      label: type === "pdf" ? "PDF" : type === "text" ? "TXT" : "FILE",
    };
  });

  const handleOpenImage = () => {
    if (!imageUrl.value) return;
    window.open(imageUrl.value, "_blank", "noopener,noreferrer");
  };

  const handleRemoveDocument = async () => {
    inProcessRemoving.value = true;
    await appCore.documents.delete(props.data.id);
    inProcessRemoving.value = false;
    emits("documentWasRemoved");
  };
</script>

<style scoped>
  .document-file-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    min-height: 28px;
    padding: 0 6px;
    border-radius: 9px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.04em;
    line-height: 1;
    color: var(--ui-text-main);
    background: rgba(255, 255, 255, 0.08);
  }

  .document-file-badge.is-pdf {
    background: rgba(220, 38, 38, 0.18);
    color: #fca5a5;
  }

  .document-file-badge.is-text {
    background: rgba(59, 130, 246, 0.16);
    color: #93c5fd;
  }

  .document-file-badge.is-file {
    background: rgba(148, 163, 184, 0.16);
    color: #cbd5e1;
  }
</style>
