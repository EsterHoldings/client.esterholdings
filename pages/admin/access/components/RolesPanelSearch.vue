<template>
  <div class="panel-search">
    <UiInput
        class="panel-search__input"
        placeholder="Search"
        @input="handleInputSearch"
        :borderNone="true"
        :paddingNone="true"
        :isLoading="isLoadingSearch"
        :value="searchFilter"
    >
      <template #icon-left>
        <UiIconSearch/>
      </template>
    </UiInput>
  </div>
</template>

<script lang="ts" setup>
import UiInput from "~/components/ui/UiInput.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";

const emit = defineEmits(['input'])
const props = defineProps({
  searchFilter: {
    type: String,
    default: ''
  },
  isLoadingSearch: {
    type: Boolean,
    default: false
  }
})
const handleInputSearch = event => emit('input', event)
</script>

<style lang="scss" scoped>
.panel-search {
  border: none;
  border-radius: 0;
  border-top: 1px solid var(--color-stroke-ui-dark);
  margin-bottom: 0;

  &__input {
    border: none;
  }
}
</style>