import useAppCore from "../../../../composables/useAppCore";
import { reactive, ref, computed } from "vue";
import { useI18n } from "vue-i18n";

export const appCore = useAppCore();
export const isLoading = ref(false);
export const isLoadingSearch = ref(false);
export const page = ref(1);
export const perPage = ref(15);
export const totalRows = ref(0);
export const searchFields = ref(["email", "first_name", "last_name", "phone"]);
export const searchFilter = ref("");
// export const rolesColumns = ref([
//   { title: "Id", key: "id" },
//   { title: "Email", key: "email" },
//   { title: "Firstname", key: "first_name" },
//   { title: "Lastname", key: "last_name" },
//   { title: "Phone", key: "phone" },
//   { title: "Created at", key: "created_at" },
//   { title: "", key: "options" },
// ]);

export const useRolesColumns = () => {
  const { t } = useI18n();

  return computed(() => [
    {
      title: t("admin.clients.components.clients-panel.columns.id"),
      key: "id",
    },
    {
      title: t("admin.clients.components.clients-panel.columns.email"),
      key: "email",
    },
    {
      title: t("admin.clients.components.clients-panel.columns.first_name"),
      key: "first_name",
    },
    {
      title: t("admin.clients.components.clients-panel.columns.last_name"),
      key: "last_name",
    },
    {
      title: t("admin.clients.components.clients-panel.columns.phone"),
      key: "phone",
    },
    {
      title: t("admin.clients.components.clients-panel.columns.created_at"),
      key: "created_at",
    },
    { title: "", key: "options" },
  ]);
};

export let clientsData = reactive([]);
