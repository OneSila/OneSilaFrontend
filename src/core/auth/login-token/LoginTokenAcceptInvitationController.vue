<script lang="ts" setup>

import { onMounted, Ref, ref } from 'vue';
import LanguageDropdown from "../../../shared/components/molecules/languages-dropdown/LanguageDropdown.vue";
import { LoginTokenForm } from "./containers/login-token-form";
import AuthTemplate from "../AuthTemplate.vue";
import {injectAuth, refreshUser, setAuthChangingState} from '../../../shared/modules/auth';
import { authenticateTokenMutation } from '../../../shared/api/mutations/auth.js';
import apolloClient from '../../../../apollo-client';

import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import {OnboardingStatus} from "../../../shared/utils/constants";
import logoWhite from '../../../assets/images/auth/logo_white.png';
import {Link} from "../../../shared/components/atoms/link";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const token = ref(route.params.token);
const auth = injectAuth();
const errors: Ref<string[]> = ref([]);
const passwordSet = ref(false);

const handlePasswordSet = async () => {
  passwordSet.value = true;
  await authentificateUserByToken(false);
}

const authentificateUserByToken = async (refreshFrontendUser: boolean = true) => {

  try {
    const { data } = await apolloClient.mutate({
      mutation: authenticateTokenMutation,
      variables: { token: token.value },
    });

    if (data && data.authenticateToken) {

      if (refreshFrontendUser && !auth.user.active) {
        const user = data.authenticateToken;
        refreshUser(auth, {
          username: user.username,
          language: user.language,
          firstName: user.firstName,
          lastName: user.lastName,
          onboardingStatus: user.onboardingStatus,
          company: user.multiTenantCompany,
          companyOwner: user.isMultiTenantCompanyOwner,
          active: passwordSet.value
        });
        setAuthChangingState(auth, false);
      }

    } else {
      throw new Error(t('auth.recover.tokenFailed'));
    }
  } catch (err) {
    console.error('Token authentication failed:', err);

    const graphqlError = err as { graphQLErrors: Array<{ message: string }> };

    if (graphqlError.graphQLErrors) {
      errors.value = graphqlError.graphQLErrors.map(x => x.message);
    } else {
      errors.value = ['An unexpected error occurred'];
    }
  }
};

onMounted(() => {
  authentificateUserByToken();
});


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

    <template v-slot:right-section-content>
      <div class="mb-7 space-y-6">
        <div>
          <h1 class="mb-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {{ t('auth.acceptInvitation.header') }}
          </h1>
          <p class="text-base leading-6 text-gray-500 dark:text-gray-400">
            {{ t('auth.acceptInvitation.description') }}
          </p>
        </div>
        <div v-if="errors.length" class="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-red-800 shadow-sm dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          <p class="font-semibold">{{ t('shared.labels.errors') }}</p>
          <ul class="mt-3 list-disc space-y-1 pl-5 text-sm">
            <li v-for="error in errors" :key="error">
              {{ error }}
            </li>
          </ul>
        </div>
        <div v-else>
          <LoginTokenForm @password-set="handlePasswordSet" />
        </div>

                <div class="text-center text-sm text-gray-600 dark:text-white">
          {{ t('auth.recover.loginPrompt') }}
          <Link
            class="font-semibold text-primary underline underline-offset-2 transition hover:text-primary/80 dark:hover:text-primary/70"
            :path="{ name: 'auth.login' }"
          >
            {{ t('auth.register.login') }}
          </Link>
        </div>

      </div>

    </template>

  </AuthTemplate>
</template>
