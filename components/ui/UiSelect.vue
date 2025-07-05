<template>
  <div :class="['select', { dropup }]" ref="wrapper">
    <div
      ref="body"
      class="select__body"
      :class="{ 'is-open': isOpen, 'is-invalid': props.isDirty && props.isInvalid }"
      @click="toggle"
      v-html="displayText"
    ></div>

    <div v-if="isOpen" class="select__options">
      <div
        class="select__option no-select"
        :class="{ active: internalValue === null }"
        @click="choose(null)"
      >{{ t("ui-components.ui-select") }}</div>
      <div
        v-for="item in data"
        :key="item.value"
        class="select__option"
        :class="{ active: internalValue === item.value }"
        @click="choose(item)"
        v-html="item.text"
      ></div>
    </div>

    <select v-model="internalValue" hidden>
      <option v-for="item in data" :key="item.value" :value="item.value" v-html="item.text"></option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { ref, computed, watch, nextTick } from "vue";

interface Option {
  id: string;
  value: string;
  text: string;
}
const { t } = useI18n({ useScope: "global" });

interface Props {
  data: Option[]
  value?: string | null
  isDirty?: boolean
  isInvalid?: boolean
}

const props = withDefaults(
    defineProps<Props>(),
    {
      isDirty: false,
      isInvalid: false,
    }
)
const emit = defineEmits(["change"]);
const data = props.data;

const isOpen = ref(false);
const dropup = ref(false);
const body = ref<HTMLElement | null>(null);

const internalValue = ref<string | null>(props.value ?? null);
watch(
  () => props.value,
  (v) => (internalValue.value = v ?? null)
);

const displayText = computed(
  () =>
    data.find((i) => i.value === internalValue.value)?.text ||
    t("ui-components.ui-select")
);

function toggle() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) nextTick(calcDropup);
}

function calcDropup() {
  if (!body.value) return;
  const rect = body.value.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const optionHeight = 40; // px per option
  const totalOptions = data.length + 1;
  const dropdownHeight = Math.min(250, totalOptions * optionHeight);
  dropup.value = spaceBelow < dropdownHeight;
}

function choose(item: Option | null) {
  internalValue.value = item?.value ?? null;
  console.log('-=-=-=-=-=-', item?.value, internalValue.value);
  emit("change", internalValue.value);
  isOpen.value = false;
}
</script>

<style scoped lang="scss">
.select {
  position: relative;
  &.dropup {
    .select__options {
      top: auto;
      bottom: 100%;
      border-bottom: none;
      border-radius: 10px 10px 0 0;
    }
    .select__body.is-open {
      border-top: none;
      border-radius: 0 0 10px 10px;
    }
  }
}

.select__body {
  box-sizing: border-box;
  padding: 0 1.25rem;
  height: 2.875rem;
  display: flex;
  align-items: center;
  border: 1px solid var(--color-stroke-ui-dark);
  border-radius: 10px;
  background: var(--ui-background);
  color: var(--color-ui-text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  &.is-open {
    border-bottom: none;
    border-radius: 10px 10px 0 0;
  }
  &.is-invalid {
    border-color: var(--color-danger);
  }
}

.select__options {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid var(--color-stroke-ui-dark);
  border-top: none;
  border-radius: 0 0 10px 10px;
  background: var(--ui-background);
  z-index: 1;
}

.select__option {
  padding: 0 1.25rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  border-top: 1px solid var(--color-stroke-ui-dark);
  background: var(--ui-background);
  color: var(--color-ui-text);
  cursor: pointer;
  &.active {
    font-weight: 600;
  }
}

.no-select {
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
}
</style>
