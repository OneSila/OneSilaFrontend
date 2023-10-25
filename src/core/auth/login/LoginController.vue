<template>
  <LoginTemplate>
    <template v-slot:background-image>
      <BackgroundImage :src="bgGradient" alt="image" />
    </template>

    <template v-slot:foreground-images>
      <BackgroundImage :src="comingSoonObject1" alt="image" classModifier="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
      <BackgroundImage :src="comingSoonObject2" alt="image" classModifier="absolute left-24 top-0 h-40 md:left-[30%]" />
      <BackgroundImage :src="comingSoonObject3" alt="image" classModifier="absolute right-0 top-0 h-[300px]" />
      <BackgroundImage :src="polygonObject" alt="image" classModifier="absolute bottom-0 end-[28%]" />
    </template>

    <template v-slot:left-section>
        <Logo src="/src/assets/images/auth/logo-white.svg" alt="Logo" to="/" />
        <Flex class="mt-24 hidden w-full max-w-[430px] lg:block" center>
          <Image :source="loginImage" alt="Cover Image" class="w-full" />
        </Flex>
    </template>

        <template v-slot:right-section-header>
          <Logo src="/src/assets/images/auth/logo-white.svg" alt="Logo" to="/" class="w-8 block lg:hidden" />
          <LanguageDropdown class="ms-auto w-max"/>
        </template>

    <template v-slot:right-section-content>
        <NewLoginForm />
    </template>
  </LoginTemplate>
</template>

<script lang="ts" setup>

import Logo from "../../../shared/components/molecules/logo/Logo.vue";
import LanguageDropdown from "../../../shared/components/molecules/languages-dropdown/LanguageDropdown.vue";
import NewLoginForm from "./containers/new-login-form/NewLoginForm.vue";
import BackgroundImage from "../../../shared/components/atoms/background-image/BackgroundImage.vue";
import LoginTemplate from "./LoginTemplate.vue";

import bgGradient from '../../../assets/images/auth/bg-gradient.png';
import comingSoonObject1 from '../../../assets/images/auth/coming-soon-object1.png';
import comingSoonObject2 from '../../../assets/images/auth/coming-soon-object2.png';
import comingSoonObject3 from '../../../assets/images/auth/coming-soon-object3.png';
import polygonObject from '../../../assets/images/auth/polygon-object.svg';
import loginImage from '../../../assets/images/auth/login.svg';
import Image from "../../../shared/components/atoms/image/Image.vue";


</script>
