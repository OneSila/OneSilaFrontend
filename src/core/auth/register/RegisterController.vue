<script lang="ts" setup>
import LanguageDropdown from "../../../shared/components/molecules/languages-dropdown/LanguageDropdown.vue";
import { RegisterForm } from "./containers/register-form";
import { RegisterCompanyForm } from "./containers/register-company-form";
import AuthTemplate from "../AuthTemplate.vue";
import { useRouter } from 'vue-router';
import logoWhite from '../../../assets/images/auth/logo_white.png';

const router = useRouter();
</script>


<template>
  <AuthTemplate>
    <template #left-section>
      <div class="flex w-full items-center justify-center">
        <img :src="logoWhite" alt="OneSila brand mark" class="max-h-[420px] w-auto object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.4)]" />
      </div>
    </template>

    <template #right-section-header>
      <LanguageDropdown :show="true" class="ms-auto w-max"/>
    </template>

    <template #right-section-content>
        <RegisterCompanyForm v-if="router.currentRoute.value.name === 'auth.register.company'"/>
        <RegisterForm v-else />
    </template>
  </AuthTemplate>
</template>
