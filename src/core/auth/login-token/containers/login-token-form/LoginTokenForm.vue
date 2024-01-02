<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { injectAuth, refreshUser } from '../../../../../shared/modules/auth';
import { loginTokenMutation } from '../../../../../shared/api/mutations/auth.js';
import { Button } from '../../../../../shared/components/atoms/button';

const { t, locale } = useI18n();
const router = useRouter();
const auth = injectAuth();

const props = defineProps({
  token: String,
  buttonLabel: String
});

const onLoginCompleted = (response) => {
  const user = response.data.authenticateToken;
  if (user) {
    refreshUser(auth, {
      username: user.username,
      language: user.language,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.multiTenantCompany,
      companyOwner: user.isMultiTenantCompanyOwner
    });

    router.push({ name: 'profile.user' });
  } else {
    console.error('Token authentication failed');
  }
};
</script>


<template>
  <ApolloMutation :mutation="loginTokenMutation" :variables="{ token }" @done="onLoginCompleted">
    <template v-slot="{ mutate, loading, error }">
      <Button :customClass="'btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]'" :disabled="loading" @click="mutate()">
        {{ buttonLabel }}
      </Button>
      <p v-if="error">{{ error.message }}</p>
    </template>
  </ApolloMutation>
</template>