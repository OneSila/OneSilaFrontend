<script lang="ts" setup>
import { reactive, Ref, ref } from 'vue';
import { useMutation } from 'vql';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { injectAuth, refreshUser, removeAuth } from '../../../../../shared/modules/auth';
import { useSafeRequest } from '../../../../../shared/modules/network';
import { useEnterKeyboardListener } from '../../../../../shared/modules/keyboard';

import { Button } from '../../../../../shared/components/atoms/button';
import { TextInputPrepend } from '../../../../../shared/components/atoms/text-input-prepend';
import { Icon } from '../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../shared/components/atoms/link';

const { t, locale } = useI18n();
const { executeMutation, fetching } = useMutation();
const router = useRouter();

const form = reactive({
  username: '',
  password: '',
});

const errors: Ref<any[]> = ref([]);

const safeRequest = useSafeRequest(errors, () => {
  errors.value = [];

  if (!form.username) {
    errors.value.push(t('auth.login.missingEmail'));
  }

  if (!form.password) {
    errors.value.push(t('auth.login.missingPassword'));
  }
});

const auth = injectAuth();

const onLoginClicked = async () => {
  if (fetching.value) {
    return;
  }

  const data = await safeRequest(() =>
    executeMutation({
      username: form.username,
      password: form.password,
    }),
  );

  if (!data || !data.login) {
    // Handle login error (wrong credentials, server error, etc.)
    return;
  }

  const user = data.login;
  user.id = 1;
  user.language = 'en';

  refreshUser(auth, {
    id: user.id,
    username: user.username,
    language: user.language, // Make sure language is returned from the server, or default it
  });


  console.log(auth)
  // Set the local UI state to match the user's preferred language
  locale.value = auth.user.language;

  // Redirect to the dashboard
  router.replace({ name: 'dashboard' });
};

useEnterKeyboardListener(() => {
  onLoginClicked();
});
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



<gql mutation>
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    username
  }
}
</gql>
