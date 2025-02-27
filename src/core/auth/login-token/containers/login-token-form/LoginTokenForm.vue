<script lang="ts" setup>
import { reactive, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { injectAuth, refreshUser } from '../../../../../shared/modules/auth';
import { acceptUserInvitationMutation } from '../../../../../shared/api/mutations/auth.js';
import { Button } from '../../../../../shared/components/atoms/button';
import TextInputPrepend from "../../../../../shared/components/atoms/input-text-prepend/TextInputPrepend.vue";
import Icon from "../../../../../shared/components/atoms/icon/Icon.vue";
import { Toast } from "../../../../../shared/modules/toast";
import {displayApolloError} from "../../../../../shared/utils";
import {Checkbox} from "../../../../../shared/components/atoms/checkbox";
import {Link} from "../../../../../shared/components/atoms/link";

const { t, locale } = useI18n();
const router = useRouter();
const auth = injectAuth();
const emit = defineEmits(['password-set']);

const loading = ref(false);
const form = reactive({
  password: '',
  confirmPassword: '',
  agreedTerms: false,
});

const isFormValid = computed(() => {
  return form.password && form.password === form.confirmPassword && form.agreedTerms;
});

const onAcceptInvitationCompleted = async (response) => {

  loading.value = true;
  if (response.data.acceptUserInvitation) {
    const user = response.data.acceptUserInvitation;

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

    loading.value = false
    await emit('password-set');
    router.push({ name: 'dashboard' });
  } else {
   loading.value = false
   Toast.error(t('shared.alert.toast.generalError'));
  }
};

const onError = (error) => {
  displayApolloError(error);
};

</script>

<template>
  <div v-if="!loading">
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

    <ApolloMutation :mutation="acceptUserInvitationMutation" :variables="{ password: form.password, language: locale }" @done="onAcceptInvitationCompleted" @error="onError">
      <template v-slot="{ mutate, loading, error }">
        <Button :customClass="'btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]'"
                :disabled="loading || !isFormValid"
                @click="mutate">
          {{ t('auth.acceptInvitation.button.setPassword') }}
        </Button>
      </template>
    </ApolloMutation>
  </div>
    <div v-else class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" >
      <div class="text-center">
        <svg class="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-xl font-semibold text-white mt-2">{{ t('shared.labels.loading') }}</p>
      </div>
    </div>
</template>


