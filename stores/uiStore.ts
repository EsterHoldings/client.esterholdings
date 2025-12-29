import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("ui", () => {
  const headerScrolled = false;
  const showMenu = ref(false);
  const notificationsOpen = ref(false);

  const toggleMenu = () => {
    return (showMenu.value = !showMenu.value);
  };

  const openNotifications = () => {
    notificationsOpen.value = true;
  };

  const closeNotifications = () => {
    notificationsOpen.value = false;
  };

  const toggleNotifications = () => {
    notificationsOpen.value = !notificationsOpen.value;
  };

  return {
    headerScrolled,
    showMenu,
    toggleMenu,
    notificationsOpen,
    openNotifications,
    closeNotifications,
    toggleNotifications,
  };
});
