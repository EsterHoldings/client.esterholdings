<template>
  <footer class="footer-v2">
    <UiContainer>
      <div class="line"></div>
      <div class="top">
        <div class="brand">
          <UiIconLogo :class="{ 'svg-invert': themeStore.currentTheme !== 'dark' }" />
          <p>{{ t("landing.footer.description") }}</p>
          <div class="social">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook">
              <UiIconFacebook />
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn">
              <UiIconLinkedIn />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram">
              <UiIconInstagram />
            </a>
          </div>
        </div>
        <div class="nav-links">
          <div class="nav-links__item nav-links__item--trading">
            <FooterLink basePath="landing.footer.trading" />
          </div>
          <div class="nav-links__item nav-links__item--partnership">
            <FooterLink basePath="landing.footer.partnership" />
          </div>
          <div class="nav-links__item nav-links__item--company">
            <FooterLink basePath="landing.footer.company" />
          </div>
        </div>
      </div>

      <div class="contacts">
        <div>
          <p>
            <strong>{{ t("landing.footer.legal.company_name") }}</strong>
          </p>
          <p>{{ t("landing.footer.legal.company_address") }}</p>
        </div>
        <div>
          <p>
            <strong>{{ t("landing.footer.legal.support_service_label") }}</strong>
          </p>
          <p>{{ t("landing.footer.legal.support_service_email") }}</p>
        </div>
        <div>
          <p>
            <strong>{{ t("landing.footer.legal.finance_service_label") }}</strong>
          </p>
          <p>{{ t("landing.footer.legal.finance_service_email") }}</p>
        </div>
        <div>
          <p>
            <strong>{{ t("landing.footer.legal.marketing_service_label") }}</strong>
          </p>
          <p>{{ t("landing.footer.legal.marketing_service_email") }}</p>
        </div>
      </div>
    </UiContainer>
  </footer>
</template>

<script setup lang="ts">
  import { useI18n } from "vue-i18n";
  import { useThemeStore } from "~/stores/themeStore";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiIconFacebook from "~/components/ui/UiIconFacebook.vue";
  import UiIconLinkedIn from "~/components/ui/UiIconLinkedIn.vue";
  import UiIconInstagram from "~/components/ui/UiIconInstagram.vue";
  import FooterLink from "~/components/block/LandingFooter/components/FooterLink.vue";

  const { t } = useI18n();
  const themeStore = useThemeStore();
</script>

<style lang="scss" scoped>
  .footer-v2 {
    padding: 0 0 20px;

    .top {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 40px;
      padding: 60px 0 40px;
    }

    .nav-links {
      display: flex;
      gap: 106px;
      align-items: start;
    }

    .brand p {
      margin: 20px 0 0;
      color: #7b7b7b;
      max-width: 325px;
      font-size: 14px;
      line-height: 1.302;
      font-weight: 500;
    }

    .social {
      display: flex;
      gap: 20px;
      align-items: center;
      margin-top: 20px;

      a {
        display: flex;
        align-items: center;
        width: 22px;
        height: 22px;
        color: #7b7b7b;
        transition: color 0.2s;

        &:hover {
          color: #000;
        }

        svg {
          width: 22px;
          height: 22px;
        }
      }
    }

    .line {
      margin: 40px 0 0;
      height: 1px;
      background: #a1a1a1;
    }

    .contacts {
      margin-top: 0;
      display: grid;
      grid-template-columns: 487px auto auto auto;
      gap: 20px;
      background: #fff;
      border-radius: 20px;
      min-height: 101px;
      padding: 20px;

      p {
        margin: 0;
        color: #7b7b7b;
        font-size: 14px;
        line-height: 1.302;
      }

      p + p {
        margin-top: 10px;
      }

      strong {
        color: #000;
        font-weight: 500;
      }
    }
  }

  .svg-invert {
    filter: invert(1);
  }

  @media (max-width: 991px) {
    .footer-v2 {
      .top {
        flex-direction: column;
        gap: 24px;
      }

      .nav-links {
        gap: 40px;
        flex-wrap: wrap;
      }

      .contacts {
        grid-template-columns: 1fr 1fr;
      }
    }
  }

  @media (max-width: 767px) {
    .footer-v2 {
      .nav-links {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-areas:
          "trading company"
          "partnership .";
        gap: 30px 20px;
      }

      .nav-links__item--trading {
        grid-area: trading;
      }

      .nav-links__item--partnership {
        grid-area: partnership;
      }

      .nav-links__item--company {
        grid-area: company;
      }

      .nav-links :deep(.footer-list) {
        width: 100%;
        align-items: flex-start;
      }

      .nav-links :deep(.footer-list h5) {
        font-weight: 700;
      }
    }
  }

  @media (max-width: 575px) {
    .footer-v2 {
      .contacts {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
