<template>
  <header class="side-bar-cabinet">
    <div class="side-bar-cabinet__top">

      <div class="side-bar-cabinet__top__logo">
        <NuxtLink to="/"
        >
          <UiIconLogo
              :class="{
              'svg-invert': isThemeLight,
            }"
          />
        </NuxtLink>
      </div>

      <div class="side-bar-cabinet__top__notifications">
        <UiIconBell @click="handleClickNotifications" />
        <span class="side-bar-cabinet__top__notifications_counter">3</span>

        <PanelDefault
            v-if="isOpen"
            class="side-bar-cabinet__top__notifications__content"
        >

          <div class="side-bar-cabinet__top__notifications__content_options">
            <span>14 items</span>
            <UiButtonDefault state="info--outline--small">Clean</UiButtonDefault>
          </div>

          <div
              v-for="notification in notifications"
              :key="notification.message"
              :class="['side-bar-cabinet__top__notification', notification.type, {'was-read': notification.wasRead}]"
          >
            {{notification.message }}
            <UiIconDelete class="side-bar-cabinet__top__notification__remove" />
          </div>

          <div
              v-if="!isLoading && notifications.length === 0"
              class="side-bar-cabinet__top__notifications__content__no-data"
          >
            <UiIconBell />
            <span>You have no notifications yet</span>
          </div>
        </PanelDefault>
      </div>

      <div class="side-bar-cabinet__top__profile">
        <NuxtLink to="/ru/profile">
          <div
              :class="[
              'side-bar-cabinet__top__profile__image',
              { active: isProfileRoute },
            ]"
          >
            <UiIconUser v-if="!authStore.photoUrl"/>
            <img
                v-if="authStore.photoUrl"
                :src="authStore.photoUrl"
                alt="User Photo"
            />
          </div>
        </NuxtLink>
      </div>

      <div class="side-bar-cabinet__actions">
        <LanguageSwitcher isSidebar :isInvert="isThemeLight" class="icon"/>

        <transition name="fade" mode="out-in">
          <span
              :key="themeStore.currentTheme"
              @click="themeStore.toggleTheme()"
              class="icon"
          >
            <UiIconMoon v-if="themeStore.currentTheme === 'dark'"/>
            <UiIconSun
                v-else
                :class="{
                'svg-invert': isThemeLight,
              }"
            />
          </span>
        </transition>
      </div>
    </div>
    <div class="side-bar-cabinet__content">
      <TheCabinetSideBarMenu/>
    </div>
    <div class="side-bar-cabinet__logout" @click="handleClickLogout">
      <UiIconLogout
          :class="{
          'svg-invert': isThemeLight,
        }"
      />
    </div>
  </header>
</template>

<script lang="ts" setup>
import {useUiStore} from "~/stores/uiStore";
import {useThemeStore} from "~/stores/themeStore.js";
import {useAuthStore} from "~/stores/authStore";
import {useRoute} from "vue-router";
import {navigateTo} from "nuxt/app";
import {computed, reactive, ref} from "vue";

import LanguageSwitcher from "~/components/block/LandingHeader/components/LanguageSwitcher.vue";
import TheCabinetSideBarMenu from "~/components/block/TheCabinetSideBarMenu.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconLogout from "~/components/ui/UiIconLogout.vue";
import UiIconMoon from "~/components/ui/UiIconMoon.vue";
import UiIconSun from "~/components/ui/UiIconSun.vue";
import UiIconUser from "~/components/ui/UiIconUser.vue";
import UiIconBell from "~/components/ui/UiIconBell.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconDelete from "~/components/ui/UiIconDelete.vue";

const authStore = useAuthStore();
const themeStore = useThemeStore();

const isOpen = ref(false)
const isLoading = ref(false)
const notifications = reactive([
  {
    type: 'info',
    message: 'Test info notification message',
    wasRead: false
  },
  {
    type: 'warning',
    message: 'Test warning notification message',
    wasRead: false
  },
  {
    type: 'success',
    message: 'Test success notification message',
    wasRead: false
  },
  {
    type: 'danger',
    message: 'Test danger notification message',
    wasRead: true
  },
  {
    type: 'info',
    message: 'Test info notification message',
    wasRead: true
  },
  {
    type: 'info',
    message: 'Test info notification message',
    wasRead: true
  },
  {
    type: 'info',
    message: 'Test info notification message',
    wasRead: true
  },
  {
    type: 'info',
    message: 'Test info notification message',
    wasRead: true
  },
  {
    type: 'info',
    message: 'Test info notification message',
    wasRead: true
  },
  {
    type: 'info',
    message: 'Test info notification message',
    wasRead: true
  },
])

