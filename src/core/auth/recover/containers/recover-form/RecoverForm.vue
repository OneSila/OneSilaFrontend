<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Button } from '../../../../../shared/components/atoms/button';
import { Link } from '../../../../../shared/components/atoms/link';
import { requestLoginLinkMutation } from '../../../../../shared/api/mutations/auth.js'
import { EmailInput } from "../../../../../shared/components/atoms/input-email";
import { displayApolloError } from "../../../../../shared/utils";
import { useEnterKeyboardListener } from "../../../../../shared/modules/keyboard";

const { t } = useI18n();
const router = useRouter();

const form = reactive({
  email: '',
});

const requestSent = ref(false);
const countdown = ref('');
const countdownInterval = ref();
const submitButtonRef = ref();

const startCountdown = (createdAt, expiresAt) => {
  const endTime = new Date(expiresAt).getTime();
  countdownInterval.value = setInterval(() => {
    const now = new Date().getTime();
    const timeLeft = endTime - now;

    if (timeLeft <= 0) {
      clearInterval(countdownInterval.value);
      countdown.value = '00:00:00';
    } else {
      countdown.value = formatTime(timeLeft);
    }
  }, 1000);
};

const formatTime = (milliseconds) => {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds %= 60;
  minutes %= 60;
  hours %= 24;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
const onRecoverClicked = async (response) => {
  requestSent.value = true;
  startCountdown(response.data.recoveryToken?.createdAt, response.data.recoveryToken?.expiresAt);
};

const onError = (error) => {
  displayApolloError(error);
};

const onSubmit = () => {
  submitButtonRef.value?.$el.click();
};

useEnterKeyboardListener(onSubmit);

</script>

<template>
  <div class="text-gray-900 dark:text-gray-100">
    <template v-if="requestSent">
      <div class="mb-7">
          <h1 class="mb-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {{ t('auth.recover.header') }}
          </h1>
          <p class="text-base leading-6 text-gray-500 dark:text-gray-400">{{ t('auth.recover.descriptionSent') }}</p>
          <p class="mt-4 text-base leading-6 text-gray-500 dark:text-gray-400">{{ t('auth.recover.descriptionCountdown') }}</p>
        <p class="mt-2 text-2xl font-bold text-primary dark:text-yellow-300">
          {{ countdown }}
        </p>
        <div class="mt-9 text-gray-900 dark:text-white">
          {{ t('auth.recover.loginPrompt') }}
          <Link
              class="font-semibold text-primary underline underline-offset-2 transition hover:text-primary/80 dark:hover:text-primary/70"
              :path="{name: 'auth.login'}"
          >{{ t('auth.register.login') }}</Link>
        </div>
      </div>
      </template>
      <template v-else>
      <div class="mb-7">
          <h1 class="mb-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {{ t('auth.recover.header') }}
          </h1>
          <p class="text-base leading-6 text-gray-500 dark:text-gray-400">{{ t('auth.recover.description') }}</p>
      </div>
      <EmailInput id="email" icon="envelope" v-model:model-value="form.email" :label="t('auth.recover.labels.email')" :placeholder="t('auth.recover.placeholders.email')" />

      <div class="mt-4">
      <ApolloMutation :mutation="requestLoginLinkMutation" :variables="{ username: form.email }" @done="onRecoverClicked" @error="onError">
        <template v-slot="{ mutate, loading, error }">
          <Button
            ref="submitButtonRef"
            :customClass="'flex w-full justify-center rounded-xl bg-primary px-4 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:bg-primary dark:hover:bg-primary/80'"
            :disabled="loading"
            @click="mutate()"
          >
            {{ t('shared.button.recover') }}
          </Button>
        </template>
      </ApolloMutation>
      </div>

      <div class="mt-9 text-center text-sm text-gray-600 dark:text-white">
          {{ t('auth.recover.loginPrompt') }}
          <Link
              class="font-semibold text-primary underline underline-offset-2 transition hover:text-primary/80 dark:hover:text-primary/70"
              :path="{name: 'auth.login'}"
          >{{ t('auth.register.login') }}</Link>
      </div>
    </template>
  </div>
</template>
