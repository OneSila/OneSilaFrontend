<script setup lang="ts">
import {ref, watch, computed} from 'vue';
import {useI18n} from 'vue-i18n';
import {GeneralListing} from "../../../../../../shared/components/organisms/general-listing";
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import {
  storesSearchConfigConstructor,
  storesListingConfigConstructor,
  listingQueryConstructor,
  listingQueryKeyConstructor,
} from "./configs"
import { useRoute } from "vue-router";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../shared/components/atoms/link";
import { IntegrationTypes } from "../../../integrations";


const { t } = useI18n();
const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const route = useRoute();

const integrationType = computed(() => String(route.params.type));

const searchConfig = storesSearchConfigConstructor(t);
const listingConfig = storesListingConfigConstructor(t, props.id, integrationType.value);
const listingQuery = computed(() => listingQueryConstructor(integrationType.value));
const listingQueryKey = computed(() => listingQueryKeyConstructor(integrationType.value));
const isManualIntegration = computed(() => integrationType.value === IntegrationTypes.Manual);

</script>

<template>
  <GeneralTemplate>
    <template v-slot:buttons>
      <div class="flex gap-2 flex-wrap justify-end">
        <Link
          v-if="isManualIntegration"
          :path="{ name: 'integrations.stores.create', params: { type: integrationType, integrationId: id }, query: { salesChannelId: salesChannelId } }"
        >
          <Button type="button" class="btn btn-primary">
            {{ t('integrations.show.stores.create.title') }}
          </Button>
        </Link>
        <Button v-else type="button" class="btn btn-primary" @click="$emit('pull-data')">
          {{ t('integrations.labels.pullData') }}
        </Button>
      </div>
    </template>

    <template v-slot:content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{'salesChannel': {'id': {exact: salesChannelId }}}"
      />
    </template>
  </GeneralTemplate>
</template>
