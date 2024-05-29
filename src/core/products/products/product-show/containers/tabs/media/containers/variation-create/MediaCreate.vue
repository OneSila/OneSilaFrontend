<script setup lang="ts">

import { watch, ref, Ref} from 'vue';
import {Product} from "../../../../../../configs";
import {useI18n} from "vue-i18n";
import {Button} from "../../../../../../../../../shared/components/atoms/button";
import CreateForm from "./CreateForm.vue";
import {PRODUCT_BUNDLE} from "../../../../../../../../../shared/utils/constants";
import {createBundleVariationMutation, createUmbrellaVariationMutation,} from "../../../../../../../../../shared/api/mutations/products.js";
import { processGraphQLErrors } from "../../../../../../../../../shared/utils";
import {Toast} from "../../../../../../../../../shared/modules/toast";

const { t } = useI18n();

const props = defineProps<{ product: Product; mediaIds: string[] }>();
const emit = defineEmits(['mediaAdded']);


const handleAddClick = () => {
  alert('clicked add!')
};

</script>

<template>
  <div>
    <Button class="btn btn-primary" @click="handleAddClick">
      {{ t('shared.button.add') }}
    </Button>
  </div>
</template>
