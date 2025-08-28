<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Card } from '../../../../../../../shared/components/atoms/card';
import { Button } from '../../../../../../../shared/components/atoms/button';
import WebhookInfoBlock from '../../integration-specific-step/webhook/WebhookInfoBlock.vue';

const emit = defineEmits<{ (e: 'close'): void }>();
const { t } = useI18n();
const close = () => emit('close');
</script>

<template>
  <Card class="modal-content w-[80%] px-10 pt-10">
    <WebhookInfoBlock />
    <hr />
    <div class="flex justify-end gap-4 mt-4">
      <Button class="btn btn-outline-dark" @click="close">{{ t('shared.button.cancel') }}</Button>
    </div>
  </Card>
</template>
