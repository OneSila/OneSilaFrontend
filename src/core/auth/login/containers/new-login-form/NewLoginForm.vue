<script lang="ts" setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { injectAuth, refreshUser } from '../../../../../shared/modules/auth';
import { useEnterKeyboardListener } from '../../../../../shared/modules/keyboard';
import { Button } from '../../../../../shared/components/atoms/button';
import { TextInputPrepend } from '../../../../../shared/components/atoms/input-text-prepend';
import { Icon } from '../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../shared/components/atoms/link';
import apolloClient from '../../../../../../apollo-client';
import { loginMutation } from '../../../../../shared/api/mutations/auth.js'
import { displayApolloError } from "../../../../../shared/utils";

const { t, locale } = useI18n();
const router = useRouter();
const auth = injectAuth();

const form = reactive({
  username: '',
  password: '',
});

const onLoginClicked = async () => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: loginMutation,
      variables: {
        username: form.username,
        password: form.password,
      },
    });

    if (data && data.login) {
      const user = data.login;
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

      locale.value = user.language;

      router.push({ name: 'dashboard' });
    } else {
      throw new Error(t('auth.login.failed'));
    }
  } catch (error) {
    displayApolloError(error);
  }
};

const goToRecover = () => {
  router.push({ name: 'auth.recover' });
};

useEnterKeyboardListener(onLoginClicked);

</script>

<template>
  <div class="text-gray-900 dark:text-gray-100">
    <div>
      <h1 class="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{{ t('auth.login.header') }}</h1>
      <p class="mt-2 text-base leading-6 text-gray-500 dark:text-gray-400">{{ t('auth.login.description') }}</p>
    </div>

    <div class="mt-10 space-y-2">
      <TextInputPrepend
        id="username"
        v-model="form.username"
        :label="t('shared.labels.email')"
        :placeholder="t('auth.register.placeholders.email')"
        type="username"
      >
        <Icon name="envelope" />
      </TextInputPrepend>

      <TextInputPrepend
        id="password"
        v-model="form.password"
        :label="t('auth.register.labels.password')"
        :placeholder="t('auth.register.placeholders.password')"
        type="password"
      >
        <Icon name="lock" />
      </TextInputPrepend>
    </div>

    <div class="mt-8 space-y-4">
      <Button
        :customClass="'flex w-full justify-center rounded-xl bg-primary px-4 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:bg-primary dark:hover:bg-primary/80'"
        @click="onLoginClicked()"
      >
        {{ t('shared.button.login') }}
      </Button>

      <Button
        :customClass="'flex w-full justify-center rounded-xl border border-primary/40 px-4 py-2.5 text-base font-semibold text-primary transition hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-white/30 dark:text-white dark:hover:bg-white/10 dark:focus-visible:outline-white'"
        @click="goToRecover"
      >
        {{ t('auth.login.recover') }}
      </Button>
    </div>

    <div class="mt-10 text-center text-sm text-gray-600 dark:text-gray-300">
      {{ t('auth.login.registerPrompt') }}
      <Link
        class="font-semibold text-primary underline underline-offset-2 transition hover:text-primary/80 dark:hover:text-primary/70"
        :path="{ name: 'auth.register' }"
      >
        {{ t('auth.login.register') }}
      </Link>
    </div>
  </div>
</template>
