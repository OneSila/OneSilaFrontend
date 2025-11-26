<script lang="ts" setup>
import LanguageDropdown from "../../../shared/components/molecules/languages-dropdown/LanguageDropdown.vue";
import NewLoginForm from "./containers/new-login-form/NewLoginForm.vue";
import logoWhite from '../../../assets/images/auth/logo_white.png';
import AuthTemplate from "../AuthTemplate.vue";
</script>

<template>
  <AuthTemplate>
    <template #left-section>
      <div class="flex w-full items-center justify-center">
        <img :src="logoWhite" alt="OneSila brand mark" class="max-h-[420px] w-auto object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.4)]" />
      </div>
    </template>

    <template #right-section-header>
      <LanguageDropdown :show="true" class="w-max" />
    </template>

    <template #right-section-content>
      <NewLoginForm />
    </template>
  </AuthTemplate>
</template>
