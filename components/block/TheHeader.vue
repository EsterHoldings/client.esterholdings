<template>
  <header class="header">
    <nav>
      <NuxtLink to="/">
        <UiTextH1>Logo</UiTextH1>
      </NuxtLink>

      <div class="header__menu">
        <div class="header__menu-left"></div>
        <div class="header__menu-right">

          <div class="header__menu-right_item">
            <NuxtLink
                to="/docs"
            >Docs
            </NuxtLink>
          </div>

          <div class="header__menu-right_item">
            <NuxtLink
                to="/auth/login"
            >Log In
            </NuxtLink>
          </div>

          <div class="header__menu-right_item">
            <NuxtLink
                to="/auth/registration"
            >Sing Up
            </NuxtLink>
          </div>

        </div>
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import ThemePicker from "~/components/block/pickers/ThemePicker.vue";

const route = useRoute();

const currentRouteName = computed(() => route.name);
</script>

<style scoped lang="scss">
@import "@/assets/styles/variables";

.router-link-exact-active {
  opacity: 0.5;
}

.header {
  width: 100%;
  padding: 10px 0;

  nav {
    height: 100px;
    display: flex;
    padding: 0 40px;
    align-items: center;
    border-radius: 10px;
    border: 1px solid #8b9ba4;
    justify-content: space-between;
    //background-color: $secondary-color;
  }

  &__menu {
    width: 100%;
    display: flex;
    justify-content: space-between;

    &-left {
      display: flex;

      &_item {
        margin-left: 20px;

        &:first-child {
          margin-right: 0;
        }
      }
    }

    &-right {
      display: flex;
      align-items: center;

      &_item {
        display: flex;
        align-items: center;

        margin-right: 20px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
