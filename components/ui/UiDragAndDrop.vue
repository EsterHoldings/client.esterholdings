<template>
  <div
    class="absolute w-full min-h-[100px] rounded-xl border-2 border-dashed border-[var(--ui-primary-main)] flex flex-col items-center justify-center text-center select-none transition"
    :class="{
      'bg-white/5 ring-1 ring-[var(--ui-primary-main)]/50': isHover && !disabled,
      'cursor-pointer hover:bg-white/5': !disabled,
      'opacity-55 pointer-events-none grayscale-[0.2]': disabled,
    }"
    @click="onClick"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop">
    <UiIconDocuments class="w-6 h-6 mb-2 text-[var(--ui-text-main)]" />

    <div class="text-base leading-tight">
      <span class="opacity-90 text-[var(--ui-text-main)]">{{ titleText }}</span>
      <span class="opacity-90 text-[var(--ui-text-main)]">&nbsp;{{ separatorText }}&nbsp;</span>
      <button
        type="button"
        class="underline decoration-2 underline-offset-4 text-orange-500 hover:opacity-80 disabled:no-underline disabled:text-[var(--ui-text-secondary)] disabled:cursor-default"
        :disabled="disabled"
        @click.stop="onClick">
        {{ actionText }}
      </button>
    </div>

    <div class="text-xs mt-1 text-[var(--ui-text-secondary)]">
      {{ disabled ? disabledHintText : hintText }}
    </div>

    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :disabled="disabled"
      multiple
      accept="image/png,image/jpeg,application/pdf,image/svg+xml"
      @change="onFileSelect" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from "vue";
  import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";

  const emit = defineEmits<{ (e: "files", files: File[]): void }>();

  const fileInput = ref<HTMLInputElement | null>(null);
  const isHover = ref(false);
  const props = withDefaults(
    defineProps<{
      titleText?: string;
      actionText?: string;
      separatorText?: string;
      hintText?: string;
      disabledHintText?: string;
      disabled?: boolean;
    }>(),
    {
      titleText: "Drag and Drop",
      actionText: "Click to upload",
      separatorText: "or",
      hintText: "PNG, JPG or PDF, Max size of 2MB",
      disabledHintText: "Choose a payment method first",
      disabled: false,
    }
  );

  function onClick() {
    if (props.disabled) return;
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
    if (props.disabled) return;
    isHover.value = true;
  }
  function onDragLeave() {
    isHover.value = false;
  }
  function onDrop(event: DragEvent) {
    if (props.disabled) return;
    isHover.value = false;
    if (event.dataTransfer && event.dataTransfer.files.length) {
      emit("files", Array.from(event.dataTransfer.files));
    }
  }
</script>
