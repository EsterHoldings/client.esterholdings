<template>
  <div
      class="absolute w-full min-h-[100px] rounded-xl border-2 border-dashed border-[var(--ui-primary-main)]
           flex flex-col items-center justify-center text-center select-none transition
           hover:bg-white/5"
      :class="{ 'bg-white/5 ring-1 ring-[var(--ui-primary-main)]/50': isHover }"
      @click="onClick"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
  >
    <UiIconDocuments class="w-6 h-6 mb-2 text-[var(--ui-text-main)]" />

    <div class="text-base leading-tight">
      <span class="opacity-90 text-[var(--ui-text-main)]">Drag and Drop</span>
      <span class="opacity-90 text-[var(--ui-text-main)]"> or </span>
      <button
          type="button"
          class="underline decoration-2 underline-offset-4 text-orange-500 hover:opacity-80"
          @click.stop="onClick"
      >
        Click to upload
      </button>
    </div>

    <!-- Підпис -->
    <div class="text-xs mt-1 text-[var(--ui-text-secondary)]">
      PNG, JPG or PDF, Max size of 2MB
    </div>

    <!-- Прихований інпут -->
    <input
        ref="fileInput"
        type="file"
        class="hidden"
        multiple
        accept="image/png,image/jpeg,application/pdf,image/svg+xml"
        @change="onFileSelect"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";

const emit = defineEmits<{ (e: "files", files: File[]): void }>();

const fileInput = ref<HTMLInputElement | null>(null);
const isHover = ref(false);

function onClick() {
  if (!fileInput.value) return;
  fileInput.value.value = "";
  fileInput.value.click();
}

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length) {
    emit("files", Array.from(target.files));
  }
}

function onDragOver() {
  isHover.value = true;
}
function onDragLeave() {
  isHover.value = false;
}
function onDrop(event: DragEvent) {
  isHover.value = false;
  if (event.dataTransfer && event.dataTransfer.files.length) {
    emit("files", Array.from(event.dataTransfer.files));
  }
}
</script>
