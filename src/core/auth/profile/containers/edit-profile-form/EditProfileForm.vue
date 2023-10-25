<script setup lang="ts">
import { reactive, Ref, ref } from 'vue';
import { useMutation } from 'vql';
import { useI18n } from 'vue-i18n';

import { useSafeRequest } from '../../../../../shared/modules/network';
import { useEnterKeyboardListener } from '../../../../../shared/modules/keyboard';
import { injectAuth, refreshUser } from '../../../../../shared/modules/auth';

import { Card } from '../../../../../shared/components/atoms/card';
import { Title } from '../../../../../shared/components/atoms/title';
import { Label } from '../../../../../shared/components/atoms/label';
import { Selector } from '../../../../../shared/components/atoms/selector';

import { SecondaryButton } from '../../../../../shared/components/molecules/secondary-button';

defineProps<{
  languages: any[];
}>();

const auth = injectAuth();
const { t, locale } = useI18n();
const { executeMutation, fetching } = useMutation();

const form = reactive({
  language: auth.user.language,
});

const errors: Ref<any[]> = ref([]);

const safeRequest = useSafeRequest(errors, () => {
  errors.value = [];

  if (!form.language) {
    errors.value.push(t('auth.profile.missingLanguage'));
  }
});

const onSaveClicked = async () => {
  if (fetching.value) {
    return;
  }

  const data = await safeRequest(() =>
    executeMutation({
      id: auth.user.id,
      language: form.language,
    }),
  );

  if (!data) {
    return;
  }

  const user = data.updateUser.user;

  refreshUser(auth, {
    id: parseInt(user.id),
    email: user.email,
    language: user.language.toLowerCase(),
    showOnboarding: user.showOnboarding,
  });

  locale.value = auth.user.language;
};

useEnterKeyboardListener(() => {
  onSaveClicked();
});
</script>

<template>
  <Card class="new-login-form">
    <Flex gap="4" vertical>
      <FlexCell>
        <Title level="5" semi-bold>{{ t('auth.profile.title') }}</Title>
      </FlexCell>

      <FlexCell>
        <Flex gap="2" vertical>
          <FlexCell>
            <Label>{{ t('auth.profile.languageLabel') }}</Label>
          </FlexCell>

          <FlexCell>
            <Selector
              v-model="form.language"
              class="w-full sm:w-80"
              :placeholder="t('auth.profile.languagePlaceholder')"
              label-by="name"
              value-by="locale"
              :options="languages"
              :clearable="false"
            />
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <SecondaryButton
          class="px-3"
          :loading="fetching"
          @click="onSaveClicked()"
          >{{ t('shared.components.molecules.buttons.save') }}</SecondaryButton
        >
      </FlexCell>
    </Flex>
  </Card>
</template>

<gql mutation>
mutation($id: ID!, $language: String) {
  updateUser(userData: {
    id: $id,
    language: $language
  }) {
    user {
      id
      email
      firstName
      lastName
      language
      showOnboarding
    }
  }
}
</gql>
