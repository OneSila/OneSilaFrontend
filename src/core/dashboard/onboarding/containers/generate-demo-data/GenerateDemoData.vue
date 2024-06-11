<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import {PrimaryButton} from "../../../../../shared/components/atoms/button-primary";
import apolloClient from "../../../../../../apollo-client";
import { createDemoData, deleteDemoData } from "../../../../../shared/api/mutations/auth.js";

const emit = defineEmits(['demo-data-step-done']);
const { t } = useI18n();

const handleChanged = async (newVal: boolean) => {

  if (newVal) {
    const { data } = await apolloClient.mutate({
      mutation: createDemoData
    })

    if (data && data.createDemoData) {
      alert('?')
      emit('demo-data-step-done', newVal);
    }

  } else {
    const { data } = await apolloClient.mutate({
      mutation: deleteDemoData
    })

    if (data && data.deleteDemoData) {
      emit('demo-data-step-done', newVal);
    }
  }

};

</script>

<template>
  <div class="pb-10">
    <h1 class="text-xl text-primary mb-4">{{ t('dashboard.onboarding.generateDemoData.subTitle') }}</h1>
    <hr>
    <h1 class="text-2xl my-4">{{ t('dashboard.onboarding.generateDemoData.content') }}</h1>
    <p class="mb-4">{{ t('dashboard.onboarding.generateDemoData.demoDataExplanation') }}. {{ t('dashboard.onboarding.generateDemoData.demoDataDeletionInfo') }}</p>
    <Flex class="mt-4 gap-4" center>
      <FlexCell>
        <PrimaryButton @click="handleChanged(true)">
          {{ t('shared.labels.yes') }}
        </PrimaryButton>
      </FlexCell>
      <FlexCell>
        <PrimaryButton @click="handleChanged(false)">
          {{ t('shared.labels.no') }}
        </PrimaryButton>
      </FlexCell>
    </Flex>
  </div>
</template>