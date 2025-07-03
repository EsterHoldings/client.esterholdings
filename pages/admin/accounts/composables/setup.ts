import { debounce } from "~/utils/helper/debounce";
import useAppCore from "~/composables/useAppCore";

import {
  accountsData,
  page,
  perPage,
  totalRows,
  isLoading,
  isLoadingSearch,
  searchFields,
  searchFilter,
} from "~/pages/admin/accounts/composables/index";

export function useAccountsMethods() {
  interface IPermissionItem {
    name: string;
  }
  const appCore = useAppCore();

  const loadData = async (isFilterQuery = false) => {
    const params = {
      page: isFilterQuery ? 1 : page.value,
      perPage: perPage.value,
      searchFilter: searchFilter.value,
      searchFields: searchFields.value,
    };

    const responseAccounts = await appCore.accounts.get(params);

    totalRows.value = responseAccounts.data.data.total;

    accountsData.length = 0;
    Object.assign(accountsData, responseAccounts.data.data.data);

    isLoading.value = false;
  };

  const handleClickDeleteIcon = async (id: string) => {
    await appCore.accounts.delete(id);
    await loadData();
  };

  const handleChangePerPage = async (value: number) => {
    page.value = 1;
    perPage.value = value;
    await loadData();
  };

  const handleChangePage = async (value: number) => {
    page.value = value;
    await loadData();
  };

  const handleInputSearch = debounce(async (value: any) => {
    try {
      isLoadingSearch.value = true;
      searchFilter.value = value;
      await loadData(true);
    } finally {
      isLoadingSearch.value = false;
    }
  }, 300);

  return {
    loadData,
    handleClickDeleteIcon,
    handleChangePerPage,
    handleChangePage,
    handleInputSearch,
  };
}
