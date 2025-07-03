<!--<template>-->
<!--  <div-->
<!--      class="drag-and-drop"-->
<!--      :class="{ 'drag-and-drop&#45;&#45;hover': isHover }"-->
<!--      @click="onClick"-->
<!--      @dragover.prevent="onDragOver"-->
<!--      @dragleave.prevent="onDragLeave"-->
<!--      @drop.prevent="onDrop"-->
<!--  >-->
<!--    <UiIconDocuments class="drag-and-drop__icon" />-->
<!--    <span class="drag-and-drop__text">-->
<!--      {{ isHover ? "Відпустіть файли, щоб завантажити" : "Перетягніть файли сюди або клікніть для вибору" }}-->
<!--    </span>-->
<!--    <input-->
<!--        ref="fileInput"-->
<!--        type="file"-->
<!--        class="drag-and-drop__input"-->
<!--        multiple-->
<!--        @change="onFileSelect"-->
<!--    />-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import { ref } from "vue";-->
<!--import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";-->

<!--const emit = defineEmits<{-->
<!--  (e: "files", files: File[]): void;-->
<!--}>();-->

<!--const fileInput = ref<HTMLInputElement | null>(null);-->
<!--const isHover = ref(false);-->

<!--function onClick() {-->
<!--  if (fileInput.value) {-->
<!--    fileInput.value.value = ""; // очистити попередній вибір-->
<!--    fileInput.value.click();-->
<!--  }-->
<!--}-->

<!--function onFileSelect(event: Event) {-->
<!--  const target = event.target as HTMLInputElement;-->
<!--  if (target.files && target.files.length) {-->
<!--    const selected: File[] = Array.from(target.files);-->
<!--    emit("files", selected);-->
<!--  }-->
<!--}-->

<!--function onDragOver() {-->
<!--  isHover.value = true;-->
<!--}-->

<!--function onDragLeave() {-->
<!--  isHover.value = false;-->
<!--}-->

<!--function onDrop(event: DragEvent) {-->
<!--  isHover.value = false;-->
<!--  if (event.dataTransfer && event.dataTransfer.files.length) {-->
<!--    const dropped: File[] = Array.from(event.dataTransfer.files);-->
<!--    emit("files", dropped);-->
<!--  }-->
<!--}-->
<!--</script>-->

<!--<style lang="scss" scoped>-->
<!--.drag-and-drop {-->
<!--  position: relative;-->
<!--  min-height: 80px;-->
<!--  width: 100%;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  border: 1px dashed var(&#45;&#45;ui-text-main);-->
<!--  border-radius: 8px;-->
<!--  flex-direction: column;-->
<!--  cursor: pointer;-->
<!--  transition: background-color 0.2s ease;-->

<!--  &&#45;&#45;hover {-->
<!--    background-color: rgba(255, 255, 255, 0.05);-->
<!--  }-->

<!--  &__icon {-->
<!--    margin-top: 10px;-->
<!--    font-size: 24px;-->
<!--  }-->

<!--  &__text {-->
<!--    margin: 10px 0;-->
<!--    color: var(&#45;&#45;ui-text-secondary);-->
<!--    font-size: 14px;-->
<!--    text-align: center;-->
<!--    padding: 10px;-->
<!--  }-->

<!--  &__input {-->
<!--    position: absolute;-->
<!--    top: 0;-->
<!--    left: 0;-->
<!--    opacity: 0;-->
<!--    pointer-events: none;-->
<!--    width: 100%;-->
<!--    height: 100%;-->
<!--  }-->
<!--}-->
<!--</style>-->



<template>
  <div
      class="drag-and-drop"
      :class="{ 'drag-and-drop--hover': isHover }"
      @click="onClick"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
  >
    <UiIconDocuments class="drag-and-drop__icon" />
    <span class="drag-and-drop__text">
      {{ isHover
        ? "Відпустіть файли, щоб завантажити"
        : "Перетягніть файли сюди або клікніть для вибору" }}
    </span>
    <input
        ref="fileInput"
        type="file"
        class="drag-and-drop__input"
        multiple
        @change="onFileSelect"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";

// Ми оголошуємо, що цей компонент эммітує подію "files" із масивом File[]
const emit = defineEmits<{
  (e: "files", files: File[]): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isHover = ref(false);

function onClick() {
  if (fileInput.value) {
    fileInput.value.value = ""; // Скидаємо старий вибір, щоб можна було вибрати ті самі файли вдруге
    fileInput.value.click();
  }
}

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length) {
    // Перетворюємо FileList у звичайний масив File[]
    const selected: File[] = Array.from(target.files);
    // Виводимо у подію "files" саме масив File[]
    emit("files", selected);
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
    const dropped: File[] = Array.from(event.dataTransfer.files);
    emit("files", dropped);
  }
}
</script>

<style lang="scss" scoped>
.drag-and-drop {
  position: relative;
  min-height: 80px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--ui-text-main);
  border-radius: 8px;
  flex-direction: column;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &--hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  &__icon {
    margin-top: 10px;
    font-size: 24px;
  }

  &__text {
    margin: 10px 0;
    color: var(--ui-text-secondary);
    font-size: 14px;
    text-align: center;
    padding: 10px;
  }

  &__input {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    pointer-events: none;
    width: 100%;
    height: 100%;
  }
}
</style>
