import {debounce} from "~/utils/helper/debounce";

import {
    appCore, clientsData,
    page, perPage, totalRows,
    isLoading, isLoadingSearch,
    searchFields, searchFilter,
} from "~/pages/admin/clients/composables/index";

interface IPermissionItem {
    name: string;
}

// Load Data
export const loadData = async (isFilterQuery = false) => {
    const params = {
        page: isFilterQuery ? 1 : page.value,
        perPage: perPage.value,
        searchFilter: searchFilter.value,
        searchFields: searchFields.value,
    };

    const responseClients = await appCore.clients.get(params);

    totalRows.value = responseClients.data.data.total;

    // TOD :: When lost reactive
    clientsData.length = 0;
    Object.assign(clientsData, responseClients.data.data.data);

    isLoading.value = false;
};

// Methods
export const handleClickDeleteIcon = async (id: string) => {
    await appCore.clients.delete(id);
    await loadData();
};
export const handleChangePerPage = async (value: number) => {
    page.value = 1;
    perPage.value = value;
    await loadData();
};
export const handleChangePage = async (value: number) => {
    page.value = value;
    await loadData();
};
export const handleInputSearch = debounce(async (event: any) => {
    try {
        isLoadingSearch.value = true;
        searchFilter.value = event.target.value;
        await loadData(true);
    } finally {
        isLoadingSearch.value = false;
    }
}, 300);






