<script setup>
import { ref, defineProps } from 'vue';
import { Button } from '../../../../../shared/components/atoms/button';
import { TextInputPrepend } from '../../../../../shared/components/atoms/text-input-prepend';
import { Icon } from '../../../../../shared/components/atoms/icon';
import { Card } from '../../../../../shared/components/atoms/card';
import { inviteMemberMutation } from '../../../../../shared/api/mutations/auth';

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
    <TextInputPrepend id="firstName" v-model="form.firstName" class="mb-2" label="First Name" placeholder="Enter first name">
      <Icon name="user"/>
    </TextInputPrepend>
    <TextInputPrepend id="lastName" v-model="form.lastName" class="mb-2" label="Last Name" placeholder="Enter last name">
      <Icon name="user"/>
    </TextInputPrepend>
    <TextInputPrepend id="username" v-model="form.username" class="mb-2" label="Email" placeholder="Enter email">
      <Icon name="envelope"/>
    </TextInputPrepend>

    <ApolloMutation :mutation="inviteMemberMutation" :variables="form" @done="afterInvite">
      <template v-slot="{ mutate, loading, error }">
        <Button :disabled="loading" @click="mutate()">
          Invite
        </Button>
        <p v-if="error">{{ error.message }}</p>
      </template>
    </ApolloMutation>
  </Card>
</template>