<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute, useRouter} from "vue-router";
import {computed, reactive, ref} from "vue";
import { PropertyTypes } from "../../../../shared/utils/constants";
import {Loader} from "../../../../shared/components/atoms/loader";
import {Wizard} from "../../../../shared/components/molecules/wizard";
import {Label} from "../../../../shared/components/atoms/label";
import {TextInput} from "../../../../shared/components/atoms/input-text";
import {Accordion} from "../../../../shared/components/atoms/accordion";
import {Checkbox} from "../../../../shared/components/atoms/checkbox";
import {OptionSelector} from "../../../../shared/components/molecules/option-selector";
import {Selector} from "../../../../shared/components/atoms/selector";
import {TextEditor} from "../../../../shared/components/atoms/input-text-editor";
import {DateInput} from "../../../../shared/components/atoms/input-date";
import DateTimeInput from "../../../../shared/components/atoms/input-date-time/DateTimeInput.vue";
import apolloClient from "../../../../../apollo-client";
import {Toast} from "../../../../shared/modules/toast";
import { createPropertyMutation } from "../../../../shared/api/mutations/properties.js";
import {processGraphQLErrors} from "../../../../shared/utils";

const router = useRouter();
const { t } = useI18n();
const route = useRoute();
const wizardRef = ref();
const step = ref(0);
const loading = ref(false);

interface PropertyForm {
  name: string,
  type: string,
  isPublicInformation: boolean,
  addToFilters: boolean,

}

const preview = reactive({
  int: 22,
  float: 99.99,
  text: '',
  description: '',
  boolean: true,
  date: null,
  datetime: null,
  select: 1,
  multiselect: [1,2],
});

const form: PropertyForm = reactive({
  name: '',
  type: '',
  isPublicInformation: true,
  addToFilters: false,
});

const wizardSteps = computed(() => {
  return [
    {title: t('properties.properties.create.wizard.stepOne.title'), name: 'generalStep'},
    {title: t('properties.properties.create.wizard.stepTwo.title'), name: 'typeStep'},
  ];
});

const typeChoices = [
  { name: PropertyTypes.SELECT },
  { name: PropertyTypes.MULTISELECT },
  { name: PropertyTypes.INT },
  { name: PropertyTypes.FLOAT },
  { name: PropertyTypes.TEXT },
  { name: PropertyTypes.DESCRIPTION },
  { name: PropertyTypes.BOOLEAN },
  { name: PropertyTypes.DATE },
  { name: PropertyTypes.DATETIME },
]

const accordionItems = [
  { name: 'settings', label: t('settings.title'), icon: 'cog' }
];

const updateStep = (val) => {
  step.value = val;
}

const allowNextStep = computed(() => {
  if (step.value === 0 && form.name === '') {
    return false;
  }

  if (step.value === 1 && form.type === '') {
    return false;
  }

  return true;
});

const onDuplicate = () => {
 wizardRef.value.goToStep(0);
 Toast.error(t('properties.properties.error.duplicate'));
}

const onTooLong = () => {
 wizardRef.value.goToStep(0);
 Toast.error(t('shared.alert.toast.tooLongError', { fieldName: t('shared.labels.name').toLowerCase(), max: 255 }));
}

const onError = (error) => {
  const validationErrors = processGraphQLErrors(error, t);
  for (const key in validationErrors) {
    if (validationErrors.hasOwnProperty(key)) {
      const errorMessage = validationErrors[key];
      if (errorMessage.includes('duplicate')) {
        onDuplicate();
        break;
      }
      if (errorMessage.includes('255')) {
        onTooLong();
        break;
      }
    }
  }
};

const handleFinish = async () => {
  try{
    const { data } = await apolloClient.mutate({
      mutation: createPropertyMutation,
      variables: {data: form}
    });

    if (data && data.createProperty) {
      Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
      router.push({name: 'properties.properties.edit', params: { id: data.createProperty.id}, query: {tab: 'translations'}})
    }
  } catch (err) {
    const graphqlError = err as { graphQLErrors: Array<{ message: string }> };
    onError(graphqlError)
  }
}


