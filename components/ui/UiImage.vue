<template>
  <div class="image-wrapper" :style="{ width: width, height: height }">
    <div v-if="!loaded" class="image-placeholder">
      <UiLoaderPlaceholder />
    </div>
    <img
        v-show="loaded"
        @load="onLoad"
        @error="onError"
        :id="id"
        :src="src"
        :alt="alt"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import UiLoaderPlaceholder from '~/components/ui/UiLoaderPlaceholder.vue'

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  /** необов’язково: можна задати розміри іззовні */
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '100%',
  },
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const loaded = ref(false)
const failed = ref(false)

function onLoad() {
  loaded.value = true
}
function onError() {
  loaded.value = false
  failed.value = true
}

function handleClick() {
  emit('click')
}
</script>

<style lang="scss" scoped>
.image-wrapper {
  position: relative;
  display: block;
  cursor: pointer;
  overflow: hidden;
  background-color: var(--color-stroke-ui-dark);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity .2s ease-in;
  }

  .image-placeholder {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
