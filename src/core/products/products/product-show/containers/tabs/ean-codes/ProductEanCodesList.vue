<script setup lang="ts">

import {Product} from "../../../../configs";
import {listingQuery, listingQueryKey, searchConfigConstructor, listingConfigConstructor} from "../../../../../ean-codes/configs";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../../shared/components/organisms/general-listing";
import {useI18n} from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import {defineProps, onMounted, ref} from "vue";
import {CreateOnTheFly, FormConfig, FormType, QueryFormField} from "../../../../../../../shared/components/organisms/general-form/formConfig";
import {FieldType} from "../../../../../../../shared/utils/constants";
import {Label} from "../../../../../../../shared/components/atoms/label";
import {FieldQuery} from "../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import {eanCodesQuery} from "../../../../../../../shared/api/queries/eanCodes.js";
import apolloClient from "../../../../../../../../apollo-client";
import {baseFormConfigConstructor} from "../../../../../../settings/currencies/configs";
import {createEanCodeMutation, deleteEanCodeMutation} from "../../../../../../../shared/api/mutations/eanCodes.js";
import {PrimaryButton} from "../../../../../../../shared/components/atoms/button-primary";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();
const eanCode = ref({
  id: null
});
const initialId = ref(null);

const eanOnTheFlyConfig = ():CreateOnTheFly => ({
  config: {
  cols: 1,
  type: FormType.CREATE,
  mutation: createEanCodeMutation,
  mutationKey: 'createEanCode',
  submitUrl: { name: 'products.products.show', params: {id: props.product.id}, query: {tab: 'eanCodes'} },
  deleteMutation: deleteEanCodeMutation,
  fields: [
    {
      type: FieldType.Text,
      name: 'eanCode',
      label: t('products.eanCodes.labels.eanCode'),
      placeholder: t('products.eanCodes.placeholders.eanCode'),
    },
    ],
  }
})
const getEanCode = (): QueryFormField => {
    return {
      type: FieldType.Query,
      name: 'eanCode',
      label: t('products.eanCodes.labels.eanCode'),
      labelBy: 'eanCode',
      valueBy: 'id',
      query: eanCodesQuery,
      queryVariables: { filter: {
            product: { id: null },
            OR: { product: { id: {exact: props.product.id}} }
      }},
      dataKey: 'eanCodes',
      isEdge: true,
      multiple: false,
      filterable: true,
      optional: true,
      formMapIdentifier: 'id',
      createOnFlyConfig: eanOnTheFlyConfig(),
    }
}

const fetchCurrentEanCode = async () => {
  const {data} = await apolloClient.query({
    query: eanCodesQuery,
    variables: {filter: {product: {id: {exact: props.product.id}}}}
  });

    if (data && data.eanCodes && data.eanCodes.edges.length > 0) {
      eanCode.value.id = data.eanCodes.edges[0].node.id;
      initialId.value = eanCode.value.id;
    }
}

const handleSave = () => {
  alert('saved')
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
                    {{ t('products.eanCodes.labels.eanCode') }}
                  </Label>
                </FlexCell>
                <FlexCell>
                  <FieldQuery class="w-96" v-model="eanCode.id" :field="getEanCode()" />
                </FlexCell>
              </Flex>
            </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell>
          <PrimaryButton @click="handleSave">
            {{ t('shared.button.save') }}
          </PrimaryButton>
        </FlexCell>
      </Flex>
    </template>
  </TabContentTemplate>
</template>
