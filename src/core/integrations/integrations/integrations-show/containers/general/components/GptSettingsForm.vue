<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Label } from "../../../../../../../shared/components/atoms/label";
import { Toggle } from "../../../../../../../shared/components/atoms/toggle";
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { Toast } from "../../../../../../../shared/modules/toast";
import { resyncSalesChannelGptFeedMutation } from "../../../../../../../shared/api/mutations/salesChannels.js";
import { displayApolloError } from "../../../../../../../shared/utils";

interface GptFormData {
  gptEnable: boolean;
  gptEnableCheckout: boolean;
  gptSellerName: string;
  gptSellerUrl: string;
  gptSellerPrivacyPolicy: string;
  gptSellerTos: string;
  gptReturnPolicy: string;
  gptReturnWindow: number | null;
}

interface SalesChannelGptFeed {
  id: string;
  fileUrl?: string | null;
  lastSyncedAt?: string | null;
  file?: {
    url?: string | null;
  } | null;
}

interface Props {
  formData: GptFormData;
  fieldErrors: Record<string, string>;
  hostname: string;
  gptFeed: SalesChannelGptFeed | null;
  initialGptEnable: boolean;
  salesChannelId: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'gpt-feed-updated', value: SalesChannelGptFeed | null): void }>();
const formData = toRef(props, 'formData');
const fieldErrors = toRef(props, 'fieldErrors');
const hostname = toRef(props, 'hostname');
const salesChannelId = toRef(props, 'salesChannelId');
const gptFeed = ref<SalesChannelGptFeed | null>(props.gptFeed ?? null);

const { t } = useI18n();

watch(
  () => props.gptFeed,
  (newFeed) => {
    gptFeed.value = newFeed ?? null;
  },
);

watch(
  () => formData.value.gptEnable,
  (enabled) => {
    if (!enabled) {
      formData.value.gptEnableCheckout = false;
    }
  },
);

const feedUrl = computed(() => gptFeed.value?.fileUrl || gptFeed.value?.file?.url || null);
const resyncId = computed(() => gptFeed.value?.id ?? salesChannelId.value ?? null);
const resyncVariables = computed(() => (resyncId.value ? { id: resyncId.value } : undefined));
const canResync = computed(() => Boolean(resyncId.value));