const selectorPreviewExamples = [
  { id: 1, name: "S" },
  { id: 2, name: "M" },
  { id: 3, name: "L" },
  { id: 4, name: "XL" },
]

const multiSelectorPreviewExamples = [
  { id: 1, name: t('properties.properties.create.wizard.stepTwo.example.preview.multiselect.cotton') },
  { id: 2, name: t('properties.properties.create.wizard.stepTwo.example.preview.multiselect.wool') },
  { id: 3, name: t('properties.properties.create.wizard.stepTwo.example.preview.multiselect.silk') }
];

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'properties.properties.list' }, name: t('properties.title') },
                   { path: { name: 'properties.properties.create' }, name: t('properties.properties.create.title') }]" />
    </template>

   <template v-slot:content>
     <Loader :loading="loading" />
      <Wizard ref="wizardRef" :steps="wizardSteps" :allow-next-step="allowNextStep" :show-buttons="true" @on-finish="handleFinish" @update-current-step="updateStep">

        <template #generalStep>
          <div>
            <h1 class="text-2xl text-center mb-2">{{ t('properties.properties.create.wizard.stepOne.content') }}</h1>
            <hr>
            <Flex vertical>
              <FlexCell>
                <Flex class="mt-4 gap-4">
                  <FlexCell >
                    <Flex vertical class="gap-2">
                      <FlexCell>
                        <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.name') }}*</label>
                      </FlexCell>
                      <FlexCell>
                        <TextInput class="w-96" v-model="form.name" :placeholder="t('properties.properties.placeholders.size') " />
                      </FlexCell>
                    </Flex>
                  </FlexCell>
                </Flex>
              </FlexCell>
              <FlexCell>
                <Accordion class="mt-8" :items="accordionItems">
                    <template #settings>
                      <Flex vertical class="gap-4">
                        <FlexCell>
                          <div class="col-span-full">
                            <Flex>
                              <FlexCell center>
                                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('properties.properties.labels.isPublicInformation') }}</label>
                              </FlexCell>
                              <FlexCell class="ml-2" center>
                                <div class="field-checkbox">
                                  <Checkbox v-model="form.isPublicInformation" />
                                </div>
                              </FlexCell>
                            </Flex>
                            <p class="mt-1 text-sm leading-6 text-gray-400">{{ t('properties.properties.help.isPublicInformation') }}</p>
                          </div>
                        </FlexCell>
                        <FlexCell>
                          <div class="col-span-full">
                            <Flex>
                              <FlexCell center>
                                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('properties.properties.labels.addToFilters') }}</label>
                              </FlexCell>
                              <FlexCell class="ml-2" center>
                                <div class="field-checkbox">
                                  <Checkbox v-model="form.addToFilters" />
                                </div>
                              </FlexCell>
                            </Flex>
                            <p class="mt-1 text-sm leading-6 text-gray-400">{{ t('properties.properties.help.addToFilters') }}</p>
                          </div>
                        </FlexCell>
                      </Flex>
                    </template>
                  </Accordion>
              </FlexCell>

            </Flex>
          </div>
        </template>

        <template #typeStep>
          <div>
            <h1 class="text-2xl text-center mb-2">{{ t('properties.properties.create.wizard.stepTwo.content') }}</h1>
            <p class="text-center mt-1 text-sm leading-6 text-gray-400">{{ t('properties.properties.help.type') }}</p>
           <hr>
            <div v-if="form.type !== ''" class="my-4 w-1/2">
              <Label semi-bold>{{ t('shared.labels.preview') }}:</Label>
              <div class="mt-2">
                <div v-if="form.type == PropertyTypes.SELECT">
                  <Selector v-model="preview.select" :options="selectorPreviewExamples" value-by="id" label-by="name" removable />
                </div>
                <div v-if="form.type == PropertyTypes.MULTISELECT">
                  <Selector v-model="preview.multiselect" :options="multiSelectorPreviewExamples" value-by="id" label-by="name" removable multiple />
                </div>
                <div v-if="form.type == PropertyTypes.INT">
                  <TextInput class="w-full" v-model="preview.int" number />
                </div>
                <div v-if="form.type == PropertyTypes.FLOAT">
                  <TextInput class="w-full" v-model="preview.float" float />
                </div>
                <div v-if="form.type == PropertyTypes.TEXT">
                  <TextInput class="w-full" v-model="preview.text" />
                </div>
                <div v-if="form.type == PropertyTypes.DESCRIPTION">
                  <TextEditor v-model="preview.description" class="h-32"/>
                </div>
                <div v-if="form.type == PropertyTypes.BOOLEAN">
                  <Checkbox v-model="preview.boolean" />
                </div>
                <div v-if="form.type == PropertyTypes.DATE">
                  <DateInput v-model="preview.date" />
                </div>
                <div v-if="form.type == PropertyTypes.DATETIME">
                  <DateTimeInput v-model="preview.datetime" />
                </div>
              </div>
            </div>
            <hr>
            <OptionSelector v-model="form.type" :choices="typeChoices" >

              <template #SELECT>
                <div>
                  <h3 class="text-lg font-bold">{{ t('properties.properties.types.select') }}</h3>
                  <p>{{ t('properties.properties.create.wizard.stepTwo.example.select') }}</p>
                </div>
              </template>

              <template #MULTISELECT>
                <div>
                  <h3 class="text-lg font-bold">{{  t('properties.properties.types.multiselect') }}</h3>
                  <p>{{ t('properties.properties.create.wizard.stepTwo.example.multiselect') }}</p>
                </div>
              </template>

              <template #INT>
                <div>
                  <h3 class="text-lg font-bold">{{  t('properties.properties.types.int') }}</h3>
                  <p>{{ t('properties.properties.create.wizard.stepTwo.example.int') }}</p>
                </div>
              </template>

              <template #FLOAT>
                <div>
                  <h3 class="text-lg font-bold">{{  t('properties.properties.types.float') }}</h3>
                  <p>{{ t('properties.properties.create.wizard.stepTwo.example.float') }}</p>
                </div>
              </template>

              <template #TEXT>
                <div>
                  <h3 class="text-lg font-bold">{{  t('properties.properties.types.text') }}</h3>
                  <p>{{ t('properties.properties.create.wizard.stepTwo.example.text') }}</p>
                </div>
              </template>

              <template #DESCRIPTION>
                <div>
                  <h3 class="text-lg font-bold">{{  t('properties.properties.types.description') }}</h3>
                  <p>{{ t('properties.properties.create.wizard.stepTwo.example.description') }}</p>
                </div>
              </template>

              <template #BOOLEAN>
                <div>
                  <h3 class="text-lg font-bold">{{  t('properties.properties.types.boolean') }}</h3>
                  <p>{{ t('properties.properties.create.wizard.stepTwo.example.boolean') }}</p>
                </div>
              </template>

              <template #DATE>
                <div>
                  <h3 class="text-lg font-bold">{{  t('properties.properties.types.date') }}</h3>
                  <p>{{ t('properties.properties.create.wizard.stepTwo.example.date') }}</p>
                </div>
              </template>

              <template #DATETIME>
                <div>
                  <h3 class="text-lg font-bold">{{  t('properties.properties.types.datetime') }}</h3>
                  <p>{{ t('properties.properties.create.wizard.stepTwo.example.datetime') }}</p>
                </div>
              </template>

            </OptionSelector>
          </div>
        </template>
      </Wizard>
   </template>
  </GeneralTemplate>
</template>