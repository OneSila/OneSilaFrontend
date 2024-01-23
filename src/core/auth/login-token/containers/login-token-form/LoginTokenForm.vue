<script lang="ts" setup>
import { reactive, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { injectAuth, refreshUser } from '../../../../../shared/modules/auth';
import { acceptUserInvitationMutation } from '../../../../../shared/api/mutations/auth.js';
import apolloClient from '../../../../../../apollo-client';
import { Button } from '../../../../../shared/components/atoms/button';
import TextInputPrepend from "../../../../../shared/components/atoms/text-input-prepend/TextInputPrepend.vue";
import Icon from "../../../../../shared/components/atoms/icon/Icon.vue";

const { t, locale } = useI18n();
const router = useRouter();
const auth = injectAuth();

const form = reactive({
  password: '',
  confirmPassword: ''
});

const isFormValid = computed(() => {
  return form.password && form.password === form.confirmPassword;
});

const onAcceptInvitationCompleted = async (response) => {

  if (response.data.acceptUserInvitation) {
    router.push({ name: 'dashboard' });
  } else {
    // add a toast
  }

};
</script>

<template>
  <div>
    <TextInputPrepend id="password" v-model="form.password" :label="t('auth.register.labels.password')" :placeholder="t('auth.register.placeholders.password')" type="password">
      <Icon name="lock"/>
    </TextInputPrepend>
    <TextInputPrepend id="confirmPassword" v-model="form.confirmPassword" :label="t('auth.register.labels.confirmPassword')" :placeholder="t('auth.register.placeholders.confirmPassword')" type="password">
      <Icon name="lock"/>
    </TextInputPrepend>

    <ApolloMutation :mutation="acceptUserInvitationMutation" :variables="{ password: form.password, language: locale }" @done="onAcceptInvitationCompleted">
      <template v-slot="{ mutate, loading, error }">
        <Button :customClass="'btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]'"
                :disabled="loading || !isFormValid"
                @click="mutate">
          {{ t('auth.acceptInvitation.button.setPassword') }}
        </Button>
        <p v-if="error">{{ error.message }}</p>
      </template>
    </ApolloMutation>
  </div>
</template>


