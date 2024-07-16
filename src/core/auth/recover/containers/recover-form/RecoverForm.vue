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
  <div>
    <template v-if="requestSent">
      <div class="mb-7">
          <h1 class="mb-3 text-2xl font-bold !leading-snug dark:text-white">
              {{ t('auth.recover.header') }}
          </h1>
          <p>{{ t('auth.recover.descriptionSent') }}</p>
          <p class="mt-4">{{ t('auth.recover.descriptionCountdown') }}</p>
        <p class="text-2xl font-bold text-primary dark:text-yellow-300 mt-2">
          {{ countdown }}
        </p>
        <div class="dark:text-white mt-9">
          {{ t('auth.recover.loginPrompt') }}
          <Link
              class="uppercase text-primary underline transition hover:text-black dark:hover:text-white"
              :path="{name: 'auth.login'}"
          >{{ t('auth.register.login') }}</Link>
        </div>
      </div>
      </template>
      <template v-else>
      <div class="mb-7">
          <h1 class="mb-3 text-2xl font-bold !leading-snug dark:text-white">
              {{ t('auth.recover.header') }}
          </h1>
          <p>{{ t('auth.recover.description') }}</p>
      </div>
      <EmailInput id="email" icon="envelope" v-model:model-value="form.email" :label="t('auth.recover.labels.email')" :placeholder="t('auth.recover.placeholders.email')" />

      <div>
      <ApolloMutation :mutation="requestLoginLinkMutation" :variables="{ username: form.email }" @done="onRecoverClicked" @error="onError">
        <template v-slot="{ mutate, loading, error }">
          <Button ref="submitButtonRef" :customClass="'btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]'" :disabled="loading" @click="mutate()">          {{ t('shared.button.recover') }}
          </Button>
        </template>
      </ApolloMutation>
      </div>

      <div class="text-center dark:text-white mt-9">
          {{ t('auth.recover.loginPrompt') }}
          <Link
              class="uppercase text-primary underline transition hover:text-black dark:hover:text-white"
              :path="{name: 'auth.login'}"
          >{{ t('auth.register.login') }}</Link>
      </div>
    </template>
  </div>
</template>
