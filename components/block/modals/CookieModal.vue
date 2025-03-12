<template>
  <div>
    <div v-if="showCookieModal" class="cookie-modal">
      <UiTextH5 class="cookie-modal_text">
        This site uses cookies to enhance user experience. By continuing to use
        the site, you agree to our use of cookies.
      </UiTextH5>
      <div class="cookie-modal__actions">
        <UiButtonDefault state="primary" @click="acceptCookies">
          Accept
        </UiButtonDefault>
        <UiButtonDefault state="warning" @click="declineCookies">
          Decline
        </UiButtonDefault>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";

const showCookieModal = ref(false);

const acceptCookies = () => {
  showCookieModal.value = false;
  localStorage.setItem("cookiesAccepted", JSON.stringify(true));
};

const declineCookies = () => {
  showCookieModal.value = false;
};

onMounted(() => {
  if (JSON.parse(localStorage.getItem("cookiesAccepted")) === true) {
    showCookieModal.value = false;
  } else {
    showCookieModal.value = true;
  }
});
</script>

<style lang="scss" scoped>
.cookie-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 40px;
  background: rgba(0, 0, 40, 0.05);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 50px;
  z-index: 10001;
  transition: transform 0.3s ease-in-out;

  &_text {
    color: var(--color-ui-primary-defalt);
  }
}

.cookie-modal__actions {
  display: flex;
  gap: 10px;
}
</style>
