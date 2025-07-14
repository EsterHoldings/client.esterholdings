<template>
  <UiContainer>
    <div class="mt4">
      <UiTextH3 class="mt4_title">МТ4</UiTextH3>
      <div class="mt4_img">
        <UiTextH4 class="mt4_subtitle"
          >Download trading terminal and start earning</UiTextH4
        >
        <div>
          <UiButtonDefault state="warning">DOWNLOAD MT-4</UiButtonDefault>
        </div>
      </div>

      <UiTextH4 class="mt4_title-platform">About platform</UiTextH4>

      <UiTextParagraph class="mt4_text">
        MetaTrader 4 – the most popular trading platform in the world. Thanks to
        many years’ experience of work with this platform and active
        participation in its development, we provide you with the most
        profitable and comfortable conditions.
        <strong>Because MetaTrader 4 is:</strong>
      </UiTextParagraph>

      <ul class="mt4_list">
        <li>
          <UiIconSuccess />
          <span>
            easy and understandable interface with a variety of tools of technical
            analysis;
          </span>
        </li>
        <li>
          <UiIconSuccess />
          <span>
            opportunity to trade from smart phones, Ipads and PDAs;
          </span>
        </li>
        <li>
          <UiIconSuccess />
          <span>
            built-in programming language MQL4, allowing to create own trade
            advisors and indicators;
          </span>
        </li>

        <li>
          <UiIconSuccess />
          <span>
            access to intebank liquidity with the help of the technology МТ4
            Bridge, execution without re-quotes (No Dealing Desk);
          </span>
        </li>
        <li>
          <UiIconSuccess />
          <span>
            financial news from Dow Jones
          </span>
        </li>
      </ul>

      <div class="mt4_footer">
        <UiTextParagraph class="mt4_text">SYSTEM REQUIREMENTS:</UiTextParagraph>
        <UiTextParagraph class="mt4_text"
          >Windows XP and higher.</UiTextParagraph
        >
        <a href="#">Instructions for Mac OS</a>
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { reactive, ref, computed } from "vue";
import { definePageMeta } from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";

definePageMeta({
  layout: "main",
  alias: "/mt-4",
});
</script>

<style lang="scss">
.mt4 {
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &_img {
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 50px;
    background: linear-gradient(rgba(21, 21, 21, 0.6), rgba(21, 21, 21, 0.6)),
      url("/static/mt4Bg.jpeg") center / cover no-repeat;
    border-radius: 15px;
    min-height: 200px;
    justify-content: end;
  }

  &_title {
    text-align: center;
    color: var(--ui-text-main);

    &-platform {
      color: var(--ui-text-main);
    }
  }

  &_subtitle {
    color: var(--ui-text-main);
  }

  &_text {
    color: var(--ui-text-main);
  }

  &_list {
    color: var(--ui-text-main);
    list-style: none;

    li {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 20px;
    }
  }

  &_footer {
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: var(--ui-text-main);
    margin-bottom: 50px;

    a {
      color: var(--ui-text-link);
      text-decoration: underline;
      cursor: pointer;

      &:hover {
        color: var(--ui-text-link-hover);
      }
    }
  }
}
</style>
