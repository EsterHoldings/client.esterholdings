<template>
  <UiImage :src="images[0].src" :id="images[0].id" />
</template>

<script lang="ts" setup>
const props = defineProps({
  images: {
    type: Array as PropType<any[]>,
    default: [
      {
        id: "10da97ee-9b49-44c2-8097-f7bb63dd3991",
        alt: "Image 1",
        src: "https://cdn.pixabay.com/photo/2023/05/31/14/20/mountains-8031511_1280.jpg",
      },
      {
        id: "905bec78-fcc5-45d7-9de9-08c2f1cead4a",
        alt: "Image 2",
        src: "https://cdn.pixabay.com/photo/2023/05/30/15/36/pigeon-8028951_1280.jpg",
      },
      {
        id: "c244e49e-ef40-4b93-8604-eca0d9615e5b",
        alt: "Image 3",
        src: "https://cdn.pixabay.com/photo/2023/06/07/04/23/road-8046167_1280.jpg",
      },
    ],
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables";

.carousel-indicator {
  position: relative;

  &s {
    position: absolute;
    display: flex;
  }

  .dots {
    width: 10px;
    height: 10px;
    border: none;
    border-radius: 50%;
    background: $light;
  }
}
</style>
