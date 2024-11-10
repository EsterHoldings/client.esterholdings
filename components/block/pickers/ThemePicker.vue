<template>
  <div
    class="theme-picker"
    :class="{ active: isOpen }"
    @click="isOpen = !isOpen"
  >
    <span>Theme default:</span>
    <UiIconEyedropper />

    <div class="theme-picker__list" v-if="isOpen" @click.stop>
      <div
        v-for="(themeData, index) in themesData"
        class="theme-picker__item"
        :style="{
          'background-color': themeData.colors.background,
          'border-color': themeData.colors.text,
        }"
        @click.stop="handleThemeChoice(index)"
        :key="themeData.name"
      >
        <UiIconSun
          :style="{
            fill: themeData.colors.text,
          }"
        />
        <span
          class="theme-name"
          :style="{
            color: themeData.colors.text,
          }"
          >{{ themeData.name }}</span
        >
        <div class="theme-picker__item-colors">
          <span
            v-for="color in themeData.colors"
            :style="{
              'background-color': color,
            }"
            :key="color"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import UiIconEyedropper from "~/components/ui/UiIconEyedropper.vue";

const isOpen = ref(false);

const themesData = reactive([
  {
    name: "Dark",
    colors: {
      background: "black",
      text: "white",
      success: "green",
    },
  },
  {
    name: "Light",
    colors: {
      background: "white",
      text: "black",
      success: "#12ad12",
    },
  },
  {
    name: "Bright",
    colors: {
      background: "#c4c4ff",
      text: "#4753ff",
      success: "orange",
    },
  },
  {
    name: "Rain",
    colors: {
      background: "#2b1609",
      text: "#d4dae0",
      success: "green",
    },
  },
]);

const handleThemeChoice = (index: number) => {
  document.documentElement.style.setProperty(
    "--color-background",
    themesData[index].colors.background
  );
  document.documentElement.style.setProperty(
    "--color-text",
    themesData[index].colors.text
  );
};
</script>

<style lang="scss" scoped>
.theme-picker {
  display: flex;
  margin-right: 0;
  padding: 15px;
  border-radius: 5px;
  color: var(--color-dark);
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: #f7f6f6;
  }

  &.active {
    background-color: #f7f6f6;
  }

  span {
    margin-right: 10px;
  }

  &__list {
    position: absolute;
    box-shadow: -1px 8px 20px 0px rgba(0, 0, 0, 0.75);
    background-color: var(--color-light);
    border-radius: 10px;
    top: 60px;
    right: 0;
    width: 200px;
    border: 1px solid #8b9ca4;
    padding: 10px;
    transition: 0.3s;

    &.hidden {
      display: none;
    }
  }

  &__item {
    padding: 10px;
    background-color: #f3f2f2;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    border-radius: 8px;
    border: 1px solid #8b9ca4;
    transition: 0.3s;

    .theme-name {
      padding-left: 10px;
      width: 100%;
    }

    &:hover {
      //background-color: #c4bfbf;
      opacity: 0.8;
      transition: 0.3s;
    }

    &:last-child {
      margin-bottom: 0;
    }

    &-colors {
      display: flex;

      span {
        display: block;
        border: 1px solid #8f9fa6;
        margin-right: 5px;
        border-radius: 5px;
        width: 12px;
        height: 30px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
