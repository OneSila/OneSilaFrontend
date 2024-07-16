<script setup lang="ts">

import {Product} from "../../../../configs";
import {useI18n} from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import {defineProps, onMounted, Ref, ref} from "vue";
import { ValueFormField} from "../../../../../../../shared/components/organisms/general-form/formConfig";
import {FieldType} from "../../../../../../../shared/utils/constants";
import {Label} from "../../../../../../../shared/components/atoms/label";
import {FieldValue} from "../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-value";
import {eanCodesQuery} from "../../../../../../../shared/api/queries/eanCodes.js";
import apolloClient from "../../../../../../../../apollo-client";
import {PrimaryButton} from "../../../../../../../shared/components/atoms/button-primary";
import {Toast} from "../../../../../../../shared/modules/toast";
import { createEanCodeMutation, updateEanCodeMutation } from "../../../../../../../shared/api/mutations/eanCodes.js";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
const { t } = useI18n();

const props = defineProps<{ product: Product }>();
const eanCodeText = ref('');
const lastSavedEanCode = ref('');
const errors: Ref<any> = ref([]);

const eanCode = ref({
  id: null
});

const getEanCode = (): ValueFormField => {
    return {
      type: FieldType.Text,
      name: 'eanCode',
      label: t('products.eanCodes.labels.externalEanCode'),
      placeholder: t('products.eanCodes.placeholders.externalEanCode'),
    }
}

const fetchCurrentEanCode = async () => {
  const {data} = await apolloClient.query({
    query: eanCodesQuery,
    variables: {filter: {inheritTo: {id: {exact: props.product.id}}}}
  });

    if (data && data.eanCodes && data.eanCodes.edges.length > 0) {
      eanCode.value.id = data.eanCodes.edges[0].node.id;
      eanCodeText.value = data.eanCodes.edges[0].node.eanCode;
      lastSavedEanCode.value = data.eanCodes.edges[0].node.eanCode;
    }
}

const handleCreate = async () => {
  const inputData = {
    eanCode: eanCodeText.value,
    inheritTo: { id: props.product.id },
    internal: false,
    alreadyUsed: true,
  };

  const {data} = await apolloClient.mutate({
    mutation: createEanCodeMutation,
    variables: { data: inputData }
  });

  if (data) {
    Toast.success(t('products.eanCodes.createdSuccessfully'));
  }
}


const handleEdit = async () => {

  const inputData = {
    id: eanCode.value.id,
    eanCode: eanCodeText.value,
    internal: false,
    alreadyUsed: true,
  };

  const {data } = await apolloClient.mutate({
    mutation: updateEanCodeMutation,
    variables: {data: inputData}
  });

  if (data) {
    Toast.success(t('products.eanCodes.updatedSuccessfully'));
  }

}


const handleSave = async () => {
  errors.value = [];
  lastSavedEanCode.value = eanCodeText.value;

  try {
    if (eanCode.value.id) {
      await handleEdit();
    } else {
      await handleCreate();
    }
  } catch (err) {
      errors.value = processGraphQLErrors(err, t);
  }

}

onMounted(fetchCurrentEanCode)


</script>

<template>
  <TabContentTemplate>

    <template v-slot:content>
      <Flex vertical class="gap-4">
        <FlexCell>
          <Flex class="mt-4 gap-4" vertical>
            <FlexCell>
              <Flex vertical class="gap-2">
                <FlexCell>
                  <Label class="font-semibold block text-sm leading-6 text-gray-900">
                    {{ t('products.eanCodes.labels.externalEanCode') }}
                  </Label>
                </FlexCell>
                <FlexCell>
                  <div v-if="errors && errors['eanCode']" class="text-danger text-small blink-animation ml-1 mb-1">
                    <Icon size="sm" name="exclamation-circle" />
                    <span class="ml-1">{{ errors['eanCode'] }}</span>
                  </div>
                </FlexCell>
                <FlexCell>
                  <FieldValue class="w-96" v-model="eanCodeText" :field="getEanCode()" />
                </FlexCell>
              </Flex>
            </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell>
          <PrimaryButton :disabled="lastSavedEanCode == eanCodeText" @click="handleSave">
            {{ t('shared.button.save') }}
          </PrimaryButton>
        </FlexCell>
      </Flex>
    </template>
  </TabContentTemplate>
</template>
