<script lang="ts" setup>

import { ref, defineProps, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Selector } from "../../../../../../shared/components/atoms/selector";
import { Image } from "../../../../../../shared/components/atoms/image";
import { PrimaryButton } from "../../../../../../shared/components/atoms/button-primary";
import { TextInput } from "../../../../../../shared/components/atoms/input-text";
import { TextEditor } from "../../../../../../shared/components/atoms/input-text-editor";
import apolloClient from "../../../../../../../apollo-client";
import { updateImageMutation } from "../../../../../../shared/api/mutations/media.js";
import { Toast } from "../../../../../../shared/modules/toast";
import {IMAGE_TYPE_MOOD, IMAGE_TYPE_PACK} from "../../../../files/media";

const { t } = useI18n();
const props = defineProps<{ image: { imageWebUrl: string, imageType: string, id: string, title?: string | null, description?: string | null } }>();
const emit = defineEmits(['show-view']);
const localType = ref(props.image.imageType);
const localTitle = ref(props.image.title ?? '');
const localDescription = ref(props.image.description ?? '');
const isSaving = ref(false);

const imageTypeOptions = [
  { label: t('media.images.labels.packShot'), value: IMAGE_TYPE_PACK },
  { label: t('media.images.labels.moodShot'), value: IMAGE_TYPE_MOOD }
];

const saveChanges = async () => {
  if (isSaving.value) {
    return;
  }
  isSaving.value = true;
  const variables = { data: { id: props.image.id, imageType: localType.value, title: localTitle.value.trim() || null, description: localDescription.value.trim() || null } };
  try {
    const { data } = await apolloClient.mutate({
      mutation: updateImageMutation,
      variables
    });
    if (data && data.updateImage) {
      Toast.success(t('media.images.show.successfullyUpdated'));
      emit('show-view');
    }
  } catch (err) {
    console.error('Error updating video:', err);
    Toast.error(t('media.images.show.updateFailed'));
  } finally {
    isSaving.value = false;
  }
};

const handleUpdate = (newVal) => {
  localType.value = newVal;
};

watch(() => props.image, (newImage) => {
  localType.value = newImage.imageType;
  localTitle.value = newImage.title ?? '';
  localDescription.value = newImage.description ?? '';
});

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Image :source="image.imageWebUrl" alt="Editable Image Preview" class="w-full max-w-[35rem] rounded-md" />
    </div>
    <div class="mt-1">
      <Flex vertical>
        <FlexCell>
          <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.images.labels.title') }}</label>
          <TextInput
            v-model="localTitle"
            :placeholder="t('media.images.placeholders.title')"
          />
        </FlexCell>
        <FlexCell class="mt-4">
          <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.images.labels.description') }}</label>
          <TextEditor
            class="h-32"
            v-model="localDescription"
            :placeholder="t('media.images.placeholders.description')"
          />
        </FlexCell>
        <FlexCell class="mt-4">
          <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.images.labels.imageType') }}</label>
        </FlexCell>
        <FlexCell>
          <Flex>
            <FlexCell grow center>
              <Selector class="pr-4"
                        :model-value="localType"
                        :options="imageTypeOptions"
                        :mandatory="true"
                        :removable="false"
                        :label-by="'label'"
                        :value-by="'value'"
                        :placeholder="t('media.images.placeholders.imageType')"
                        :dropdown-position="'bottom'"
                        @update:model-value="handleUpdate"
              />
            </FlexCell>
            <FlexCell center>
              <PrimaryButton :disabled="isSaving" @click="saveChanges">{{ t('shared.button.save') }}</PrimaryButton>
            </FlexCell>
          </Flex>
        </FlexCell>
      </Flex>
    </div>
  </div>
</template>

