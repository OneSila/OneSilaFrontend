<script setup lang="ts">
import { Image } from "../../atoms/image";
import {AddButton} from "./containers/add-button";
import {ref} from "vue";

interface Image {
  id: string;
  imageWebUrl?: string | null;
}

const props = defineProps<{ modelValue?: Image | null; }>();
const image = ref(props.modelValue);
const emit = defineEmits(['update:model-value']);

const handleImageAdded = (img) => {
  image.value = img;
  emit('update:model-value', image.value);
}

</script>

<template>
  <div>
    <Flex class="gap-2">
      <FlexCell>
        <div v-if="image === null" class="mb-5 w-20 h-20 overflow-hidden rounded-md bg-gray-300 flex justify-center items-center">
        </div>
        <div v-else class="mb-5 w-20 h-20 overflow-hidden">
          <Image class="w-20 h-20 rounded-md overflow-hidden object-cover" :source="image?.imageWebUrl" />
        </div>
      </FlexCell>
      <FlexCell>
        <AddButton :has-image-assigned="image !== null" @imaged-added="handleImageAdded" />
      </FlexCell>
    </Flex>
  </div>
</template>

