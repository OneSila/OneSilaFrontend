<script lang="ts" setup>

import { ref, defineProps } from "vue";
import { useI18n } from "vue-i18n";
import { Selector } from "../../../../../../shared/components/atoms/selector";
import { Image } from "../../../../../../shared/components/atoms/image";
import { PrimaryButton } from "../../../../../../shared/components/atoms/button-primary";
import apolloClient from "../../../../../../../apollo-client";
import { updateImageMutation } from "../../../../../../shared/api/mutations/media.js";
import { Toast } from "../../../../../../shared/modules/toast";
import {IMAGE_TYPE_MOOD, IMAGE_TYPE_PACK} from "../../../../files/media";

const { t } = useI18n();
const props = defineProps<{ image: { imageWebUrl: string, imageType: string, id: string } }>();
const emit = defineEmits(['show-view']);
const localType = ref(props.image.imageType);

const imageTypeOptions = [
  { label: t('media.images.labels.packShot'), value: IMAGE_TYPE_PACK },
  { label: t('media.images.labels.moodShot'), value: IMAGE_TYPE_MOOD }
];

const saveChanges = async () => {
  const variables = { data: { id: props.image.id, imageType: localType.value } };
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
  }
};

const handleUpdate = (newVal) => {
  localType.value = newVal;
}

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Image :source="image.imageWebUrl" alt="Editable Image Preview" class="w-full max-w-[35rem] rounded-md" />
    </div>
    <div class="mt-1">
      <Flex vertical>
        <FlexCell>
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
              <PrimaryButton @click="saveChanges">{{ t('shared.button.save') }}</PrimaryButton>
            </FlexCell>
          </Flex>
        </FlexCell>
      </Flex>
    </div>
  </div>
</template>

