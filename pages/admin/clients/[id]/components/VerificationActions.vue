<template>
  <div class="doc-actions">
    <button
      v-if="props.enableComment"
      type="button"
      class="action-toggle action-toggle--comment"
      :class="{ active: commentText.length > 0 || props.comment?.length > 0 || '' }"
      @click="toggleComment"
      title="Коментар"
      aria-label="Коментар"
    >
      <UiIconComment />
    </button>
    <div class="action-group">
      <button
        type="button"
        class="action-toggle"
        :class="{ active: props.status === 'rejected' }"
        @click="onReject"
        title="Відхилено"
        aria-label="Відхилено"
      >
        <UiIconDelete />
      </button>
      <button
        type="button"
        class="action-toggle"
        :class="{ active: props.status === 'pending' }"
        @click="onPending"
        title="В очікуванні"
        aria-label="В очікуванні"
      >
        <UiIconAlert />
      </button>
      <button
        type="button"
        class="action-toggle"
        :class="{ active: props.status === 'approved' }"
        @click="onApprove"
        title="Підтверджено"
        aria-label="Підтверджено"
      >
        <UiIconCheck />
      </button>
    </div>

    <transition name="fade">
      <div v-if="isCommentOpen" class="comment-popup">

        <UiFormControl label="Comment">
          <UiTextarea
              :value="commentText || props.comment || ''"
              @input="handleInputComment"
              class="comment-popup__textarea"
              placeholder="Введіть коментар..."
          ></UiTextarea>
        </UiFormControl>

        <div class="comment-popup__actions">
          <UiButtonDefault
              state="info--outline--small"
              class="comment-popup__btn"
              @click="submitComment">
            Save
          </UiButtonDefault>

          <UiButtonDefault
              state="info--outline--small"
              class="comment-popup__btn"
              @click="cancelComment">
            Close
          </UiButtonDefault>
        </div>
      </div>
    </transition>

  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import UiIconDelete from '~/components/ui/UiIconDelete.vue';
import UiIconComment from '~/components/ui/UiIconComment.vue';
import UiTextarea from "~/components/ui/UiTextarea.vue";
import UiIconCheck from "~/components/ui/UiIconCheck.vue";
import UiIconAlert from "~/components/ui/UiIconAlert.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    default: ""
  },
  enableComment: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['updateStatus', 'updateComment'] as const);

const isCommentOpen = ref<boolean>(false);
const commentText = ref<string>('');

function onReject(doc: any)   { emit('updateStatus', {status: 'rejected', comment: commentText.value}) }

function onPending(doc: any)  { emit('updateStatus', {status: 'pending', comment: commentText.value}) }

function onApprove(doc: any)  { emit('updateStatus', {status: 'approved', comment: commentText.value}) }

const handleInputComment = (e:any) => {
  commentText.value = e.target.value;
}

const toggleComment = () => isCommentOpen.value = !isCommentOpen.value;

const submitComment = () => {
  isCommentOpen.value = false;
  console.log('SUBMIT', commentText.value);
  emit('updateStatus', {
    status: props.status,
    comment: commentText.value || ''
  });
}

const cancelComment = () => {
  console.log('cancelComment', props.comment);
  isCommentOpen.value = false;
  commentText.value = '';
}

onMounted(() => {
  console.log('ON MOUNTED', props);
  commentText.value = props.comment || '';
})
</script>

<style lang="scss" scoped>
.doc-actions {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border-radius: 10px;
  width: min-content;
  background: var(--color-stroke-ui-dark);
  border: 1px solid var(--color-stroke-ui-light);
}

.action-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  border-radius: 8px;
  color: var(--ui-text-main);
  background: transparent;
  border: none;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.action-toggle svg {
  height: 18px;
  width: 18px;
}

.action-toggle--comment {
  background: var(--ui-background-panel);
  border: 1px solid var(--color-stroke-ui-light);
  margin-right: 10px;
}

.action-toggle--comment.active {
  background: var(--color-stroke-ui-light);
  color: var(--ui-text-main);
}

.action-toggle--comment:hover {
  background: var(--color-stroke-ui-dark);
}

.action-toggle.active {
  background: var(--color-stroke-ui-light);
  color: #fff;
}

.action-toggle:not(.active):hover {
  background: var(--color-stroke-ui-light);
}


.comment-popup {
  position: absolute;
  top: 40px;
  left: 0;
  background: var(--ui-background);
  border: 1px solid var(--color-stroke-ui-dark);
  border-radius: 8px;
  padding: 8px;
  z-index: 10;
  min-width: 300px;
  transform: translate(-50%, 0);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.comment-popup__textarea {
  width: 100%;
  min-height: 60px;
  border: 1px solid var(--color-stroke-ui-dark);
  border-radius: 4px;
  padding: 4px;
  resize: vertical;
}

.comment-popup__actions {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 5px;
}

.comment-popup__btn {
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  min-width: min-content;
  width: 100%;
  cursor: pointer;
  color: #fff;
  transition: background 0.2s;
}

.comment-popup__btn:hover {
  background: var(--color-stroke-ui-dark);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
