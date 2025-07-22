<script lang="ts" setup>
import { reactive, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { injectAuth, refreshUser } from '../../../../../shared/modules/auth';
import { loginMutation, registerMutation } from '../../../../../shared/api/mutations/auth.js'
import { Link } from "../../../../../shared/components/atoms/link";
import {Button} from '../../../../../shared/components/atoms/button';
import { TextInputPrepend } from "../../../../../shared/components/atoms/input-text-prepend";
import { Icon } from "../../../../../shared/components/atoms/icon";
import apolloClient from "../../../../../../apollo-client";
import { EmailInput } from "../../../../../shared/components/atoms/input-email";
import { displayApolloError } from "../../../../../shared/utils";
import { useEnterKeyboardListener } from "../../../../../shared/modules/keyboard";
import { Checkbox } from '../../../../../shared/components/atoms/checkbox';

const {t, locale} = useI18n();
const router = useRouter();
const auth = injectAuth();

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  agreedTerms: false,
});
const submitButtonRef = ref();


const isFormValid = computed(() => {
  return (
    form.username &&
    form.password &&
    form.password === form.confirmPassword &&
    form.agreedTerms
  );
});


const afterRegister = async () => {
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

      router.push({ name: 'auth.register.company' });
    } else {
      throw new Error(t('auth.login.failed'));
    }
  } catch (error) {
    console.error('Login error:', error);
  }
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
    <div class="mb-10">
      <h1 class="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">{{ t('auth.register.header') }}</h1>
      <p class="text-base font-bold leading-normal text-white-dark">{{ t('auth.register.description') }}</p>
    </div>
    <EmailInput id="email" class="mb-2" icon="envelope" v-model:model-value="form.username" :label="t('shared.labels.email')" :placeholder="t('auth.register.placeholders.email')" />
    <TextInputPrepend id="password" class="mb-2" v-model="form.password" :label="t('auth.register.labels.password')" :placeholder="t('auth.register.placeholders.password')" type="password">
      <Icon name="lock"/>
    </TextInputPrepend>
    <TextInputPrepend id="confirmPassword" class="mb-2" v-model="form.confirmPassword" :label="t('auth.register.labels.confirmPassword')" :placeholder="t('auth.register.placeholders.confirmPassword')" type="password">
      <Icon name="lock"/>
    </TextInputPrepend>

    <Checkbox v-model="form.agreedTerms">
      {{ t('auth.register.agreeTerms') }}
      <Link
        class="text-primary underline hover:text-black dark:hover:text-white"
        :path="'https://www.onesila.com/terms-conditions-onesila/'"
        target="_blank"
        external
      >
        {{ t('auth.register.termsAndConditions') }}
      </Link>
    </Checkbox>

    <div>
      <ApolloMutation :mutation="registerMutation" :variables="{ username: form.username, password: form.password, language: locale }" @done="afterRegister" @error="onError">
        <template v-slot="{ mutate, loading, error }">
          <Button ref="submitButtonRef" :customClass="'btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(70,70,229,0.44)]'"
                  :disabled="loading || !isFormValid"
                  @click="mutate()">
            {{ t('shared.button.register') }}
          </Button>
        </template>
      </ApolloMutation>

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