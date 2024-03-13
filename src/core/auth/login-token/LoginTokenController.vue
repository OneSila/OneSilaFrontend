<script lang="ts" setup>

import { ref } from 'vue';
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

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const token = ref(route.params.token);
const auth = injectAuth();
const errors = ref([]);

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
    errors.value = err.graphQLErrors.map(x => x.message);
  }
};

executeMutation();

</script>

<template>
  <AuthTemplate>
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
      <Logo src="/assets/images/auth/logo.png" alt="Logo" class="w-1/4 h-1/4 mx-auto" to="/" />
      <Flex class="mt-24 hidden lg:block">
          <FlexCell class="w-full max-w-[430px] mx-auto">
            <Image :source="recoverAccount" alt="Cover Image" class="w-full" />
          </FlexCell>
      </Flex>
    </template>

    <template v-slot:right-section-header>
      <Logo src="/src/assets/images/auth/logo-white.svg" alt="Logo" to="/" class="w-8 block lg:hidden" />
      <LanguageDropdown class="ms-auto w-max"/>
    </template>

    <template v-slot:right-section-content>
      <div class="mb-7">
        <h1 class="mb-3 text-2xl font-bold !leading-snug dark:text-white">
          {{ t('auth.recover.tokenHeader') }}
        </h1>
        <div v-if="errors.length">
          <p v-for="error in errors">{{ error }}</p>
        </div>
      </div>

    </template>

  </AuthTemplate>
</template>
