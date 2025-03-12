<template>
  <section class="trading-platform">
    <div class="trading-platform_overlay">
      <div class="blur-circle"></div>
      <div class="platform-title">
        <UiTextTrading
          title="Trading Platform"
          subTitle="Level up with our products"
        />
      </div>

      <div class="devices">
        <div class="device device-laptop">
          <img src="/static/Macbook.png" alt="Laptop Trading" />

          <UiTextTrading
            class="device device-laptop_position"
            title="Ester MetaTrader 4"
            subTitle="The popular, classic solution"
            hasBorder
          />
        </div>

        <div class="device device-main">
          <img src="/static/iMac.png" alt="Trading Platform" />

          <UiTextTrading
            class="device device-main_position"
            title="Ester MetaTrader 4"
            subTitle="The popular, classic solution"
            hasBorder
          />
        </div>

        <div class="device device-phone">
          <img src="/static/iPhone.png" alt="Mobile Trading" />
        </div>

        <div class="device device-ipad">
          <img src="/static/iPad.png" alt="Mobile Trading" />

          <UiTextTrading
            class="device device-ipad_position"
            title="Ester MetaTrader 4"
            subTitle="The popular, classic solution"
          />
        </div>
      </div>

      <div class="background-glow"></div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiTextTrading from "~/components/ui/UiTextTrading.vue";
</script>

<style lang="scss" scoped>
.trading-platform {
  position: relative;
  text-align: center;
  padding: 100px 20px;
  height: 635px;
  background-image: url("/static/trading-platform-bg.webp");
  background-position: left;
  background-repeat: no-repeat;

  color: white;
  overflow: hidden;

  z-index: 1;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 40, 1) 0%,
      rgba(0, 0, 40, 0.95) 20%,
      rgba(0, 0, 40, 0.8) 50%,
      rgba(0, 0, 40, 0.95) 80%,
      rgba(0, 0, 40, 1) 100%
    );

    z-index: 1;
  }

  &_overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 30, -0.6);
    backdrop-filter: blur(15px);
    z-index: 2;
  }

  &-title {
    display: flex;
    align-items: flex-start;
  }
}

.devices {
  position: relative;
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  flex-shrink: 0;

  .device-main {
    &_position {
      position: absolute;
      left: 68%;
      top: 20%;
      z-index: 1;
    }
  }

  .device-laptop {
    position: absolute;
    right: 50%;
    top: 50%;

    &_position {
      position: absolute;
      top: 30%;
      right: 50%;
      z-index: 1;
    }
  }

  .device-ipad {
    position: absolute;
    top: 50%;
    left: 64%;
    z-index: 1;

    &_position {
      position: absolute;
      top: 100%;
      right: 50%;
      z-index: 1;
    }
  }

  .device-phone {
    position: absolute;
    top: 65%;
    left: 83%;
    z-index: 10;
  }
}

.platform-title {
  display: flex;
  justify-content: center;
  margin-right: 700px;
}

.blur-circle {
  position: absolute;
  width: 446px;
  height: 446px;
  background: rgb(247, 87, 9);
  filter: blur(200px);
  overflow: hidden;
  border-radius: 100%;
  left: 100%;
  top: 0;
  z-index: 100000;
  animation: pulse 5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
}

@media (max-width: 1199px) {
  .devices {
    max-width: 991px;
  }

  .device-main {
    &_position {
      left: 65% !important;
    }
    img {
      width: 75%;
    }
  }

  .device-laptop {
    img {
      width: 75%;
    }
  }

  .device-ipad {
    left: 55% !important;

    img {
      width: 75%;
    }
  }

  .device-phone {
    left: 74% !important;
    img {
      width: 75%;
    }
  }
}

@media (max-width: 991px) {
  .devices {
    max-width: 767px;
  }

  .platform-title {
    margin-right: 500px;
  }

  .device-laptop {
    right: 40% !important;
  }
}

@media (max-width: 767px) {
  .devices {
    max-width: 565px;
  }

  .blur-circle {
    display: none;
  }

  .platform-title {
    margin: 0;
    margin-bottom: 50px;
    text-align: center;
  }

  .device-main {
    &_position {
      display: none;
    }
    img {
      width: 100%;
    }
  }

  .device-laptop {
    display: none;
  }

  .device-ipad {
    img {
      width: 100%;
    }
  }

  .device-phone {
    img {
      width: 100%;
    }
  }
}
</style>
