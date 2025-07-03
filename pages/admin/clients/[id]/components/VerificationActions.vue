<template>
  <div class="doc-actions">
    <button
        class="doc-actions__btn doc-actions__btn--rejected"
        :class="{'active': status === 'rejected'}"
        @click="onReject"
        title="Rejected"
    >
      <UiIconDelete />
    </button>
    <button
        class="doc-actions__btn doc-actions__btn--pending"
        :class="{'active': status === 'pending'}"
        @click="onPending"
        title="Pending"
    >
      <UiIconWarning />
    </button>
    <button
        class="doc-actions__btn doc-actions__btn--approved"
        :class="{'active': status === 'approved'}"
        @click="onApprove"
        title="Approved"
    >
      <UiIconSuccess />
    </button>
  </div>
</template>

<script lang="ts" setup>

import UiIconDelete from "~/components/ui/UiIconDelete.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";

const props = defineProps<{ status: string }>()

const emit = defineEmits<{
  (e: 'reject', doc: any): void
  (e: 'pending', doc: any): void
  (e: 'approve', doc: any): void
}>()

function onReject(doc: any)   { emit('reject', doc) }
function onPending(doc: any)  { emit('pending', doc) }
function onApprove(doc: any)  { emit('approve', doc) }
</script>

<style scoped>
.doc-actions {
  display: flex;
}

.doc-actions__btn {
  border: none;
  padding: 4px;
  border-radius: 10px;
  cursor: pointer;
  transition: background .2s;

  height: 30px;
  width: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: var(--color-stroke-ui-dark);

  opacity: .3;

  &:hover {
    opacity: 1;
  }

  &.active {
    opacity: 1;
  }
}

.doc-actions__btn:hover {
  background: rgba(255,255,255,0.1);
}

.doc-actions__btn--rejected  { color: #e74c3c }
.doc-actions__btn--pending   { color: #f1c40f }
.doc-actions__btn--approved  { color: #2ecc71 }
</style>
