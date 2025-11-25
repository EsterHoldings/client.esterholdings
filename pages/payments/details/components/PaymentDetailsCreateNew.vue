<template>
  <div class="accounts__edit">
    <div class="accounts__edit__top" v-if="props.title">
      <UiTextH4>{{ props.title }}</UiTextH4>
    </div>

    <div class="accounts__edit__content" :class="{ 'without-top': !props.title }">
      <div class="accounts__edit__content__fields">
        <UiFormControl
            :label="'Payment detail name'"
            :errors="validatorPaymentDetailForm?.errorsFormData?.name?.errors"
        >
          <UiInput
              placeholder="Payment detail name"
              :value="formData.name"
              :isDirty="validatorPaymentDetailForm?.errorsFormData?.name?.isDirty"
              :isInvalid="validatorPaymentDetailForm?.errorsFormData?.name?.errors?.length > 0"
              @blur="validatorPaymentDetailForm?.doValidateField('name',$event.target.value)"
              @input="validatorPaymentDetailForm?.doValidateField('name',$event.target.value)"
          />
        </UiFormControl>

        <UiFormControl
            :label="t('cabinet.accounts.accounts-form.fields.accountType')"
            :errors="validatorPaymentDetailForm?.errorsFormData?.paymentSystemId?.errors"
        >
          <UiSelect
              :without-no-select="true"
              :data="paymentTypes"
              :value="formData.paymentSystemId"
              @change="handleChangeSelectPaymentType"
              :isDirty="validatorPaymentDetailForm?.errorsFormData?.paymentSystemId?.isDirty"
              :isInvalid="validatorPaymentDetailForm?.errorsFormData?.paymentSystemId?.errors?.length > 0"
              @blur="validatorPaymentDetailForm?.doValidateField('paymentSystemId',$event)"
          />
        </UiFormControl>

        <!-- ... -->

        <div v-if="hasSelectedPaymentSystem">
          <pre>{{ selectedPaymentSystem }}</pre>
        </div>
        <div v-else>HAVE NOT SELECTED</div>
      </div>
    </div>
  </div>

  <div class="accounts__edit__bottom">
    <UiButtonDefault
        class="accounts__edit__bottom__save-btn"
        state="secondary"
        @click="handleSubmitForm"
    >
      <span v-if="!isLoading">{{ t("cabinet.accounts.accounts-form.actions.submit") }}</span>
      <UiIconSpinnerDefault v-if="isLoading" />
    </UiButtonDefault
    >
  </div>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {reactive, inject, onMounted, ref, computed} from "vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import {
  validatePaymentDetailForm,
  validatorPaymentDetailForm,
} from "~/pages/payments/details/composables/validation";
import {formData} from "~/pages/payments/details/composables";
import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import {useToast} from "vue-toastification";

const isLoading = ref(false);
const {t} = useI18n({useScope: "global"});
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});

const app = useAppCore();
const {closeModal} = inject("modalControl") as { closeModal: Function };

const toast = useToast();
let paymentTypes = reactive([]);
let paymentSystems = reactive([]);
let selectedPaymentSystem = reactive({});

const hasSelectedPaymentSystem = computed(() => Object.keys(selectedPaymentSystem).length > 0)

function replaceReactiveObject(target, source) {
  for (const k of Object.keys(target)) delete target[k]
  if (source && typeof source === 'object') Object.assign(target, source)
}

const handleChangeSelectPaymentType = (val) => {
  validatorPaymentDetailForm.doValidateField('paymentSystemId', val)
  formData.paymentSystemId = val

  const ps = paymentSystems.find(x => x.id === val) || null

  replaceReactiveObject(selectedPaymentSystem, ps)

  console.log('selectedPaymentSystem', selectedPaymentSystem)
}

const getPaymentTypes = async () => {
  const response = await app.paymentSystems.get();
  paymentTypes.splice(0, paymentTypes.length,
      ...response.data.map(({ id, name }) => ({
        id: String(id),
        value: String(id),
        text: String(name),
      }))
  );
  paymentSystems.splice(0, paymentTypes.length,
      ...response.data.map(({ id, name, pdfc }) => ({
        id: String(id),
        name: String(name),
        pdfc: pdfc,
      }))
  );

  console.log('*** *** ***');
  console.log(paymentSystems);
  console.log('*** *** ***');
};

const handleSubmitForm = async () => {
  validatePaymentDetailForm(async () => {
    try {
      isLoading.value = true;
      const response = await app.paymentDetails.post(formData);
      closeModal();
      useEventBus.emit("loadDataForPaymentDetails");
      toast.success(response.data.message);
    } catch (errorResponse) {
      console.log("handleSubmitForm -> errorResponse", errorResponse);
    } finally {
      isLoading.value = false;
    }
  });
};

onMounted(async () => {
  await getPaymentTypes();
});
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
