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

useEnterKeyboardListener(onLoginClicked);

</script>

<template>
  <div>
    <div class="mb-10">
      <h1 class="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">{{ t('auth.login.header') }}</h1>
      <p class="text-base font-bold leading-normal text-white-dark">{{ t('auth.login.description') }}</p>
    </div>
    <TextInputPrepend id="username" v-model="form.username" :label="t('shared.labels.email')" :placeholder="t('auth.register.placeholders.email')" type="username">
      <Icon name="envelope"/>
    </TextInputPrepend>
    <TextInputPrepend id="password" v-model="form.password" :label="t('auth.register.labels.password')" :placeholder="t('auth.register.placeholders.password')" type="password">
      <Icon name="lock"/>
    </TextInputPrepend>

    <div>
      <Button :customClass="'btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(70,70,229,0.44)]'" @click="onLoginClicked()">
        {{ t('shared.button.login') }}
      </Button>

      <div class="mt-4"></div>

      <div class="text-center">
          <Link :path="{name: 'auth.recover'}" class="text-xs text-gray-600 underline transition hover:text-primary">{{ t('auth.login.recover') }}</Link>
      </div>

      <div class="text-center dark:text-white mt-9">
        {{ t('auth.login.registerPrompt') }}
        <Link class="uppercase text-primary underline transition hover:text-black dark:hover:text-white" :path="{ name: 'auth.register' }"
        >{{ t('auth.login.register') }}</Link>
      </div>
    </div>
  </div>
</template>