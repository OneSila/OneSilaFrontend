<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '../../../../../../../../../../shared/components/atoms/button';
import { TextInputPrepend } from '../../../../../../../../../../shared/components/atoms/input-text-prepend';
import { Icon } from '../../../../../../../../../../shared/components/atoms/icon';
import { Card } from '../../../../../../../../../../shared/components/atoms/card';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const emit = defineEmits(['submit', 'cancel']);

const form = ref({
  name: '',
  attributeCode: '',
});

const handleSubmit = () => {
  emit('submit', { ...form.value, isNew: true });
  form.value = { name: '', attributeCode: '' };
};

const handleCancel = () => {
  emit('cancel');
  form.value = { name: '', attributeCode: '' };
};

</script>

<template>
  <Card class="w-1/3">
    <TextInputPrepend
      id="name"
      v-model="form.name"
      class="mb-2"
      :label="t('shared.labels.name')"
      :placeholder="t('shared.placeholders.name')"
    >
      <Icon size="sm" name="tag" />
    </TextInputPrepend>

    <TextInputPrepend
      id="attributeCode"
      v-model="form.attributeCode"
      class="mb-2"
      :label="t('shared.labels.remoteCode')"
    >
      <Icon size="sm" name="code" />
    </TextInputPrepend>

    <div class="flex justify-end gap-4 mt-4">
      <Button class="btn btn-outline-dark" @click="handleCancel">
        {{ t('shared.button.cancel') }}
      </Button>
      <Button class="btn btn-primary" :disabled="!form.name || !form.attributeCode" @click="handleSubmit">
        {{ t('shared.button.submit') }}
      </Button>
    </div>
  </Card>
</template>
