<script setup>
import { ref, onMounted } from "vue";
import QRCode from "qrcode";

const props = defineProps({
  link: {
    type: String,
    required: true,
  },
});

const qrUrl = ref("");

onMounted(async () => {
  try {
    qrUrl.value = await QRCode.toDataURL(props.link);
  } catch (err) {
    console.error("QR Code generation failed:", err);
  }
});
</script>

<template>
  <div>
    <img v-if="qrUrl" :src="qrUrl" alt="QR Code" />
    <p v-else>Генерация QR-кода...</p>
  </div>
</template>
