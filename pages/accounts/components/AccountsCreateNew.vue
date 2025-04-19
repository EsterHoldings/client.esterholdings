<template>
  <div class="accounts__edit">
    <div
        class="accounts__edit__top"
        v-if="props.title"
    >
      <UiTextH4>{{ props.title }}</UiTextH4>
    </div>

    <div
        class="accounts__edit__content"
        :class="{'without-top': !props.title}"
    >
      <div class="accounts__edit__content__fields">

        <UiFormControl label="Account type" :errors="validatorAccountForm?.errorsFormData?.accountType?.errors">
          <UiSelect
              :data="accountTypes"
              :value="formData.accountType"
              @change="handleChangeSelectAccountType"
          />
        </UiFormControl>

        <UiFormControl label="Phone password" :errors="validatorAccountForm?.errorsFormData?.phonePassword?.errors">
          <UiInput
              type="password"
              placeholder="Enter phone password"
              :value="formData.phonePassword"
              :isDirty="validatorAccountForm?.errorsFormData?.phonePassword?.isDirty"
              :isInvalid="validatorAccountForm?.errorsFormData?.phonePassword?.errors?.length > 0"
              @blur="validatorAccountForm?.doValidateField('phonePassword', $event.target.value)"
              @input="validatorAccountForm?.doValidateField('phonePassword', $event.target.value)"
          />
        </UiFormControl>

      </div>
    </div>
  </div>

  <div class="accounts__edit__bottom">
    <UiButtonDefault
        class="accounts__edit__bottom__save-btn"
        state="secondary"
        @click="handleSubmitForm"
    >Open new account</UiButtonDefault>
  </div>
</template>

<script lang="ts" setup>
import { reactive, inject, onMounted } from "vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import {validateAccountForm, validatorAccountForm} from "~/pages/accounts/composables/validation";
import {formData} from "~/pages/accounts/composables";
import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiSelect from "~/components/ui/UiSelect.vue";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
})

let rolesData = reactive([]);
let accountTypes = reactive([
  {
    id: '465h56653g2df',
    value: '2dj76hg5f32fff',
    text: 'Forex & Crypto '
  },
  {
    id: 'd23d23d23d2r3',
    value: 'h7382d2783dh32',
    text: 'Ester News'
  }
])

const app = useAppCore();

const { closeModal } = inject("modalControl") as { closeModal: Function };

const handleChangeSelectAccountType = (val) => {
  console.log('handleChangeSelectAccountType', val);
  formData.accountType = val;
}

const getAccountTypes = async () => {
  // const response = await app.accountTypes.get({perPage: 20});
  // accountTypes = response.data.data.data;
};

const handleSubmitForm = async () => {
  validateAccountForm(async () => {
    try {
      await app.admins.post(formData);
      closeModal();
      useEventBus.emit("loadDataForAdmins");
    } catch (errorResponse) {
      console.log('handleSubmitForm -> errorResponse', errorResponse);
    }
  })
}

onMounted(async () => {
  await getAccountTypes();
})
</script>

<style lang="scss" scoped>
.accounts__edit {
  &__top {
    height: 50px;

    padding-left: 40px;
    padding-right: 20px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-bottom: 1px solid var(--color-stroke-ui-dark);
  }

  &__content {
    height: calc(100vh - 120px);

    &.without-top {
      height: calc(100vh - 50px);
    }

    &__fields {
      padding: 40px;

      .ui-form-control {
        margin-bottom: 20px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  &__bottom {
    height: 70px;

    padding-left: 40px;
    padding-right: 40px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-top: 1px solid var(--color-stroke-ui-dark);

    .btn {
      height: 40px;
    }
  }
}
</style>
