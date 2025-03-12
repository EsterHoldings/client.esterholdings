<template>
  <div>
    <div v-if="isMenuOpen" class="overlay blurred"></div>
    <div :class="{ blurred: isBlurred || isMenuOpen }" class="header__wrapper">
      <UiContainer>
        <header class="header">
          <div class="logo">
            <UiIconLogo />
          </div>

          <div
            class="burger-menu"
            :class="{ 'burger-menu--open': isMenuOpen }"
            @click="toggleMenu"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <nav class="nav" :class="{ 'nav--open': isMenuOpen }">
            <HeaderLink
              v-for="link in linksList"
              :key="link"
              :name="link.name"
              :path="link.path"
            />
          </nav>
          <div class="actions-wrapper">
            <div class="actions">
              <UiButtonDefault state="link" class="login"
                >Log In</UiButtonDefault
              >

              <UiButtonDefault state="primary" class="register"
                >Register</UiButtonDefault
              >
              <UiIconGlobe class="icon" />
              <UiIconMoon class="icon" />
            </div>
          </div>
        </header>

        <div
          v-if="isMenuOpen"
          :class="{ 'nav--open': isMenuOpen }"
          class="mobile-nav"
        >
          <UiContainer>
            <nav>
              <HeaderMobileLink
                v-for="link in linksList"
                :key="link"
                :name="link.name"
                :path="link.path"
              />
            </nav>
          </UiContainer>
        </div>
      </UiContainer>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import useTrackScroll from "./composables/trackScroll";
import UiIconGlobe from "~/components/ui/UiIconGlobe.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconMoon from "~/components/ui/UiIconMoon.vue";
import UiIconSun from "~/components/ui/UiIconSun.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import HeaderLink from "./components/HeaderLink.vue";
import HeaderMobileLink from "./components/HeaderMobileLink.vue";
import UiContainer from "~/components/ui/UiContainer.vue";

const { isBlurred } = useTrackScroll();
const isMenuOpen = ref(false);

const linksList = [
  {
    name: "Trading",
    path: "#",
  },
  {
    name: "Partnership",
    path: "#",
  },
  {
    name: "Company",
    path: "#",
  },
];

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
};
</script>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 40, 0.05);
  backdrop-filter: blur(10px);
  z-index: 9999;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  background: transparent;
  transition: backdrop-filter 0.3s ease, background-color 0.3s ease;
  z-index: 9999;

  &__wrapper {
    position: fixed;
    width: 100%;
    z-index: 10000;
  }
}

.blurred {
  background: rgba(0, 0, 40, 0.05);
  backdrop-filter: blur(10px);
}

// .logo {
//   font-size: 20px;
//   font-weight: bold;
//   color: white;
//   margin-left: 10px;
// }

.nav {
  display: flex;
  gap: 15px;

  &--open {
    display: flex;
  }
}

.burger-menu {
  display: none;
  width: 30px;
  height: 25px;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  z-index: 10001;
  order: 6;

  span {
    display: block;
    width: 100%;
    height: 3px;
    background: white;
    border-radius: 3px;
    transition: 0.3s;
  }
}

.burger-menu--open {
  span:nth-child(1) {
    transform: translateY(12px) rotate(45deg);
  }
  span:nth-child(2) {
    opacity: 0;
  }
  span:nth-child(3) {
    transform: translateY(-10px) rotate(-45deg);
  }
}

.mobile-nav {
  position: fixed;
  top: 80px;
  left: 0;
  width: 100%;
  height: calc(100vh - 80px);
  transition: backdrop-filter 0.3s ease, background-color 0.3s ease;
  padding: 40px;
  z-index: 10001;
  transform: translateY(-30px) scale(0.98);
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;

  nav {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
}

.mobile-nav.nav--open {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.actions {
  position: relative;
  display: flex;
  width: auto;
  align-items: center;
  gap: 10px;
  margin-right: 20px;

  .icon {
    cursor: pointer;
  }
}

@media (max-width: 991px) {
  .nav {
    display: none;
  }

  .burger-menu {
    display: flex;
  }
}

@media (max-width: 575px) {
  .logo {
    svg {
      width: auto;
      height: 35px;
    }
  }

  .login {
    padding: 0;
  }

  .register {
    padding: 15px;
  }

  .actions {
    margin-right: 0;
  }
}
</style>
