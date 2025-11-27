<script lang="ts" setup>

import {Ref, ref} from 'vue';
import LanguageDropdown from "../../../shared/components/molecules/languages-dropdown/LanguageDropdown.vue";
import { Link } from "../../../shared/components/atoms/link";
import AuthTemplate from "../AuthTemplate.vue";
import {injectAuth, refreshUser, setAuthChangingState} from '../../../shared/modules/auth';
import { authenticateTokenMutation } from '../../../shared/api/mutations/auth.js';
import apolloClient from '../../../../apollo-client';

import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import {displayApolloError} from "../../../shared/utils";
import logoWhite from '../../../assets/images/auth/logo_white.png';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const token = ref(route.params.token);
const auth = injectAuth();
const errors: Ref<string[]> = ref([]);

const executeMutation = async () => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: authenticateTokenMutation,
      variables: { token: token.value },
    });

    if (data && data.authenticateToken) {

      const user = data.authenticateToken;
      refreshUser(auth, {
        username: user.username,
        language: user.language,
        firstName: user.firstName,
        lastName: user.lastName,
        onboardingStatus: user.onboardingStatus,
        company: user.multiTenantCompany,
        companyOwner: user.isMultiTenantCompanyOwner,
        active: user.isActive
      });

      router.push({
          name: 'profile.user',
          query: { tab: 'security' }
      });
    } else {
      throw new Error(t('auth.recover.tokenFailed'));
    }
  } catch (err) {

    console.error('Token authentication failed:', err);

    const graphqlError = err as { graphQLErrors: Array<{ message: string }> };

    if (graphqlError.graphQLErrors?.length === 0) {
      errors.value.push(t('auth.recover.tokenFailed'));
    } else if (graphqlError.graphQLErrors) {
      graphqlError.graphQLErrors.forEach((x) => {
        errors.value.push(x.message);
      });
    }
  }
};

executeMutation();

</script>

<template>
  <AuthTemplate v-if="errors.length > 0">
    <template #left-section>
      <div class="flex w-full items-center justify-center">
        <img :src="logoWhite" alt="OneSila brand mark" class="max-h-[420px] w-auto object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.4)]" />
      </div>
    </template>

    <template #right-section-header>
      <LanguageDropdown :show="true" class="ms-auto w-max"/>
    </template>

    <template #right-section-content>
      <div class="mb-7 space-y-6">
        <div>
          <h1 class="mb-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {{ t('auth.recover.tokenHeader') }}
          </h1>
          <p class="text-base leading-6 text-gray-500 dark:text-gray-400">
            {{ t('auth.recover.tokenDescription') }}
          </p>
        </div>

        <div class="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-red-800 shadow-sm dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          <p class="font-semibold">{{ t('shared.labels.errors') }}</p>
          <ul class="mt-3 list-disc space-y-1 pl-5 text-sm">
            <li v-for="(error, index) in errors" :key="index" class="leading-5">
              {{ error }}
            </li>
          </ul>
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
  <template v-else>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="text-center">
        <svg class="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-xl font-semibold text-white mt-2">{{ t('shared.labels.loading') }}</p>
      </div>
    </div>
  </template>
</template>
