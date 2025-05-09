<template>
  <div class="user-photo__wrapper">
    <div class="user-photo__left">
      <PanelDefault class="user-photo-uploader">
        <div class="uploader-body">
          <div v-if="previewUrl" class="avatar-preview">
            <img :src="previewUrl" alt="Preview" />
            <div
              v-if="previewUrl && !loading"
              class="btn-delete"
              @click="remove"
            ></div>
          </div>
          <div v-else class="avatar-placeholder">
            <span class="icon">👤</span>
          </div>
          <div class="actions">
            <input
              id="fileSelectionBtn"
              type="file"
              accept="image/*"
              @change="onFileChange"
              hidden
            />
            <div class="btn-select" @click="clickSelectionFile">
              {{
                t(
                  "cabinet.profile.components.tab-user-documents.buttons.choose"
                )
              }}
            </div>
            <UiButtonDefault
              class="btn-upload"
              state="info--outline"
              :disabled="!file || loading || !!error"
              @click="upload"
            >
              {{
                loading
                  ? uploadProgress + "%"
                  : t(
                      "cabinet.profile.components.tab-user-documents.buttons.upload"
                    )
              }}
            </UiButtonDefault>
          </div>
          <div v-if="loading" class="progress-bar">
            <div class="progress" :style="{ width: uploadProgress + '%' }" />
          </div>
          <p v-if="error" class="error">{{ error }}</p>
        </div>
      </PanelDefault>
    </div>
    <div class="user-photo__right">
      <PanelDefault class="user-photo__right__panel">
        <div>Тут будет список уже загруженых документов</div>
        <div>Тут будет список уже загруженых документов</div>
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import axios from "axios";
import { ref, onMounted } from "vue";
import { useToast } from "vue-toastification";

import useApi from "~/composables/useApi";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

import useAppCore from "~/composables/useAppCore";

const { t } = useI18n();
const toast = useToast();
const appCore = useAppCore();
const api = new useApi(true);
const MAX_SIZE = 2 * 1024 * 1024;

const file = ref<File | null>(null);
const previewUrl = ref<string>("");
const uploadProgress = ref(0);
const loading = ref(false);
const error = ref("");

onMounted(async () => {
  const { data } = await appCore.auth.getAuthUser();
  previewUrl.value = data.photo_url || "";
});

function clickSelectionFile() {
  document.getElementById("fileSelectionBtn")?.click();
}

function onFileChange(e: Event) {
  error.value = "";
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  if (!f.type.startsWith("image/")) {
    error.value = t(
      "cabinet.profile.components.tab-user-documents.errors.type"
    );
    return;
  }
  if (f.size > MAX_SIZE) {
    error.value = t(
      "cabinet.profile.components.tab-user-documents.errors.size"
    );
    return;
  }
  file.value = f;
  previewUrl.value = URL.createObjectURL(f);
  uploadProgress.value = 0;
}

async function upload() {
  if (!file.value) return;
  loading.value = true;
  error.value = "";

  try {
    const { data } = await api.post("client/s3/presign", {
      filename: file.value.name,
      contentType: file.value.type,
    });

    await axios.put(data.url, file.value, {
      headers: { "Content-Type": file.value.type },
      onUploadProgress: (e) => {
        uploadProgress.value = Math.round((e.loaded * 100) / (e.total || 1));
      },
    });

    const res = await api.post("client/user/photo", { key: data.key });
    previewUrl.value = res.data.photo_url;
    file.value = null;

    toast.success(
      t("cabinet.profile.components.tab-user-documents.messages.upload_success")
    );
  } catch {
    error.value = t(
      "cabinet.profile.components.tab-user-documents.messages.upload_error"
    );
  } finally {
    loading.value = false;
  }
}

async function remove() {
  loading.value = true;
  error.value = "";
  try {
    await api.delete("client/user/photo");
    previewUrl.value = "";
    file.value = null;
  } catch {
    error.value = t(
      "cabinet.profile.components.tab-user-documents.messages.delete_error"
    );
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.user-photo {
  &__wrapper {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }
  &__left {
    width: 50%;
  }
  &__right {
    width: 50%;

    &__panel {
      padding: 20px;
      height: 100%;
      width: 100%;
    }
  }
}

.btn-delete {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  color: #fff;
  height: 30px;
  width: 30px;
  position: absolute;
  right: -10px;
  top: -10px;
  z-index: 3;
  border: 1px solid var(--color-stroke-ui-dark);

  &:hover {
    background: #ef4444;
  }

  &::before {
    content: "×";
    display: flex;
    justify-content: center;
    font-size: 18px;
    height: 30px;
    align-items: center;
    margin-top: -2px;
    width: 30px;
    text-align: center;
    color: #fff;
    border-radius: 50%;
    transform: translate(-0.06rem, -0.06rem);
  }
}

.user-photo-uploader {
  margin: 0 auto;
  text-align: center;
  padding: 20px;

  .title {
    margin-bottom: 20px;
  }

  .uploader-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }

  .avatar-preview,
  .avatar-placeholder {
    position: relative;
    width: 300px;
    height: 300px;
    border-radius: 10px;
    background: var(--color-ui-background);
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      border-radius: 10px;
    }
  }

  .avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .icon {
    font-size: 2.5rem;
    color: #9ca3af;
  }

  .actions {
    gap: 20px;
    display: flex;
    flex-direction: column;

    .btn-select {
      cursor: pointer;
    }

    .btn-upload {
      cursor: pointer;
    }
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: var(--color-ui-primary-defalt);
    border-radius: 3px;
    overflow: hidden;

    .progress {
      height: 100%;
      background: #3b82f6;
      transition: width 0.2s;
    }
  }

  .error {
    color: #dc2626;
    margin-top: 8px;
  }
}
</style>
