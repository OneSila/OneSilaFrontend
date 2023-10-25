<script lang="ts" setup>
import {reactive, Ref, ref} from 'vue';
import {useMutation} from 'vql';
import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';

import {
  injectAuth,
  refreshUser,
  replaceAuth,
} from '../../../../../shared/modules/auth';
import {useSafeRequest} from '../../../../../shared/modules/network';
import {useEnterKeyboardListener} from '../../../../../shared/modules/keyboard';

import MeQuery from '../../../../../shared/api/queries/MeQuery.vue';

import {Card} from '../../../../../shared/components/atoms/card';
import {Title} from '../../../../../shared/components/atoms/title';
import {Label} from '../../../../../shared/components/atoms/label';
import {TextInput} from '../../../../../shared/components/atoms/text-input';

import {Button} from '../../../../../shared/components/atoms/button';
import TextInputPrepend from "../../../../../shared/components/atoms/text-input-prepend/TextInputPrepend.vue";
import Icon from "../../../../../shared/components/atoms/icon/Icon.vue";
import AlternativeLogin from "../../../../../shared/components/organisms/alternative-login/AlternativeLogin.vue";

const {t, locale} = useI18n();
const {executeMutation, fetching} = useMutation();
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

  if (!data) {
    return;
  }

  const token = data.login.token;
  const refreshToken = data.login.refreshToken;
  const username = data.login.payload.username;
  const expiresAt = data.login.payload.exp * 1000;

  auth.token = token;
  auth.refreshToken = refreshToken;
  auth.user.email = username;
  auth.expiresAt = expiresAt;

  replaceAuth(auth);

  const user = usersData?.value?.me;

  if (!user) {
    return;
  }

  refreshUser(auth, {
    id: parseInt(user.id),
    username: user.username,
    language: user.language.toLowerCase(),
    showOnboarding: user.showOnboarding,
  });

  locale.value = auth.user.language;

  router.replace({name: 'dashboard'});
};

useEnterKeyboardListener(() => {
  onLoginClicked();
});
</script>

<template>
  <div>
    <div class="mb-10">
      <h1 class="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign in</h1>
      <p class="text-base font-bold leading-normal text-white-dark">Enter your username and password to login</p>
    </div>
    <TextInputPrepend id="username" v-model="form.username" label="Email" placeholder="Enter Email" type="username">
      <Icon name="envelope"/>
    </TextInputPrepend>
    <TextInputPrepend id="password" v-model="form.password" label="Password" placeholder="Enter Password" type="password">
      <Icon name="lock"/>
    </TextInputPrepend>

    <div>
      <Button :customClass="'btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]'" @click="onLoginClicked()">
        {{ t('shared.button.login') }}
      </Button>

      <div class="relative my-7 text-center md:mb-9">
        <span
            class="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"
        ></span>
        <span
            class="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light"
        >or</span
        >
      </div>

      <AlternativeLogin/>

      <div class="text-center dark:text-white">
        Don't have an account ?
        <a
            class="uppercase text-primary underline transition hover:text-black dark:hover:text-white"
            href="/auth/cover-register"
        >SIGN UP</a
        >
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
