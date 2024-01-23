<script lang="ts" setup>
import {reactive, Ref, ref, computed} from 'vue';
import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {
  injectAuth,
  refreshUser,
} from '../../../../../shared/modules/auth';
import {useSafeRequest} from '../../../../../shared/modules/network';
import { loginMutation, registerMutation } from '../../../../../shared/api/mutations/auth.js'
import Link from "../../../../../shared/components/atoms/link/Link.vue";
import {Button} from '../../../../../shared/components/atoms/button';
import TextInputPrepend from "../../../../../shared/components/atoms/text-input-prepend/TextInputPrepend.vue";
import Icon from "../../../../../shared/components/atoms/icon/Icon.vue";
import apolloClient from "../../../../../../apollo-client";

const {t, locale} = useI18n();
const router = useRouter();
const auth = injectAuth();

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});


const isFormValid = computed(() => {
  return form.username && form.password && form.password === form.confirmPassword;
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


</script>

<template>
  <div>
    <div class="mb-10">
      <h1 class="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">{{ t('auth.register.header') }}</h1>
      <p class="text-base font-bold leading-normal text-white-dark">{{ t('auth.register.description') }}</p>
    </div>
    <TextInputPrepend id="username" v-model="form.username" :label="t('auth.register.labels.email')" :placeholder="t('auth.register.placeholders.email')" type="email">
      <Icon name="envelope"/>
    </TextInputPrepend>
    <TextInputPrepend id="password" v-model="form.password" :label="t('auth.register.labels.password')" :placeholder="t('auth.register.placeholders.password')" type="password">
      <Icon name="lock"/>
    </TextInputPrepend>
    <TextInputPrepend id="confirmPassword" v-model="form.confirmPassword" :label="t('auth.register.labels.confirmPassword')" :placeholder="t('auth.register.placeholders.confirmPassword')" type="password">
      <Icon name="lock"/>
    </TextInputPrepend>

    <div>
    <ApolloMutation :mutation="registerMutation" :variables="{ username: form.username, password: form.password, language: locale }" @done="afterRegister">
      <template v-slot="{ mutate, loading, error }">
        <Button :customClass="'btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]'"
                :disabled="loading || !isFormValid"
                @click="mutate()"
        >
          {{ t('shared.button.register') }}
        </Button>
        <p v-if="error">{{ error.message }}</p>
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