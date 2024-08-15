<script setup lang="ts">
import {Ref, ref, watch, watchEffect} from 'vue';
import { Modal } from '../../../../../../shared/components/atoms/modal';
import { Card } from '../../../../../../shared/components/atoms/card';
import { useI18n } from "vue-i18n";
import { Property} from "../../ProductPropertiesConfigurator.vue";
import { OptionSelector } from "../../../../molecules/option-selector";
import {ConfigTypes, PropertyTypes} from "../../../../../utils/constants";
import {Icon} from "../../../../atoms/icon";

const props = defineProps<{ modelValue: boolean; property: Property | null, allowOptional?: boolean }>();
const emit = defineEmits(['update:modelValue', 'property-added']);
const localShowModal = ref(props.modelValue);
const configType = ref('');
const types: Ref<{name: ConfigTypes; disable?: boolean}[]> = ref([]);

const { t } = useI18n();

watch(() => props.modelValue, (newVal) => {
  localShowModal.value = newVal;
});


watchEffect(() => {
    let newTypes: {name: ConfigTypes; disable?: boolean}[] = [
    { name: ConfigTypes.REQUIRED },
    { name: ConfigTypes.OPTIONAL },
  ];

  if (props.property?.type == PropertyTypes.SELECT) {
    newTypes.push({ name: ConfigTypes.REQUIRED_IN_CONFIGURATOR })
    newTypes.push({ name: ConfigTypes.OPTIONAL_IN_CONFIGURATOR, disable: !props.allowOptional })
  }

  types.value = newTypes;

});


watch(() => configType.value, (newVal) => {
  if (newVal !== '') {
    submitImages(newVal);
  }
});

const closeModal = () => {
  localShowModal.value = false;
  emit('update:modelValue', false);
};

const submitImages = async (type) => {
    emit('property-added', type);
    configType.value = ''
    closeModal();
};

</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal">
      <Card class="modal-content w-2/3">
        <div>
          <h1 class="text-2xl text-center my-4">{{ t('properties.rule.configTypes.title') }}</h1>
          <hr>
          <OptionSelector v-model="configType" :choices="types" :row="true" >

            <template v-if="property?.type == PropertyTypes.SELECT" #REQUIRED_IN_CONFIGURATOR>
              <div>
                <h3 class="text-lg font-bold">{{ t('properties.rule.configTypes.requiredInConfigurator.title') }}</h3>
                <p>{{ t('properties.rule.configTypes.requiredInConfigurator.example') }}</p>
              </div>
            </template>

            <template v-if="property?.type == PropertyTypes.SELECT" #OPTIONAL_IN_CONFIGURATOR>
              <div>
                <h3 class="text-lg font-bold">{{ t('properties.rule.configTypes.optionalInConfigurator.title') }}</h3>
                <p>{{ t('properties.rule.configTypes.optionalInConfigurator.example') }}</p>
                <div v-if="!allowOptional" class="text-danger text-small blink-animation mt-1">
                  <Icon size="sm" name="exclamation-circle" />
                  <span class="ml-1">{{ t('properties.rule.error.noRequiredInConfigurator')  }}</span>
                </div>
              </div>
            </template>

            <template #REQUIRED>
              <div>
                <h3 class="text-lg font-bold">{{ t('properties.rule.configTypes.required.title') }}</h3>
                <p>{{ t('properties.rule.configTypes.required.example') }}</p>
              </div>
            </template>

            <template #OPTIONAL>
              <div>
                <h3 class="text-lg font-bold">{{ t('properties.rule.configTypes.optional.title') }}</h3>
                <p>{{ t('properties.rule.configTypes.optional.example') }}</p>
              </div>
            </template>
          </OptionSelector>
          <p class="mt-3 text-sm leading-6 text-gray-400">{{ t('properties.rule.configTypes.helpText') }}</p>
        </div>
      </Card>
    </Modal>
  </div>
</template>