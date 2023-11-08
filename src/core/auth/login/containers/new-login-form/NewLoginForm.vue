<script lang="ts" setup>
import { reactive, ref, Ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { injectAuth, refreshUser } from '../../../../../shared/modules/auth';
import { useSafeRequest } from '../../../../../shared/modules/network';
import { useEnterKeyboardListener } from '../../../../../shared/modules/keyboard';
import { Button } from '../../../../../shared/components/atoms/button';
import { TextInputPrepend } from '../../../../../shared/components/atoms/text-input-prepend';
import { Icon } from '../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../shared/components/atoms/link';

const LOGIN_MUTATION = gql`
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    username
    firstName
    lastName
  }
}`;

const { t, locale } = useI18n();
const router = useRouter();
const auth = injectAuth();
const errors: Ref<any[]> = ref([]);

const form = reactive({
  username: '',
  password: '',
});

const safeRequest = useSafeRequest(errors);

const { mutate, loading } = useMutation(LOGIN_MUTATION);

const onLoginClicked = async () => {
  if (loading.value) {
    return;
  }

  try {
    const response = await safeRequest(() => mutate({
      username: form.username,
      password: form.password,
    }));

    if (response.login) {
      const user = response.login;
      user.id = 1;
      user.language = 'en';
      refreshUser(auth, {
        id: user.id,
        username: user.username,
        language: user.language,
        firstName: user.firstName,
        lastName: user.lastName
      });

      locale.value = user.language;
      router.replace({ name: 'dashboard' });
    } else {
      errors.value.push(t('auth.login.failed'));
    }
  } catch (error) {
    console.error('Login error:', error);
    errors.value.push(error);
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
    <TextInputPrepend id="username" v-model="form.username" :label="t('auth.login.labels.email')" :placeholder="t('auth.login.placeholders.email')" type="username">
      <Icon name="envelope"/>
    </TextInputPrepend>
    <TextInputPrepend id="password" v-model="form.password" :label="t('auth.login.labels.password')" :placeholder="t('auth.login.placeholders.password')" type="password">
      <Icon name="lock"/>
    </TextInputPrepend>

    <div>
      <Button :customClass="'btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]'" @click="onLoginClicked()">
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