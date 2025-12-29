<template>
  <div class="user-verification__right">
    <div class="user-verification__right__panel user-verification__section">
      <div class="user-profile-card">
        <div class="user-profile-card__header">
          <div>
            <UiTextH5 class="user-profile-card__name">
              {{ props.userData.first_name }}
              {{ props.userData.last_name }}
              {{ props.userData.mid_name }}
            </UiTextH5>
            <div class="user-profile-card__subtitle">
              {{ props.userData.email || "-" }}
            </div>
          </div>
          <div class="user-profile-card__meta">
            <span>Дата рождения: {{ props.userData.birthdate || "-" }}</span>
            <span>Телефон: {{ props.userData.phone || "-" }}</span>
          </div>
        </div>

        <div class="user-profile-card__grid">
          <div class="user-profile-card__item">
            <span class="label">Страна</span>
            <span class="value">{{ props.userData.country || "-" }}</span>
          </div>
          <div class="user-profile-card__item">
            <span class="label">Город</span>
            <span class="value">{{ props.userData.city || "-" }}</span>
          </div>
          <div class="user-profile-card__item">
            <span class="label">Штат</span>
            <span class="value">{{ props.userData.state || "-" }}</span>
          </div>
          <div class="user-profile-card__item">
            <span class="label">Индекс</span>
            <span class="value">{{ props.userData.postal_code || "-" }}</span>
          </div>
          <div class="user-profile-card__item wide">
            <span class="label">Адрес</span>
            <span class="value">{{ props.userData.address || "-" }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="user-verification__left">
    <div class="user-verification__section">
      <div class="user-verification__left__title__wrapper">
        <UiTextH5 class="user-verification__left__title"># {{ t("support.page.status") }}</UiTextH5>
        <div>
          <span
            class="user-documents-uploader__title__options_reload"
            @click="handleRefreshDocuments"
          >
            <UiIconUpdate :class="{ spin: isLoading }"/>
          </span>
        </div>
      </div>

      <div class="user-verification__left__verification-list_wrapper">
        <ul class="user-verification__left__verification-list">

            <li>
              <div class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                <UiIconSuccess v-if="infoStatus === 'approved'" class="user-verification__left__status-icon"/>
                <UiIconWarning v-if="infoStatus === 'pending'" class="user-verification__left__status-icon"/>
                <UiIconFailed v-if="infoStatus === 'rejected'" class="user-verification__left__status-icon"/>
                <div class="user-verification__left__verification-text">
                  <span v-if="infoStatus === 'approved'" class="user-verification__left__verification-title">{{ 'Профиль — Успешно верифицирован!' }}</span>
                  <span v-if="infoStatus === 'pending'" class="user-verification__left__verification-title">{{ 'Профиль — Ожидает верификации!' }}</span>
                  <span v-if="infoStatus === 'rejected'" class="user-verification__left__verification-title">{{ 'Профиль — Отклонено!' }}</span>
                  <span v-if="infoComment" class="user-verification__left__verification-comment">{{ infoComment }}</span>
                </div>
              </div>
              <div class="user-verification__left__verification-cell user-verification__left__verification-cell--actions">
                <VerificationActions
                  :enable-comment="true"
                  :comment="infoComment"
                  :status="infoStatus"
                  :comment-open="isInfoCommentOpen"
                  @update-status="handleVerificationProfile"
                  @toggle-comment="toggleInfoComment"
                />
              </div>
              <transition name="comment-expand">
                <div v-if="isInfoCommentOpen" class="user-verification__left__comment-row">
                  <div class="user-verification__left__comment-editor p-2">
                    <UiFormControl :label="t('admin.verifications.comment.label')">
                      <UiTextarea
                        :value="infoCommentDraft"
                        @input="handleInfoCommentInput"
                        class="user-verification__left__comment-textarea"
                        :placeholder="t('admin.verifications.comment.placeholder')"
                      ></UiTextarea>
                    </UiFormControl>
                    <div class="user-verification__left__comment-actions">
                      <UiButtonDefault
                        state="info--outline--small"
                        class="user-verification__left__comment-btn"
                        @click="submitInfoComment"
                      >
                        {{ t('admin.verifications.comment.save') }}
                      </UiButtonDefault>
                      <UiButtonDefault
                        state="info--outline--small"
                        class="user-verification__left__comment-btn"
                        @click="cancelInfoComment"
                      >
                        {{ t('admin.verifications.comment.close') }}
                      </UiButtonDefault>
                    </div>
                  </div>
                </div>
              </transition>
            </li>

            <li>
              <div class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                <UiIconSuccess v-if="emailStatus === 'approved'" class="user-verification__left__status-icon"/>
                <UiIconWarning v-if="emailStatus === 'pending'" class="user-verification__left__status-icon"/>
                <UiIconFailed v-if="emailStatus === 'rejected'" class="user-verification__left__status-icon"/>
                <div class="user-verification__left__verification-text">
                  <span v-if="emailStatus === 'approved'" class="user-verification__left__verification-title">{{ 'Email — Успешно верифицирован!' }}</span>
                  <span v-if="emailStatus === 'pending'" class="user-verification__left__verification-title">{{ 'Email — Ожидает подтверждения!' }}</span>
                  <span v-if="emailStatus === 'rejected'" class="user-verification__left__verification-title">{{ 'Email — Отклонено!' }}</span>
                  <span v-if="emailComment" class="user-verification__left__verification-comment">{{ emailComment }}</span>
                </div>
              </div>
              <div class="user-verification__left__verification-cell user-verification__left__verification-cell--actions"></div>
            </li>

            <li>
              <div class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                <UiIconSuccess v-if="photoStatus === 'approved'" class="user-verification__left__status-icon"/>
                <UiIconWarning v-if="photoStatus === 'pending'" class="user-verification__left__status-icon"/>
                <UiIconFailed v-if="photoStatus === 'rejected'" class="user-verification__left__status-icon"/>
                <div class="user-verification__left__verification-text">
                  <span v-if="photoStatus === 'approved'" class="user-verification__left__verification-title">{{ 'Фото профиля — Успешно верифицирован!' }}</span>
                  <span v-if="photoStatus === 'pending'" class="user-verification__left__verification-title">{{ 'Фото профиля — Не загружено!' }}</span>
                  <span v-if="photoStatus === 'rejected'" class="user-verification__left__verification-title">{{ 'Фото профиля — Отклонено!' }}</span>
                  <span v-if="photoComment" class="user-verification__left__verification-comment">{{ photoComment }}</span>
                </div>
              </div>
              <div class="user-verification__left__verification-cell user-verification__left__verification-cell--actions"></div>
            </li>

            <li>
              <div class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                <UiIconSuccess v-if="documentsStatus === 'approved'" class="user-verification__left__status-icon"/>
                <UiIconWarning v-if="documentsStatus === 'pending'" class="user-verification__left__status-icon"/>
                <UiIconFailed v-if="documentsStatus === 'rejected'" class="user-verification__left__status-icon"/>
                <div class="user-verification__left__verification-text">
                  <span v-if="documentsStatus === 'approved'" class="user-verification__left__verification-title">{{ 'Документы — Успешно верифицирован!' }}</span>
                  <span v-if="documentsStatus === 'pending'" class="user-verification__left__verification-title">{{ 'Документы — Ожидает верификации!' }}</span>
                  <span v-if="documentsStatus === 'rejected'" class="user-verification__left__verification-title">{{ 'Документы — Отклонено!' }}</span>
                  <span v-if="documentsComment" class="user-verification__left__verification-comment">{{ documentsComment }}</span>
                </div>
              </div>
              <div class="user-verification__left__verification-cell user-verification__left__verification-cell--actions">
                <VerificationActions
                    :enable-comment="true"
                    :comment="documentsComment"
                    :status="documentsStatus"
                    :comment-open="isDocumentsCommentOpen"
                    @update-status="handleVerificationDocuments"
                    @toggle-comment="toggleDocumentsComment"
                />
              </div>
              <transition name="comment-expand">
                <div v-if="isDocumentsCommentOpen" class="user-verification__left__comment-row">
                  <div class="user-verification__left__comment-editor p-2">
                    <UiFormControl :label="t('admin.verifications.comment.label')">
                      <UiTextarea
                        :value="documentsCommentDraft"
                        @input="handleDocumentsCommentInput"
                        class="user-verification__left__comment-textarea"
                        :placeholder="t('admin.verifications.comment.placeholder')"
                      ></UiTextarea>
                    </UiFormControl>
                    <div class="user-verification__left__comment-actions">
                      <UiButtonDefault
                        state="info--outline--small"
                        class="user-verification__left__comment-btn"
                        @click="submitDocumentsComment"
                      >
                        {{ t('admin.verifications.comment.save') }}
                      </UiButtonDefault>
                      <UiButtonDefault
                        state="info--outline--small"
                        class="user-verification__left__comment-btn"
                        @click="cancelDocumentsComment"
                      >
                        {{ t('admin.verifications.comment.close') }}
                      </UiButtonDefault>
                    </div>
                  </div>
                </div>
              </transition>
            </li>
            <li>
              <div class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                <UiIconSuccess v-if="depositStatus === 'approved'" class="user-verification__left__status-icon"/>
                <UiIconWarning v-if="depositStatus === 'pending'" class="user-verification__left__status-icon"/>
                <UiIconFailed v-if="depositStatus === 'rejected'" class="user-verification__left__status-icon"/>
                <div class="user-verification__left__verification-text">
                  <span v-if="depositStatus === 'approved'" class="user-verification__left__verification-title">{{ '1-й Депозит — Успешно верифицирован!' }}</span>
                  <span v-if="depositStatus === 'pending'" class="user-verification__left__verification-title">{{ '1-й Депозит — Ожидает верификации!' }}</span>
                  <span v-if="depositStatus === 'rejected'" class="user-verification__left__verification-title">{{ '1-й Депозит — Отклонено!' }}</span>
                  <span v-if="depositComment" class="user-verification__left__verification-comment">{{ depositComment }}</span>
                </div>
              </div>
              <div class="user-verification__left__verification-cell user-verification__left__verification-cell--actions"></div>
            </li>
          </ul>
        <div class="user-verification__left__verification-list--is-loading" v-if="isLoading">
          <UiIconSpinnerDefault/>
        </div>
      </div>
    </div>
  </div>
  <div class="user-verification__documents user-verification__section">
    <UiTextH5 class="user-verification__documents__title"># Documents verification</UiTextH5>
    <div class="user-verification__documents__content">
      <div v-if="documentsListRequestData.length === 0">No documents...</div>
      <div class="document" v-for="documentRequestData in documentsListRequestData" :key="documentRequestData.id">
        <UiImage
          class="document__image"
          :src="documentRequestData.document_data.full_url"
          @click="handleClientDocumentImage(documentRequestData.document_data.full_url)"
        />
        <div class="document__meta">
          <span class="document__title"># {{ documentRequestData.document_data.number }}</span>
        </div>
        <div class="document__options">
          <VerificationActions
            :status="documentRequestData.state"
            @update-status="handleVerificationDocument($event, documentRequestData.id)"
          />
        </div>
      </div>
    </div>
  </div>
  <div class="user-verification__panel user-verification__section">
    <UiTextH5 class="user-verification__panel__title"># KYC verification history</UiTextH5>
    <div class="user-verification__panel__verification-history">
      <div class="user-verification__panel__verification-history_log">
        <span class="approved">Sent verification mail.</span>
        <span class="user-verification__panel__verification-history_log_time">2025-06-10 00:04</span>
      </div>
      <div class="user-verification__panel__verification-history_log">
        <span class="pending">You requested profile photo verification.</span>
        <span class="user-verification__panel__verification-history_log_time">2025-06-10 00:11</span>
      </div>
      <div class="user-verification__panel__verification-history_log">
        <span class="approved">Your profile photo was automatic approved.</span>
        <span class="user-verification__panel__verification-history_log_time">2025-06-10 00:15</span>
      </div>
      <div class="user-verification__panel__verification-history_log">
        <span class="pending">Requested user data verification.</span>
        <span class="user-verification__panel__verification-history_log_time">2025-06-10 00:45</span>
      </div>
      <div class="user-verification__panel__verification-history_log">
        <span class="approved">Your user data was approved.</span>
        <span class="user-verification__panel__verification-history_log_time">2025-06-10 02:41</span>
      </div>
      <div class="user-verification__panel__verification-history_log">
        <span class="rejected">Your user data was rejected.</span>
        <span class="user-verification__panel__verification-history_log_time">2025-06-10 02:43</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useAppCore from "~/composables/useAppCore";
import {onMounted, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "vue-toastification";

import UiIconFailed from "~/components/ui/UiIconFailed.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextarea from "~/components/ui/UiTextarea.vue";
import VerificationActions from "~/pages/admin/clients/[id]/components/VerificationActions.vue";
import UiImage from "~/components/ui/UiImage.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";

interface VerificationSection {
  verification_status: string,
  comment: string
}

interface VerificationRequestDto {
  info: VerificationSection
  photo: VerificationSection
  email: VerificationSection
  address: VerificationSection
  documents: VerificationSection
  deposit: VerificationSection
}

const initialData: VerificationRequestDto = {
  info: {verification_status: "pending", comment: ""},
  email: {verification_status: "pending", comment: ""},
  photo: {verification_status: "pending", comment: ""},
  address: {verification_status: "pending", comment: ""},
  documents: {verification_status: "pending", comment: ""},
  deposit: {verification_status: "pending", comment: ""},
}

const props = defineProps({
  userData: {
    type: Object,
    default: {}
  },
  clientId: {
    type: String,
    required: false
  },
});

const appCore = useAppCore();
const isLoading = ref(false);
const toast = useToast();
let verificationRequestData = reactive<VerificationRequestDto>(initialData)
let documentsListRequestData = reactive([])
const {t} = useI18n({useScope: "global"});

const infoStatus = ref("pending");
const infoComment = ref("");
const emailStatus = ref("pending");
const emailComment = ref("");
const photoStatus = ref("pending");
const photoComment = ref("");
const addressStatus = ref("pending");
const addressComment = ref("");
const depositStatus = ref("pending");
const depositComment = ref("");
const documentsStatus = ref("pending");
const documentsComment = ref("");
const isInfoCommentOpen = ref(false);
const infoCommentDraft = ref("");
const isDocumentsCommentOpen = ref(false);
const documentsCommentDraft = ref("");

const loadVerificationData = async () => {
  isLoading.value = true;

  const response = await appCore.adminModules.verificationRequests.get(props.clientId);
  const verificationRequestDto = response.data.data.length > 0 ? response.data.data[0] : {};

  Object.assign(verificationRequestData, verificationRequestDto.data);

  if (verificationRequestData) {
    infoStatus.value = verificationRequestData?.info?.verification_status
    infoComment.value = verificationRequestData?.info?.comment
    emailStatus.value = verificationRequestData?.email?.verification_status
    emailComment.value = verificationRequestData?.email?.comment
    photoStatus.value = verificationRequestData?.photo?.verification_status
    photoComment.value = verificationRequestData?.photo?.comment
    addressStatus.value = verificationRequestData?.address?.verification_status
    addressComment.value = verificationRequestData?.address?.comment
    depositStatus.value = verificationRequestData?.deposit?.verification_status
    depositComment.value = verificationRequestData?.deposit?.comment
    documentsStatus.value = verificationRequestData?.documents?.verification_status
    documentsComment.value = verificationRequestData?.documents?.comment
  }
  const responseDocumentsRequest = await appCore.adminModules.documents.get({clientId: props.clientId})
  documentsListRequestData.splice(0, documentsListRequestData.length, ...responseDocumentsRequest.data.data);

  isLoading.value = false;
}

const handleRefreshDocuments = async () => {
  await loadVerificationData();
}

const toggleInfoComment = () => {
  isInfoCommentOpen.value = !isInfoCommentOpen.value;
  if (isInfoCommentOpen.value) {
    infoCommentDraft.value = infoComment.value || '';
  }
}

const handleInfoCommentInput = (e: any) => {
  infoCommentDraft.value = e.target.value;
}

const submitInfoComment = async () => {
  isInfoCommentOpen.value = false;
  await handleVerificationProfile({status: infoStatus.value, comment: infoCommentDraft.value || ''});
}

const cancelInfoComment = () => {
  isInfoCommentOpen.value = false;
  infoCommentDraft.value = infoComment.value || '';
}

const toggleDocumentsComment = () => {
  isDocumentsCommentOpen.value = !isDocumentsCommentOpen.value;
  if (isDocumentsCommentOpen.value) {
    documentsCommentDraft.value = documentsComment.value || '';
  }
}

const handleDocumentsCommentInput = (e: any) => {
  documentsCommentDraft.value = e.target.value;
}

const submitDocumentsComment = async () => {
  isDocumentsCommentOpen.value = false;
  await handleVerificationDocuments({status: documentsStatus.value, comment: documentsCommentDraft.value || ''});
}

const cancelDocumentsComment = () => {
  isDocumentsCommentOpen.value = false;
  documentsCommentDraft.value = documentsComment.value || '';
}

const handleVerificationAddress = async (value: any) => {
  isLoading.value = true;
  await appCore.adminModules.verificationRequests.put(props.clientId, {
    type: 'address',
    updatedStatus: {status : value.status, comment: value.comment}
  })
  toast.success('Address status updated!')
  await loadVerificationData();
}

const handleVerificationDocuments = async (value: any) => {
  isLoading.value = true;
  await appCore.adminModules.verificationRequests.put(props.clientId, {
    type: 'documents',
    updatedStatus: {status : value.status, comment: value.comment}
  })
  toast.success('Address status updated!')
  await loadVerificationData();
}

const handleVerificationDocument = async (value: any, docId: string = '') => {
  isLoading.value = true;
  await appCore.adminModules.verificationRequests.put(props.clientId, {
    docId: docId,
    type: 'document',
    updatedStatus: {status : value.status, comment: value.comment}
  })
  toast.success('Document status updated!')
  await loadVerificationData();
}

const handleVerificationProfile = async (value: any) => {
  isLoading.value = true;
  await appCore.adminModules.verificationRequests.put(props.clientId, {
    documentId: '',
    type: 'info',
    updatedStatus: {status : value.status, comment: value.comment}
  })
  toast.success('Address status updated!')
  await loadVerificationData();
}

const handleClientDocumentImage = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer');
}

watch(infoComment, (nextValue) => {
  if (!isInfoCommentOpen.value) {
    infoCommentDraft.value = nextValue || '';
  }
});

watch(documentsComment, (nextValue) => {
  if (!isDocumentsCommentOpen.value) {
    documentsCommentDraft.value = nextValue || '';
  }
});

onMounted(async () => {
  await loadVerificationData();
})
</script>

<style lang="scss" scoped>
.spacer {
  width: 90px;
  height: 20px;
  margin: 0;
}

.approved {
  color: var(--color-success)
}

.pending {
  color: var(--color-warning)
}

.rejected {
  color: var(--color-danger)
}

.user {
  &-verification {
    &__left {
      width: 100%;

      &__title {
        margin-bottom: 40px;

        &__wrapper {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
      }

      &__verification-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 8px;

        &_wrapper {
          position: relative;
        }

        &--is-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--ui-background);
          opacity: 0.6;
          border-radius: 12px;
          backdrop-filter: blur(6px);
          z-index: 10;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        li {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: flex-start;
          gap: 12px;
          padding: 8px;
          min-height: 36px;
          background: var(--ui-background-panel);
          border-radius: 10px;
        }
      }

      &__verification-cell {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        width: 100%;

        &--status {
          justify-content: flex-start;
          align-items: flex-start;
        }

        &--actions {
          justify-content: flex-end;
        }
      }

      &__status-icon {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
      }

      &__verification-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        width: 100%;
      }

      &__verification-title {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &__verification-comment {
        color: var(--ui-text-secondary);
        font-size: 12px;
        line-height: 1.4;
        white-space: normal;
      }

      &__comment-row {
        grid-column: 1 / -1;
        overflow: hidden;
        padding-left: 0;
      }

      &__comment-editor {
        background: var(--ui-background);
        border: none;
        border-radius: 12px;
        padding: 10px;
        margin-top: 6px;
        width: 100%;
      }

      &__comment-textarea {
        width: 100%;
        min-height: 60px;
        border: 1px solid var(--color-stroke-ui-dark);
        border-radius: 12px;
        padding: 10px 12px;
        background: var(--ui-background-panel);
        resize: vertical;
      }

      &__comment-actions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        margin-top: 8px;
      }

      &__comment-btn {
        width: auto;
      }
    }

    &__right {
      width: 100%;

      &__title {
        margin-bottom: 20px;
      }

      &__panel {
        &__title {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      }
    }
  }

  &-photo {
    &-uploader {
      color: var(--ui-text-main);
    }

    &__right__panel {
      color: var(--ui-text-main);
    }
  }
}

