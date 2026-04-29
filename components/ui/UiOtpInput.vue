<template>
  <div
    class="otp-input"
    :class="{
      'otp-input--invalid': isInvalid,
      'otp-input--disabled': disabled,
    }">
    <input
      v-for="(_, index) in boxes"
      :key="index"
      :ref="(el) => setInputRef(el, index)"
      :value="digits[index]"
      :disabled="disabled"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="1"
      autocomplete="one-time-code"
      class="otp-input__box"
      @focus="handleFocus(index)"
      @keydown="handleKeydown($event, index)"
      @input="handleInput($event, index)"
      @paste="handlePaste($event, index)" />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch, type ComponentPublicInstance } from "vue";

  const props = withDefaults(
    defineProps<{
      value?: string;
      length?: number;
      disabled?: boolean;
      autofocus?: boolean;
      isInvalid?: boolean;
    }>(),
    {
      value: "",
      length: 6,
      disabled: false,
      autofocus: false,
      isInvalid: false,
    }
  );

  const emit = defineEmits<{
    (event: "input", value: string): void;
  }>();

  const inputRefs = ref<Array<HTMLInputElement | null>>([]);

  const normalizeDigits = (raw: string): string[] =>
    String(raw ?? "")
      .replace(/\D/g, "")
      .slice(0, props.length)
      .padEnd(props.length, " ")
      .split("")
      .map(char => (char === " " ? "" : char));

  const digits = ref<string[]>(normalizeDigits(props.value));
  const boxes = computed(() => Array.from({ length: props.length }));

  const syncFromValue = (value: string) => {
    digits.value = normalizeDigits(value);
  };

  watch(
    () => props.value,
    value => {
      syncFromValue(String(value ?? ""));
    },
    { immediate: true }
  );

  const emitValue = () => {
    emit("input", digits.value.join(""));
  };

  const focusIndex = async (index: number) => {
    await nextTick();
    const safeIndex = Math.min(Math.max(index, 0), props.length - 1);
    const target = inputRefs.value[safeIndex];
    target?.focus();
    target?.select();
  };

  const focusFirstEmpty = async () => {
    const emptyIndex = digits.value.findIndex(char => char === "");
    await focusIndex(emptyIndex === -1 ? props.length - 1 : emptyIndex);
  };

  watch(
    () => props.autofocus,
    async value => {
      if (value && !props.disabled) {
        await focusFirstEmpty();
      }
    },
    { immediate: true }
  );

  const setInputRef = (element: Element | ComponentPublicInstance | null, index: number) => {
    inputRefs.value[index] = element instanceof HTMLInputElement ? element : null;
  };

  const handleFocus = (index: number) => {
    inputRefs.value[index]?.select();
  };

  const handleInput = async (event: Event, index: number) => {
    const input = event.target as HTMLInputElement;
    const nextValue = String(input.value ?? "").replace(/\D/g, "");

    if (nextValue.length > 1) {
      const chars = nextValue.slice(0, props.length - index).split("");
      chars.forEach((char, offset) => {
        digits.value[index + offset] = char;
      });
      emitValue();
      await focusIndex(Math.min(index + chars.length, props.length - 1));
      return;
    }

    digits.value[index] = nextValue;
    emitValue();

    if (nextValue !== "" && index < props.length - 1) {
      await focusIndex(index + 1);
    }
  };

  const handlePaste = async (event: ClipboardEvent, index: number) => {
    event.preventDefault();
    const pasted = String(event.clipboardData?.getData("text") ?? "").replace(/\D/g, "");
    if (pasted === "") {
      return;
    }

    const chars = pasted.slice(0, props.length - index).split("");
    chars.forEach((char, offset) => {
      digits.value[index + offset] = char;
    });
    emitValue();
    await focusIndex(Math.min(index + chars.length, props.length - 1));
  };

  const handleKeydown = async (event: KeyboardEvent, index: number) => {
    const key = event.key;

    if (key === "Backspace") {
      event.preventDefault();
      if (digits.value[index] !== "") {
        digits.value[index] = "";
        emitValue();
        return;
      }

      if (index > 0) {
        digits.value[index - 1] = "";
        emitValue();
        await focusIndex(index - 1);
      }
      return;
    }

    if (key === "Delete") {
      event.preventDefault();
      digits.value[index] = "";
      emitValue();
      return;
    }

    if (key === "ArrowLeft") {
      event.preventDefault();
      if (index > 0) {
        await focusIndex(index - 1);
      }
      return;
    }

    if (key === "ArrowRight") {
      event.preventDefault();
      if (index < props.length - 1) {
        await focusIndex(index + 1);
      }
      return;
    }

    if (key === "Tab") {
      return;
    }

    if (!/^\d$/.test(key)) {
      event.preventDefault();
    }
  };

  defineExpose({
    focus: focusFirstEmpty,
  });
</script>

<style scoped lang="scss">
  .otp-input {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 10px;
    width: 100%;
  }

  .otp-input__box {
    width: 100%;
    min-width: 0;
    height: 52px;
    border-radius: 14px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-control-bg) 92%, transparent);
    color: var(--ui-text-main);
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    outline: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.2s ease,
      transform 0.2s ease;
  }

  .otp-input__box:focus {
    border-color: color-mix(in srgb, var(--ui-primary-main) 70%, white 10%);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
    transform: translateY(-1px);
  }

  .otp-input--invalid .otp-input__box {
    border-color: var(--color-danger);
  }

  .otp-input--disabled .otp-input__box {
    cursor: not-allowed;
    opacity: 0.65;
  }

  @media (max-width: 640px) {
    .otp-input {
      gap: 8px;
    }

    .otp-input__box {
      height: 48px;
      border-radius: 12px;
      font-size: 18px;
    }
  }
</style>
