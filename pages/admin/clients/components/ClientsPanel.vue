<template>
  <PanelDefault title="# Clients">
    <template #title-extra>
      <div class="add-btn" @click="handleClickAddRole">+</div>
    </template>
    <ClientsPanelSearch
        @input="handleInputSearch"
        :isLoading="isLoadingSearch"
        :value="searchFilter"
    />
    <TableDefault
        :columns="rolesColumns"
        :data="data"
        :isLoading="isLoading"
        :rowsPerPage="15"
    />
    <PaginationDefault
        :isLoading="isLoading"
        :perPage="perPage"
        :page="page"
        :totalRows="totalRows"
        @perPageChange="handleChangePerPage"
        @pageChange="handleChangePage"
    />
  </PanelDefault>
</template>

<script lang="ts" setup>
import {computed, inject, onMounted} from "vue";

import ClientsPanelSearch from "~/pages/admin/clients/components/ClientsPanelSearch.vue";
import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import TableDefault from "~/components/block/tables/TableDefault.vue";

import {
  page, perPage, totalRows,
  isLoading, isLoadingSearch,
  searchFilter, rolesColumns,
  clientsData,
} from "~/pages/admin/clients/composables";

import {
  handleInputSearch,
  handleChangePage, handleChangePerPage,
  loadData, handleClickDeleteIcon
} from "~/pages/admin/clients/composables/setup";
import ClientsPanelEdit from "~/pages/admin/clients/components/ClientsPanelEdit.vue";
import ClientsPanelAddNew from "~/pages/admin/clients/components/ClientsPanelAddNew.vue";
import UiIconEdit from "~/components/ui/UiIconEdit.vue";
import UiIconDelete from "~/components/ui/UiIconDelete.vue";
import useEventBus from "~/composables/useEventBus";

const { openModal } = inject("modalControl") as { openModal: Function };


const handleClickAddRole = () =>
    openModal(ClientsPanelAddNew, { title: "Add new Client" });
const handleClickEditIcon = (id: string) =>
    openModal(ClientsPanelEdit, { title: "Edit Client", id });


const extendClientData = () => {
  clientsData.forEach((client) => {
    client.options = [
      {
        isIcon: true,
        is: UiIconEdit,
        props: {},
        events: { click: () => handleClickEditIcon(client.id) },
      },
      {
        isIcon: true,
        is: UiIconDelete,
        props: {},
        events: { click: () => handleClickDeleteIcon(client.id) },
      },
    ];
  });
}

const data = computed(() => {
  extendClientData();
  Object.assign(clientsData, clientsData);

  return clientsData;
})

onMounted(async () => {
  await loadData();
  useEventBus.on('loadDataForUsers', loadData)
});
</script>

<style lang="scss" scoped>
.add-btn {
  background-color: var(--color-secondary);
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.1s;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.5;
  }
}
</style>
