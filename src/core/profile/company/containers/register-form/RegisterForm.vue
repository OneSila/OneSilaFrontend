<script lang="ts" setup>
import {reactive, Ref, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';

import {
  injectAuth,
  refreshUser,
  replaceAuth,
} from '../../../../../shared/modules/auth';
import {useSafeRequest} from '../../../../../shared/modules/network';
import {useEnterKeyboardListener} from '../../../../../shared/modules/keyboard';

import Link from "../../../../../shared/components/atoms/link/Link.vue";
import {Button} from '../../../../../shared/components/atoms/button';
import TextInputPrepend from "../../../../../shared/components/atoms/text-input-prepend/TextInputPrepend.vue";
import Icon from "../../../../../shared/components/atoms/icon/Icon.vue";

const {t, locale} = useI18n();
const router = useRouter();

const form = reactive({
  companyName: '',
  username: '',
  password: '',
});

const errors: Ref<any[]> = ref([]);

const safeRequest = useSafeRequest(errors, () => {
  errors.value = [];

  if (!form.companyName) {
    errors.value.push(t('auth.login.companyName'));
  }

  if (!form.username) {
    errors.value.push(t('auth.login.missingEmail'));
  }

  if (!form.password) {
    errors.value.push(t('auth.login.missingPassword'));
  }
});

const auth = injectAuth();

const onLoginClicked = async () => {

  alert('register')

};

useEnterKeyboardListener(() => {
  onLoginClicked();
});
</script>

<template>
  <div>
    <div class="mb-10">
      <h1 class="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">{{ t('auth.register.header') }}</h1>
      <p class="text-base font-bold leading-normal text-white-dark">{{ t('auth.register.description') }}</p>
    </div>
    <TextInputPrepend id="companyName" v-model="form.companyName" :label="t('auth.register.labels.companyName')" :placeholder="t('auth.register.placeholders.companyName')" type="text">
      <Icon name="building"/>
    </TextInputPrepend>
    <TextInputPrepend id="username" v-model="form.username" :label="t('auth.register.labels.email')" :placeholder="t('auth.register.placeholders.email')" type="email">
      <Icon name="envelope"/>
    </TextInputPrepend>
    <TextInputPrepend id="password" v-model="form.password" :label="t('auth.register.labels.password')" :placeholder="t('auth.register.placeholders.password')" type="password">
      <Icon name="lock"/>
    </TextInputPrepend>

    <div>
      <Button :customClass="'btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]'" @click="onLoginClicked()">
        {{ t('shared.button.register') }}
      </Button>

      <div class="text-center dark:text-white mt-9">
        {{ t('auth.register.loginPrompt') }}
        <Link
            class="uppercase text-primary underline transition hover:text-black dark:hover:text-white"
            :path="{name: 'auth.login'}"
        >{{ t('auth.register.login') }}</Link>
      </div>

    </div>
  </div>
</template>