<template>
  <section class="account-types__wrapper">
    <UiTextH3 class="account-types__title">Explore Our Trading Account Options</UiTextH3>
    <div class="account-types">
      <div class="account-container">
        <div
            v-for="(account, index) in accounts"
            :key="index"
            class="account-card"
            :class="{ active: activeIndex === index }"
            @click="setActive(index)"
        >
          <div class="account-content">
            <h2 v-if="activeIndex === index" class="account-title">
              {{ account.name }}
            </h2>
            <p v-if="activeIndex === index" class="account-description">
              {{ account.description }}
            </p>
            <button v-if="activeIndex === index" class="account-button">
              Open Account
            </button>

            <div v-else class="account-mini">
              <span>{{ account.name }}</span>
              <span class="arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

const accounts = ref([
  {
    name: "Standard",
    description:
        "A great account for all types of traders, with floating FX Spreads from 1.2 pips via MT4/MT5 and micro lot trading available.",
  },
  { name: "Pro", description: "Professional-level spreads with lower costs." },
  { name: "Islamic", description: "Swap-free trading for Islamic traders." },
  { name: "Demo", description: "Test trading strategies risk-free." },
]);

const activeIndex = ref(0);

const setActive = (index: number) => {
  activeIndex.value = index;
};
</script>

<style lang="scss" scoped>
.account-types {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  margin-bottom: 250px;

  &__title {
    color: white;
    text-align: center;
    margin-bottom: 70px;
  }
}

.account-container {
  display: flex;
  gap: 20px;
  max-width: 1100px;
  width: 100%;
}

.account-card {
  flex: 1;
  height: 385px;
  //background-color: #081850;
  border-radius: 15px;
  border: 1px solid #2a4af5;
  cursor: pointer;
  transition: flex 0.3s ease-in-out, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.account-card.active {
  flex: 2;
  background-color: #081850;
  transform: scale(1.05);
}

.account-content {
  width: 80%;
  color: white;
}

.account-title {
  font-size: 22px;
  font-weight: bold;
}

.account-description {
  font-size: 14px;
  margin-top: 10px;
  opacity: 0.8;
}

.account-button {
  margin-top: 15px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background-color: #2a4af5;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.1s;
}

.account-button:hover {
  background-color: #1b36e0;
}

.account-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.arrow {
  font-size: 20px;
  color: #2a4af5;
  margin-top: 5px;
}
</style>