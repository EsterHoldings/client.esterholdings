import useAppCore from "../../../../composables/useAppCore";
import {reactive, ref} from "vue";

export const appCore = useAppCore();
export const isLoading = ref(false);
export const isLoadingSearch = ref(false);
export const page = ref(1);
export const perPage = ref(15);
export const totalRows = ref(0);
export const searchFields = ref(["email", "first_name", "last_name", "phone"]);
export const searchFilter = ref("");
export const rolesColumns = ref([
    { title: "Id", key: "id" },
    { title: "Email", key: "email" },
    { title: "Firstname", key: "first_name" },
    { title: "Lastname", key: "last_name" },
    { title: "Phone", key: "phone" },
    { title: "Created at", key: "created_at" },
    { title: "", key: "options" },
]);

export let clientsData = reactive([]);