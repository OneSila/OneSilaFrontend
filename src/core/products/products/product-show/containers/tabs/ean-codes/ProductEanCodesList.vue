<script setup lang="ts">

import {Product} from "../../../../configs";
import {useI18n} from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import {defineProps, onMounted, Ref, ref} from "vue";
import {Label} from "../../../../../../../shared/components/atoms/label";
import {eanCodesQuery} from "../../../../../../../shared/api/queries/eanCodes.js";
import apolloClient from "../../../../../../../../apollo-client";
import {PrimaryButton} from "../../../../../../../shared/components/atoms/button-primary";
import {Selector} from "../../../../../../../shared/components/atoms/selector";
import {Button} from "../../../../../../../shared/components/atoms/button";
import {Link} from "../../../../../../../shared/components/atoms/link";
import {Icon} from "../../../../../../../shared/components/atoms/icon";
import {Toast} from "../../../../../../../shared/modules/toast";
import {DangerButton} from "../../../../../../../shared/components/atoms/button-danger";
import { assignEanCodeMutation, updateEanCodeMutation, releaseEanCodeMutation } from "../../../../../../../shared/api/mutations/eanCodes.js";

const { t } = useI18n();

interface EanCode {
  id: string;
  name: string;
}

const props = defineProps<{ product: Product }>();
const eanCode = ref({
  id: null,
  ean: ''
});

const supplierProductEanCodes: Ref<EanCode[]> = ref([]);
const hasAvailableEanCodes = ref(false);

const setDefaultValues = async () => {
  eanCode.value.id = null;
  eanCode.value.ean = '';
  supplierProductEanCodes.value = [];
  hasAvailableEanCodes.value = false;
}
const fetchCurrentEanCode = async () => {
  const {data} = await apolloClient.query({
    query: eanCodesQuery,
    variables: {filter: {product: {id: {exact: props.product.id}}}},
    fetchPolicy: 'network-only'
  });

    if (data && data.eanCodes && data.eanCodes.edges.length > 0) {
      eanCode.value.id = data.eanCodes.edges[0].node.id;
      eanCode.value.ean = data.eanCodes.edges[0].node.eanCode;
    }
}

const fetchAvailableEanCode = async () => {

  if (eanCode.value.id) {
    return
  }

  const {data} = await apolloClient.query({
    query: eanCodesQuery,
    variables: { filter: { internal: { exact: true }, alreadyUsed: { exact: false } }},
    fetchPolicy: 'network-only'
  });

    if (data && data.eanCodes && data.eanCodes.edges.length > 0) {
      hasAvailableEanCodes.value = true;
    }
}

const fetchNeededData = async () => {
  await setDefaultValues();
  await fetchCurrentEanCode();
  await fetchAvailableEanCode();
}

const copyUrlToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(eanCode.value.ean);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (err) {
    console.error('Failed to copy:', err);
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

onMounted(fetchNeededData)

const handleAssign = async () => {
  const inputData = {
    product: { id: props.product.id },
  };

  const {data} = await apolloClient.mutate({
    mutation: assignEanCodeMutation,
    variables: {data: inputData}
  });

  if (data) {
    Toast.success(t('products.eanCodes.assignSuccessfully'));
  }

  await fetchNeededData();
}

const handleRealease = async () => {
  const inputData = {
    id: eanCode.value.id,
  };

  const {data} = await apolloClient.mutate({
    mutation: releaseEanCodeMutation,
    variables: {data: inputData}
  });

  if (data) {
    Toast.success(t('products.eanCodes.releaseSuccessfully'));
  }

  await fetchNeededData();
}


</script>

<template>
  <TabContentTemplate>

    <template v-slot:content>
      <Flex vertical class="gap-4">
        <FlexCell v-if="eanCode.id">
          <div class="border border-gray-300 p-3 pb-6 rounded-lg">
            <Label class="font-semibold block text-sm leading-6 text-gray-900">
              {{ t('products.eanCodes.labels.currentEanCode') }}
            </Label>
            <Flex class="mt-1">
              <div class="relative mt-2 rounded-lg shadow-sm">
                <input v-model="eanCode.ean" disabled type="text" class="block w-full rounded-lg border-0 py-1.5 pl-2 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span class="text-gray-500 sm:text-sm">
                    <Button @click="copyUrlToClipboard" class="ml-4 flex-shrink-0">
                      <Icon name="clipboard" class="h-5 w-5 text-gray-500" aria-hidden="true" />
                    </Button>
                  </span>
                </div>
              </div>
            </Flex>
          </div>
        </FlexCell>

        <FlexCell v-if="supplierProductEanCodes.length > 0">
          <div class="border border-gray-300 p-3 pb-6 rounded-lg">
            <Flex class="mt-4 gap-4" vertical>
              <FlexCell>
                <Flex vertical class="gap-2">
                  <FlexCell>
                    <Label class="font-semibold block text-sm leading-6 text-gray-900">
                      {{ t('products.eanCodes.labels.eanCode') }}
                    </Label>
                  </FlexCell>
                  <FlexCell>
                    <Flex>
                      <FlexCell center>
                         <Icon class="text-gray-900" size="sm" name="exclamation-circle" />
                      </FlexCell>
                      <FlexCell center>
                        <Label class="ml-2 font-semibold block text-sm leading-6 text-gray-900 mb-0.5">
                            {{ t('products.eanCodes.assign.disclaimer') }}
                        </Label>
                      </FlexCell>
                    </Flex>
                </FlexCell>
                <FlexCell>
                  <Flex class="w-full lg:w-1/2 gap-4">

                  </Flex>
                </FlexCell>
              </Flex>
            </FlexCell>
          </Flex>
          </div>
        </FlexCell>
        <FlexCell v-if="supplierProductEanCodes.length > 0 && hasAvailableEanCodes">
          <Flex class="my-8 text-gray-300">
            <FlexCell center grow>
              <hr class="flex-grow border-t border-gray-500">
            </FlexCell>
            <FlexCell center>
              <span class="mx-2 text-black uppercase">{{ t('shared.labels.or')}}</span>
            </FlexCell>
            <FlexCell center grow>
              <hr class="flex-grow border-t border-gray-500">
            </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell v-if="hasAvailableEanCodes">
          <div class="border border-gray-300 p-3 pb-6 rounded-lg">
             <Flex vertical class="gap-2">
                <FlexCell>
                  <Label class="font-semibold block text-sm leading-6 text-gray-900">
                    {{ t('products.eanCodes.assign.assign') }}
                  </Label>
                </FlexCell>
               <FlexCell>
                 <PrimaryButton @click="handleAssign">
                    {{ t('products.eanCodes.assign.button.assign') }}
                  </PrimaryButton>
               </FlexCell>
             </Flex>
          </div>
        </FlexCell>
        <FlexCell v-if="eanCode.id">
          <div class="border border-gray-300 p-3 pb-6 rounded-lg">
             <Flex vertical class="gap-2">
                <FlexCell>
                  <Label class="font-semibold block text-sm leading-6 text-gray-900">
                    {{ t('products.eanCodes.assign.release') }}
                  </Label>
                </FlexCell>
               <FlexCell>
                 <DangerButton @click="handleRealease">
                    {{ t('products.eanCodes.assign.button.release') }}
                  </DangerButton>
               </FlexCell>
             </Flex>
          </div>
        </FlexCell>
        <FlexCell v-if="supplierProductEanCodes.length == 0 && !hasAvailableEanCodes && eanCode.id == null">
          <div class="border border-gray-300 p-3 pb-6 rounded-lg">
             <Flex vertical class="gap-2">
                <FlexCell>
                  <Label class="font-semibold block text-sm leading-6 text-gray-900">
                    {{ t('products.eanCodes.assign.error') }}
                  </Label>
                </FlexCell>
             </Flex>
          </div>
        </FlexCell>
      </Flex>
    </template>
  </TabContentTemplate>
</template>