.user-verification__section {
  padding: 20px;
}

.user-profile-card {
  background: var(--ui-background-panel);
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.user-profile-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.user-profile-card__name {
  color: var(--ui-text-main);
}

.user-profile-card__subtitle {
  color: var(--ui-text-secondary);
  font-size: 13px;
  margin-top: 4px;
}

.user-profile-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
  color: var(--ui-text-secondary);
  font-size: 12px;
}

.user-profile-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.user-profile-card__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-profile-card__item .label {
  color: var(--ui-text-secondary);
  font-size: 12px;
}

.user-profile-card__item .value {
  color: var(--ui-text-main);
  font-size: 14px;
  word-break: break-word;
}

.user-profile-card__item.wide {
  grid-column: 1 / -1;
}

.user-verification__right__info-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  li {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 8px;
    padding: 0;
  }
}

.user-verification__right__info-group {
  background: var(--ui-background-panel);
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 12px;
  padding: 8px;
}

.user-verification__right__status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--color-stroke-ui-light);
  background: var(--ui-background-panel);
  margin-bottom: 16px;
}

.user-verification__right__status-row-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.user-verification__right__info-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  width: 100%;
  white-space: nowrap;

  &--value {
    justify-content: flex-end;

    span {
      display: block;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &--actions {
    display: none;
  }
}

.user-verification__documents {
  &__title {
    margin-bottom: 20px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .document {
      min-height: 120px;
      height: auto;
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 16px;
      background: var(--ui-background-panel);
      border: 1px solid var(--color-stroke-ui-light);
      border-radius: 12px;
      padding: 12px 14px;
      user-select: none;
      position: relative;

      &__options {
        z-index: 1;
        background-color: transparent;
        position: static;
        border-radius: 0;
        height: auto;
        width: auto;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
        margin-left: auto;
      }

      &__image {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 10px;
        flex-shrink: 0;
      }

      &__meta {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        min-width: 0;
      }

      &__title {
        color: var(--ui-text-main);
        font-weight: 600;
      }

      &:hover {
        background-color: var(--color-stroke-ui-dark);
      }

      &:active {
        opacity: .5;
      }
    }

    @media (max-width: 768px) {
      .document {
        flex-direction: column;
      }

      .document__options {
        width: 100%;
        align-items: flex-start;
        margin-left: 0;
      }

      .document__image {
        width: 100%;
        height: auto;
      }
    }
  }
}

.user-verification__panel {
  height: 100%;
  width: 100%;

  &__title {
    margin-bottom: 20px;
  }

  &__verification-history {

    padding-top: 10px;
    padding-bottom: 10px;

    &_log {
      padding: 10px;
      border-bottom: 1px solid var(--color-stroke-ui-dark);
      margin-bottom: 1px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      &_time {
        font-size: 12px;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

  }
}

.user-verification__left,
.user-verification__right,
.user-verification__documents,
.user-verification__panel {
  margin-top: 16px;
  color: var(--ui-text-main);
}

.user-verification__left {
  margin-top: 0;
}

.comment-expand-enter-active,
.comment-expand-leave-active {
  transition: max-height 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
}
.comment-expand-enter-from,
.comment-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(6px);
}
.comment-expand-enter-to,
.comment-expand-leave-from {
  max-height: 400px;
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .user-profile-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-profile-card__meta {
    text-align: left;
  }

  .user-profile-card__grid {
    grid-template-columns: 1fr;
  }
  .user-verification__left__verification-list li {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 8px;
  }

  .user-verification__left__verification-cell--actions {
    width: 100%;
    justify-content: flex-start;
  }

  .user-verification__right__info-list {
    grid-template-columns: 1fr;
  }

  .user-verification__right__info-list li {
    gap: 6px;
  }

  .user-verification__right__info-cell--actions {
    width: 100%;
    justify-content: flex-start;
  }

  .user-verification__right .personal-info__item {
    flex-direction: column;
    align-items: flex-start;
    height: auto;
    gap: 4px;
  }

  .user-verification__documents__content .document {
    min-width: 0;
  }

  .user-verification__panel__verification-history_log {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