const copyFeedUrl = async () => {
  if (!feedUrl.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(feedUrl.value);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (error) {
    console.error('Failed to copy GPT feed URL', error);
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

const openDownload = () => {
  if (!feedUrl.value) {
    return;
  }

  window.open(feedUrl.value, '_blank', 'noopener');
};

const handleResyncDone = (response: any) => {
  const updatedFeed = response?.data?.resyncSalesChannelGptFeed ?? null;
  if (updatedFeed) {
    gptFeed.value = updatedFeed;
    emit('gpt-feed-updated', updatedFeed);
  }
  Toast.success(t('integrations.salesChannel.toast.resyncSuccess'));
};

const handleResyncError = (error: unknown) => {
  displayApolloError(error);
};
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-12 items-center">
      <div class="md:col-span-4 col-span-12">
        <Flex gap="2" class="items-center">
          <FlexCell>
            <Label class="font-semibold text-sm text-gray-900">
              {{ t('integrations.labels.gptEnable') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Toggle v-model="formData.gptEnable" />
          </FlexCell>
        </Flex>
        <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptEnable">
          {{ fieldErrors.gptEnable }}
        </p>
      </div>
      <div class="md:col-span-8 col-span-12 text-sm text-gray-400">
        {{ t('integrations.salesChannel.helpText.gptEnable') }}
      </div>
    </div>

    <div v-if="formData.gptEnable" class="space-y-6">
      <div class="grid grid-cols-12 gap-4">
        <div class="md:col-span-6 col-span-12">
          <Label class="font-semibold text-sm text-gray-900 mb-1">
            {{ t('integrations.labels.gptSellerName') }}
          </Label>
          <TextInput v-model="formData.gptSellerName" class="w-full" />
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptSellerName">
            {{ fieldErrors.gptSellerName }}
          </p>
        </div>
        <div class="md:col-span-6 col-span-12">
          <Label class="font-semibold text-sm text-gray-900 mb-1">
            {{ t('integrations.labels.gptSellerUrl') }}
          </Label>
          <TextInput v-model="formData.gptSellerUrl" class="w-full" />
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptSellerUrl">
            {{ fieldErrors.gptSellerUrl }}
          </p>
          <p class="text-sm text-gray-400 mt-1">
            {{ t('integrations.salesChannel.helpText.gptSellerUrl', { hostname }) }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-4">
        <div class="md:col-span-6 col-span-12">
          <Label class="font-semibold text-sm text-gray-900 mb-1">
            {{ t('integrations.labels.gptReturnPolicy') }}
          </Label>
          <TextInput v-model="formData.gptReturnPolicy" class="w-full" />
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptReturnPolicy">
            {{ fieldErrors.gptReturnPolicy }}
          </p>
        </div>
        <div class="md:col-span-6 col-span-12">
          <Label class="font-semibold text-sm text-gray-900 mb-1">
            {{ t('integrations.labels.gptReturnWindow') }}
          </Label>
          <TextInput
            :model-value="formData.gptReturnWindow ?? ''"
            :number="true"
            :min-number="1"
            class="w-full"
            @update:modelValue="(value) => { formData.gptReturnWindow = Number.isNaN(value) ? null : value; }"
          />
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptReturnWindow">
            {{ fieldErrors.gptReturnWindow }}
          </p>
          <p class="text-sm text-gray-400 mt-1">
            {{ t('integrations.salesChannel.helpText.gptReturnWindow') }}
          </p>
        </div>
      </div>

      <hr class="border-gray-200" />
      <div class="grid grid-cols-12 gap-4 items-center">
        <div class="md:col-span-4 col-span-12">
          <Label class="font-semibold text-sm text-gray-900">
            {{ t('integrations.labels.gptFeedUrl') }}
          </Label>
        </div>
        <div class="md:col-span-8 col-span-12 flex flex-wrap items-center gap-3">
          <div class="relative flex-1">
            <TextInput :model-value="feedUrl ?? '-'" disabled class="w-full pr-12" />
            <Button
              class="absolute right-2 top-1/2 -translate-y-1/2 p-2"
              :disabled="!feedUrl"
              @click="copyFeedUrl"
            >
              <Icon name="clipboard" class="h-4 w-4 text-gray-500" aria-hidden="true" />
            </Button>
          </div>
          <Button
            class="flex h-10 w-10 items-center justify-center"
            :disabled="!feedUrl"
            @click="openDownload"
          >
            <Icon name="download" class="h-5 w-5 text-gray-500" aria-hidden="true" />
          </Button>
          <ApolloMutation
            :mutation="resyncSalesChannelGptFeedMutation"
            :variables="resyncVariables"
            @done="handleResyncDone"
            @error="handleResyncError"
          >
            <template #default="{ mutate, loading }">
              <Button
                class="flex h-10 w-10 items-center justify-center"
                :disabled="!canResync || loading"
                @click="mutate()"
              >
                <Icon name="clock-rotate-left" class="h-5 w-5 text-gray-500" aria-hidden="true" />
              </Button>
            </template>
          </ApolloMutation>
        </div>
      </div>

      <div class="pt-4 mt-4 border-t border-gray-200 grid grid-cols-12 items-center">
        <div class="md:col-span-4 col-span-12">
          <Flex gap="2" class="items-center">
            <FlexCell>
              <Label class="font-semibold text-sm text-gray-900">
                {{ t('integrations.labels.gptEnableCheckout') }}
              </Label>
            </FlexCell>
            <FlexCell>
              <Toggle v-model="formData.gptEnableCheckout" />
            </FlexCell>
          </Flex>
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptEnableCheckout">
            {{ fieldErrors.gptEnableCheckout }}
          </p>
        </div>
        <div class="md:col-span-8 col-span-12 text-sm text-gray-400">
          {{ t('integrations.salesChannel.helpText.gptEnableCheckout') }}
        </div>
      </div>

      <div v-if="formData.gptEnableCheckout" class="grid grid-cols-12 gap-4">
        <div class="md:col-span-6 col-span-12">
          <Label class="font-semibold text-sm text-gray-900 mb-1">
            {{ t('integrations.labels.gptSellerPrivacyPolicy') }}
          </Label>
          <TextInput v-model="formData.gptSellerPrivacyPolicy" class="w-full" />
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptSellerPrivacyPolicy">
            {{ fieldErrors.gptSellerPrivacyPolicy }}
          </p>
        </div>
        <div class="md:col-span-6 col-span-12">
          <Label class="font-semibold text-sm text-gray-900 mb-1">
            {{ t('integrations.labels.gptSellerTos') }}
          </Label>
          <TextInput v-model="formData.gptSellerTos" class="w-full" />
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptSellerTos">
            {{ fieldErrors.gptSellerTos }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
