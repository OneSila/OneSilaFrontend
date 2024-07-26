<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import {defineProps, ref} from 'vue';
import {Property} from "../../ProductPropertiesConfigurator.vue";
import {Icon} from "../../../../atoms/icon";
import {ConfigTpes} from "../../../../../utils/constants";


const { t } = useI18n();


const props = defineProps<{
  productType: { id: string, value: string } | null,
  addedProperties: Property[]
}>();
const emit = defineEmits(['imaged-added']);

</script>

<template>
  <div v-if="productType !== null && addedProperties.length > 0">
    <div class="my-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <div>
    <p class="text-md mb-2">{{ t('properties.rule.preview.productText', {name: productType.value}) }}:</p>
    <ul class="list-disc ml-6">
      <li class="mt-2" v-for="item in addedProperties" :key="item.id">
        <span v-if="item.configType === 'REQUIRED_IN_CONFIGURATOR'">{{ t('properties.rule.preview.requiredInConfiguratorText', { name: item.name }) }}</span>
        <span v-else-if="item.configType === 'OPTIONAL_IN_CONFIGURATOR'">{{ t('properties.rule.preview.optionalInConfiguratorText', { name: item.name }) }}</span>
        <span v-else-if="item.configType === 'REQUIRED'">{{ t('properties.rule.preview.requiredText', { name: item.name }) }}</span>
        <span v-else>{{ t('properties.rule.preview.optionalText', { name: item.name }) }}</span>
      </li>
    </ul>
      <div class="text-danger text-small blink-animation mt-2">
        <Icon size="sm" name="exclamation-circle" />
        <span class="ml-1">{{ t('properties.rule.preview.productTextDisclaimer')  }}</span>
      </div>
    </div>
    <div class="bg-white">
      <div class="pb-16 sm:pb-24">
        <div class="mx-auto max-w-2xl sm:px-6 lg:max-w-7xl lg:px-8">
          <div class="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
            <div class="lg:col-span-5">
              <div class="flex justify-between">
                <h1 class="text-xl font-medium text-gray-900">{{ productType.value }}</h1>
                <p class="text-xl font-medium text-gray-900">$99</p>
              </div>
            </div>

            <div class="mt-8 lg:col-span-5 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0">
              <div class="grid grid-cols-1 ">
                <div  class="mb-5 w-full h-60 overflow-hidden rounded-md bg-gray-300 flex justify-center items-center">
                </div>
              </div>
            </div>

            <div class="mt-8 lg:col-span-7">
              <form>

                <div class="mt-4">
                  <div v-for="property in addedProperties">
                    <fieldset v-if="property.configType == ConfigTpes.REQUIRED_IN_CONFIGURATOR" class="mt-2">
                      <label>{{ property.name }}</label>
                      <div class="grid grid-cols-3 gap-3 sm:grid-cols-6">

                        <label class="flex cursor-pointer items-center justify-center rounded-md border px-3 py-3 text-sm font-medium uppercase focus:outline-none sm:flex-1">
                          <input type="radio" name="size-choice" value="XXS" class="sr-only">
                          <span>1</span>
                        </label>

                        <label class="flex cursor-pointer items-center justify-center rounded-md border px-3 py-3 text-sm font-medium uppercase focus:outline-none sm:flex-1">
                          <input type="radio" name="size-choice" value="XS" class="sr-only">
                          <span>2</span>
                        </label>

                        <label class="flex cursor-pointer items-center justify-center rounded-md border px-3 py-3 text-sm font-medium uppercase focus:outline-none sm:flex-1">
                          <input type="radio" name="size-choice" value="S" class="sr-only">
                          <span>3</span>
                        </label>

                        <label class="flex cursor-not-allowed items-center justify-center rounded-md border px-3 py-3 text-sm font-medium uppercase opacity-25 sm:flex-1">
                          <input type="radio" name="size-choice" value="XL" disabled class="sr-only">
                          <span>4</span>
                        </label>
                      </div>
                  </fieldset>
                    <fieldset v-if="property.configType == ConfigTpes.OPTIONAL_IN_CONFIGURATOR" class="mt-2 opacity-50">
                      <label>{{ property.name }}</label>
                      <div class="grid grid-cols-3 gap-3 sm:grid-cols-6">

                        <label class="flex cursor-pointer items-center justify-center rounded-md border px-3 py-3 text-sm font-medium uppercase focus:outline-none sm:flex-1">
                          <input type="radio" name="size-choice" value="XXS" class="sr-only">
                          <span>1</span>
                        </label>

                        <label class="flex cursor-pointer items-center justify-center rounded-md border px-3 py-3 text-sm font-medium uppercase focus:outline-none sm:flex-1">
                          <input type="radio" name="size-choice" value="XS" class="sr-only">
                          <span>2</span>
                        </label>
                      </div>
                      <div class="text-danger text-small blink-animation mt-1">
                        <Icon size="sm" name="exclamation-circle" />
                        <span class="ml-1">{{ t('properties.rule.preview.productView.optionalInConfiguratorTextMoreValues')  }}</span>
                      </div>
                  </fieldset>
                  </div>
                </div>

                <button type="submit" class="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">{{ t('properties.rule.preview.productView.addToCart') }}</button>
              </form>

              <div class="mt-8 border-t border-gray-200 pt-8">
                <h2 class="text-sm font-medium text-gray-900">{{ t('properties.title') }}</h2>

                <div class="prose prose-sm mt-4 text-gray-500">
                <table class="table-striped table-hover">
                    <thead>
                    </thead>
                    <tbody>
                      <template v-for="property in addedProperties">
                        <template v-if="property.configType !== ConfigTpes.REQUIRED_IN_CONFIGURATOR">
                          <tr v-if="property.configType == ConfigTpes.REQUIRED">
                            <th class="font-semibold">
                              {{ property.name }}
                            </th>
                            <td>{{ t('properties.rule.preview.productView.givenValue') }}</td>
                          </tr>
                          <tr v-if="property.configType == ConfigTpes.OPTIONAL">
                            <th class="font-semibold">
                              {{ property.name }}
                            </th>
                            <td>
                              <Flex vertical>
                                <FlexCell>
                                  <span>{{ t('properties.rule.preview.productView.givenValue') }}</span>
                                </FlexCell>
                                <FlexCell>
                                <div class="text-danger text-small blink-animation mt-1">
                                  <Icon size="sm" name="exclamation-circle" />
                                  <span class="ml-1">{{ t('properties.rule.preview.productView.optional')  }}</span>
                                </div>
                                  </FlexCell>
                                </Flex>
                            </td>
                          </tr>
                          <tr v-if="property.configType == ConfigTpes.OPTIONAL_IN_CONFIGURATOR">
                            <th class="font-semibold">
                              {{ property.name }}
                            </th>
                            <td>
                              <Flex vertical>
                                <FlexCell>
                                  <span>{{ t('properties.rule.preview.productView.givenValue') }}</span>
                                </FlexCell>
                                <FlexCell>
                                  <div class="text-danger text-small blink-animation mt-1">
                                    <Icon size="sm" name="exclamation-circle" />
                                    <span class="ml-1">{{ t('properties.rule.preview.productView.optionalInConfiguratorTextOneValue')  }}</span>
                                  </div>
                                </FlexCell>
                              </Flex>
                            </td>
                          </tr>
                        </template>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
  </div>
</div>
  </div>
  </div>
</template>