<script lang="ts" setup>

import {Ref, ref} from 'vue';
import Logo from "../../../shared/components/molecules/logo/Logo.vue";
import LanguageDropdown from "../../../shared/components/molecules/languages-dropdown/LanguageDropdown.vue";
import BackgroundImage from "../../../shared/components/atoms/background-image/BackgroundImage.vue";
import bgGradient from '../../../assets/images/auth/bg-gradient.png';
import comingSoonObject1 from '../../../assets/images/auth/coming-soon-object1.png';
import comingSoonObject2 from '../../../assets/images/auth/coming-soon-object2.png';
import comingSoonObject3 from '../../../assets/images/auth/coming-soon-object3.png';
import polygonObject from '../../../assets/images/auth/polygon-object.svg';
import recoverAccount from '../../../assets/images/auth/recover-account.svg';
import Image from "../../../shared/components/atoms/image/Image.vue";
import AuthTemplate from "../AuthTemplate.vue";
import { injectAuth, refreshUser } from '../../../shared/modules/auth';
import { authenticateTokenMutation } from '../../../shared/api/mutations/auth.js';
import apolloClient from '../../../../apollo-client';

import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import {displayApolloError} from "../../../shared/utils";

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

    if (graphqlError.graphQLErrors) {
      graphqlError.graphQLErrors.map(x => {
          displayApolloError(x.message);
          errors.value.push(x.message);
        }
      )
    }
  }
};

executeMutation();

</script>

<template>
  <AuthTemplate v-if="errors.length > 0">
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
      <Logo alt="Logo" class="w-1/4 h-1/4 mx-auto" to="/" />
      <Flex class="mt-24 hidden lg:block">
          <FlexCell class="w-full max-w-[430px] mx-auto">
            <Image :source="recoverAccount" alt="Cover Image" class="w-full" />
          </FlexCell>
      </Flex>
    </template>

    <template v-slot:right-section-header>
      <Logo alt="Logo" to="/" class="w-8 block lg:hidden" />
      <LanguageDropdown :show="true" class="ms-auto w-max"/>
    </template>

    <template v-slot:right-section-content>
      <div class="mb-7">
        <h1 class="mb-3 text-2xl font-bold !leading-snug dark:text-white">
          {{ t('auth.recover.tokenHeader') }}
        </h1>
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
