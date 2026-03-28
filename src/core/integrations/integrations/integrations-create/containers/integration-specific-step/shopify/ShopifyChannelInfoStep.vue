<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Label } from "../../../../../../../shared/components/atoms/label";
import { ShopifyChannelInfo } from '../../../../integrations';
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { useRouter} from "vue-router";
import { FieldType, PropertyTypes } from "../../../../../../../shared/utils/constants";
import { propertiesQuerySelector } from "../../../../../../../shared/api/queries/properties";
import { QueryFormField } from "../../../../../../../shared/components/organisms/general-form/formConfig";
import {
  FieldQuery
} from "../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";

defineProps<{
  channelInfo: ShopifyChannelInfo
}>();

const { t } = useI18n();
const router = useRouter();

const openInNewTab = (event) => {
  event.preventDefault();
  event.stopPropagation();
  const url = router.resolve({name: 'properties.properties.create'}).href;
  window.open(url, '_blank');
}

const propertyField = computed(() => ({
    type: FieldType.Query,
    name: 'property',
    label: t('properties.properties.show.title'),
    labelBy: 'name',
    valueBy: 'id',
    query: propertiesQuerySelector,
    queryVariables: { filter: {'type': {'exact': PropertyTypes.SELECT }, 'isProductType': {'exact': false }} },
    dataKey: 'properties',
    isEdge: true,
    multiple: false,
    filterable: true,
    formMapIdentifier: 'id',
}));

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">
      {{ t('integrations.create.wizard.step4.shopify.content') }}
    </h1>
    <hr/>
    <Flex vertical>
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-4">
              <FlexCell>
                <div class="w-96 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                  {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep8') }}
                </div>
              </FlexCell>
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.vendorProperty') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <Flex between>
                  <FlexCell grow>
                    <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
                      <p>{{ t('integrations.salesChannel.helpText.shopifyVendorProperty') }}</p>
                    </div>
                  </FlexCell>
                  <FlexCell center>
                    <Button class="btn-primary px-1.5 py-1 rounded-full" @click="openInNewTab">
                      <Icon name="plus"/>
                    </Button>
                  </FlexCell>
                </Flex>
              </FlexCell>
              <FlexCell>
                <FieldQuery v-model="channelInfo.vendorProperty.id" :field="propertyField as QueryFormField" />
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>
  </div>
</template>
