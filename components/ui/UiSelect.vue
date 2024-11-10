<template>
  <div class="select">
    <div class="select__body" @click="handleClick">
      {{ currentValueItem?.text }}
    </div>

    <div class="select__options" v-if="listIsOpen">
      <div
        class="select__option"
        v-for="(option, index) in listOfOptions"
        @click="chooseTheOption(index)"
      >
        {{ option.text }}
      </div>
    </div>

    <select>
      <option
        v-for="option of listOfOptions"
        :value="option.value"
        :key="option.text"
        :selected="currentValueItem?.value === option.value"
      >
        {{ option.text }}
      </option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const emit = defineEmits(["change"]);
const props = defineProps({
  listOfOptions: {
    type: Array,
    default: [],
  },
});

const currentValueIndex = ref(0);
const listIsOpen = ref(false);

const currentValueItem = computed(() => {
  return props.listOfOptions[
    currentValueIndex.value as keyof typeof props.listOfOptions
  ];
});

const handleClick = (): void => {
  listIsOpen.value = !listIsOpen.value;
};

const chooseTheOption = (index: number): void => {
  currentValueIndex.value = index;
  listIsOpen.value = false;
  emit("change", currentValueIndex.value);
};
</script>

<style lang="scss" scoped>
.select {
  position: relative;

  &__body {
    padding: 0 20px;
    border: 1px solid gainsboro;
    height: 40px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    user-select: none;
    border-radius: 10px;
  }

  &__options {
    position: absolute;
    width: 100%;
    border-radius: 10px;
    overflow: hidden;
  }

  &__option {
    padding: 0 20px;
    border: 1px solid gainsboro;
    height: 40px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    background-color: gainsboro;
    border-top: 1px solid white;
    user-select: none;
  }
}

select {
  display: none;
}
</style>
