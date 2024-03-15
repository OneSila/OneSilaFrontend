<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { Button } from '../../../../../shared/components/atoms/button';
import { TextInputPrepend } from '../../../../../shared/components/atoms/input-text-prepend';
import { Icon } from '../../../../../shared/components/atoms/icon';
import { Card } from '../../../../../shared/components/atoms/card';
import { inviteMemberMutation } from '../../../../../shared/api/mutations/auth.js';
import { useI18n } from 'vue-i18n';
import {EmailInput} from "../../../../../shared/components/atoms/input-email";

const { t } = useI18n();

const props = defineProps({
  language: String
});

const emit = defineEmits(['inviteSubmitted']);

const form = ref({
  firstName: '',
  lastName: '',
  username: '',
  language: props.language
});

const afterInvite = () => {
  emit('inviteSubmitted', form.value);
  form.value = { firstName: '', lastName: '', username: '', language: props.language };
};
</script>


<template>
  <Card class="w-1/3">
    <TextInputPrepend id="firstName" v-model="form.firstName" class="mb-2" :label="t('profile.labels.firstName')" :placeholder="t('profile.placeholders.firstName')">
      <Icon name="user"/>
    </TextInputPrepend>
    <TextInputPrepend id="lastName" v-model="form.lastName" class="mb-2" :label="t('profile.labels.lastName')" :placeholder="t('profile.placeholders.lastName')">
      <Icon name="user"/>
    </TextInputPrepend>
    <EmailInput id="email" class="mb-2" icon="envelope" v-model:model-value="form.username" :label="t('companyProfile.labels.email')" :placeholder="t('companyProfile.placeholders.email')" />

    <ApolloMutation :mutation="inviteMemberMutation" :variables="form" @done="afterInvite">
      <template v-slot="{ mutate, loading, error }">
        <Button :disabled="loading" @click="mutate()" custom-class="btn btn-primary">
          {{ t('shared.button.invite') }}
        </Button>
        <p v-if="error">{{ error.message }}</p>
      </template>
    </ApolloMutation>
  </Card>
</template>