if (!authStore.user) {
  authStore.initAuth();
}

const handleClickLogout = () => {
  authStore.setAccessToken("");
  navigateTo("/auth/login");
};

const isThemeLight = computed(() => {
  return themeStore.currentTheme !== "dark";
});

const route = useRoute();
const isProfileRoute = computed(() => {
  const segments = route.path.split("/");
  const last = segments[segments.length - 1];
  return last === "profile";
});

const handleClickNotifications = () => isOpen.value = !isOpen.value
</script>

<style lang="scss" scoped>
.side-bar-cabinet {
  position: fixed;
  color: var(--ui-text-main);
  height: 100vh;
  width: 6.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-right: 1px solid var(--color-stroke-ui);
  background-color: var(--ui-background-sidebar);
  z-index: 1;

  box-shadow: 0 0 5px -1px rgba(255, 249, 249, 0.1);
  transition: .1s;

  &:hover {
    transition: 0.3s;
    box-shadow: 0 0 5px 1px var(--ui-background-sidebar);
  }

  &__top {
    height: auto;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    flex-direction: column;

    &__logo {
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__profile {
      &__image {
        margin: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 62px;
        width: 62px;
        border: 3px solid var(--ui-text-main);
        border-radius: 25%;

        img {
          width: 60px;
          height: 58px;
          object-fit: cover;
          border-radius: 23%;
        }

        &.active {
          border-color: var(--ui-primary-main);
        }
      }

      &__name {
        margin-top: 15px;
        width: 100%;
        font-size: 13px;
      }
    }

    &__notification {
      padding: 20px;
      background-color: var(--color-stroke-ui-dark);
      margin-bottom: 10px;
      border-radius: 10px;
      position: relative;

      &__remove {
        position: absolute;
        top: 10px;
        right: 10px;
        opacity: .5;

        &:hover {
          opacity: 1;
        }
      }

      &.info { border: 1px solid var(--color-info); color: var(--color-info); }
      &.success { border: 1px solid var(--color-success); color: var(--color-success); }
      &.warning { border: 1px solid var(--color-warning); color: var(--color-warning); }
      &.danger { border: 1px solid var(--color-danger); color: var(--color-danger); }
      &.was-read { opacity: 0.3; }

      &:hover {
        opacity: 1;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    &__notifications {
      margin-bottom: 20px;
      position: relative;

      &_counter {
        height: 20px;
        width: 20px;
        font-size: 12px;
        font-weight: bold;
        background-color: var(--color-warning);
        color: var(--ui-text-main);
        border: 1px solid var(--color-danger);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: -8px;
        right: -8px;
      }

      &__content {
        padding: 20px;
        z-index: 5;
        position: absolute;
        top: 0;
        left: 40px;
        border-radius: 10px;
        background-color: var(--ui-background);
        border: 1px solid var(--color-stroke-ui-dark);
        box-shadow: 0 0 50px 25px rgba(0,0,0,0.75);
        width: 400px;
        min-height: 300px;
        max-height: 600px;
        overflow-y: scroll;

        &_options {
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        &__no-data {
          border-radius: 10px;
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
      }
    }
  }

  &__content {
    height: calc(100vh - 160px);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__actions {
    height: 72px;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    padding: 0 10px;
  }

  &__logout {
    height: 72px;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid var(--color-stroke-ui);

    padding: 0 10px;

    &:hover {
      background-color: var(--color-stroke-ui-dark);
    }

    &:active {
      background-color: var(--ui-background-panel);
    }
  }
}

.svg-invert {
  filter: invert(1);
}

@keyframes shadowPulse {
  0% {
    box-shadow: 0 0 1px -1px var(--ui-background);
  }
  100% {
    box-shadow: 0 0 5px 1px var(--color-stroke-ui-dark);
  }
}

.icon {
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
