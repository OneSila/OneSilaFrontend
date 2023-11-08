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


import {Button} from '../../../../../shared/components/atoms/button';
import TextInputPrepend from "../../../../../shared/components/atoms/text-input-prepend/TextInputPrepend.vue";
import Icon from "../../../../../shared/components/atoms/icon/Icon.vue";
import Link from "../../../../../shared/components/atoms/link/Link.vue";
import bgGradient from "../../../../../assets/images/auth/bg-gradient.png";

const {t, locale} = useI18n();
const {executeMutation, fetching} = useMutation();
const router = useRouter();

const form = reactive({
  email: '',
});

const errors: Ref<any[]> = ref([]);
const requestSent = ref(false);

const safeRequest = useSafeRequest(errors, () => {
  errors.value = [];

  if (!form.email) {
    errors.value.push(t('auth.login.missingEmail'));
  }
});

const auth = injectAuth();

const onRecoverClicked = async () => {
  alert('recover account')
};

useEnterKeyboardListener(() => {
  onRecoverClicked();
});
</script>

<template>
  <div>
    <template v-if="requestSent">
    <div class="mb-7">
        <h1 class="mb-3 text-2xl font-bold !leading-snug dark:text-white">
            {{ t('auth.recover.header') }}
        </h1>
        <p>{{ t('auth.recover.descriptionSent') }}</p>
    </div>
    </template>
    <template v-else>
    <div class="mb-7">
        <h1 class="mb-3 text-2xl font-bold !leading-snug dark:text-white">
            {{ t('auth.recover.header') }}
        </h1>
        <p>{{ t('auth.recover.description') }}</p>
    </div>
    <TextInputPrepend id="email" v-model="form.email" :label="t('auth.recover.labels.email')" :placeholder="t('auth.recover.placeholders.email')" type="email">
      <Icon name="envelope"/>
    </TextInputPrepend>

    <div>
      <Button :customClass="'btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]'" @click="onRecoverClicked()">
        {{ t('shared.button.recover') }}
      </Button>
    </div>
    </template>
  </div>
</template>
