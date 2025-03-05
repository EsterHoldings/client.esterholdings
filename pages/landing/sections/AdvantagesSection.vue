<template>
  <section class="advantages_section">
    <div class="advantages_container">
      <div class="advantage_item">
        <h2>10+</h2>
        <p>Years of experience in field</p>
      </div>
      <div class="divider"></div>
      <div class="advantage_item">
        <h2>1 160 000+</h2>
        <p>Clients</p>
      </div>
      <div class="divider"></div>
      <div class="advantage_item">
        <h2>5* Rated</h2>
        <p>Customer service</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.advantages_section {
  margin-top: 150px;
  margin-bottom: 150px;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.advantages_container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1000px;
  width: 100%;
}

.advantage_item {
  text-align: center;
  color: white;
  flex: 1;
}

.advantage_item h2 {
  font-size: 28px;
  font-weight: bold;
}

.advantage_item p {
  font-size: 14px;
  opacity: 0.8;
}

.divider {
  width: 1px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.3);
}
</style>