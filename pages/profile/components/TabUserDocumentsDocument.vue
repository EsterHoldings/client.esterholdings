<template>
  <div class="document">
    <div class="document__image">
      <UiIconImage />
    </div>
    <div class="document__content">
      <div class="document__content-left">
        <div class="document__content-left__doc-name">
          # {{ data.document_data.number }}
        </div>
        <div class="document__content-left__status">
          Status: in progress
        </div>
      </div>
      <div class="document__content-right">
        <span class="document__content-right__time">
          <UiIconTime />1 day ago
        </span>
        <span class="document__content-right__options">
          <UiIconTrash @click="handleRemoveDocument" />
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import UiIconTime from "~/components/ui/UiIconTime.vue";
import UiIconImage from "~/components/ui/UiIconImage.vue";
import UiIconTrash from "~/components/ui/UiIconTrash.vue";
import UiIconEdit from "~/components/ui/UiIconEdit.vue";
import useAppCore from "~/composables/useAppCore";

interface DocumentInterface {
  document_data: object
  document_type: string
  created_at: string
}

const props = defineProps({
  data: {
    type: Object,
    require: true
  }
});

const emits = defineEmits(['documentWasRemoved']);

const appCore = useAppCore();

const handleRemoveDocument = async () => {
  await appCore.documents.delete(props.data.id)
  emits('documentWasRemoved');
}
</script>

<style lang="scss" scoped>
.document {
  height: 100px;
  width: 100%;
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;

  &:hover {
    background-color: var(--color-stroke-ui-dark);
  }

  &:last-child {
    margin-bottom: 0;
  }

  &__image {
    height: 100%;
    width: 100px;
    border: 1px dashed var(--ui-text-main);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    width: 100%;
    height: 100%;
    display: flex;

    &-left {
      width: 100%;
      position: relative;

      &__doc-name {
        margin-bottom: 10px;
      }

      &__status {
        color: var(--color-warning);
      }
    }

    &-right {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;

      &__time {
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        white-space: pre;

        svg {
          height: 20px;
          width: 20px;
          margin-right: 5px;
        }
      }

      &__options {
        display: flex;
        align-items: center;

        svg {
          margin-right: 10px;
          fill: var(--ui-text-main);

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
  }
}
</style>