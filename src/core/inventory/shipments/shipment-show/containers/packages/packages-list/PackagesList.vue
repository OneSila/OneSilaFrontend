<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { listingConfigConstructor, searchConfigConstructor, listingQuery, listingQueryKey } from "../configs";
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import {GeneralListing} from "../../../../../../../shared/components/organisms/general-listing";
import FileUploader from "../../../../../../../shared/components/organisms/file-uploader/FileUploader.vue";
import {BackendLink} from "../../../../../../../shared/components/atoms/backend-link";
import {CancelButton} from "../../../../../../../shared/components/atoms/button-cancel";
import {PrimaryButton} from "../../../../../../../shared/components/atoms/button-primary";
import {SecondaryButton} from "../../../../../../../shared/components/atoms/button-secondary";
import {Button} from "../../../../../../../shared/components/atoms/button";
import {Link} from "../../../../../../../shared/components/atoms/link";
import {ShipmentStatus} from "../../../../configs";

const props = defineProps<{ shipment: any }>();
console.log(props.shipment)

const { t } = useI18n();
const listingConfig = ref(listingConfigConstructor(t, props.shipment.id));
const searchConfig = searchConfigConstructor();

const apiGraphqlUrl = import.meta.env.VITE_APP_API_GRAPHQL_URL;
const backendBaseUrl = apiGraphqlUrl.replace(/\/graphql\/?$/, '');

function printTrigger() {
  const getMyFrame = document.getElementById('iFramePdf') as HTMLIFrameElement | null;

  if (getMyFrame && getMyFrame.contentWindow) {
    getMyFrame.focus();
    getMyFrame.contentWindow.print();
  }
}



</script>

<template>
  <GeneralTemplate>

    <template v-slot:buttons>

      <Link v-if="shipment.status == ShipmentStatus.TODO" :path="{ name: 'inventory.packages.create', params: {shipmentId: shipment.id} }">
        <PrimaryButton>
            {{  t('inventory.packages.create.title') }}
        </PrimaryButton>
      </Link>

      <BackendLink :path="`/warehouse/shipments/${shipment.id}/pickinglist/filedownload`" target="_blank">
        <SecondaryButton>
            {{ t('inventory.shipments.button.downloadPickingList') }}
          </SecondaryButton>
      </BackendLink>

      <Button class="btn btn-warning" @click="printTrigger">
        {{ t('inventory.shipments.button.printPickingList') }}
      </Button>

    </template>

    <template v-slot:content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{ 'shipment': { 'id': { 'exact': shipment.id } } }"
      />
      <iframe id="iFramePdf" style="display:none;" :src="`${backendBaseUrl}/warehouse/shipments/${props.shipment.id}/pickinglist/filedownload`"></iframe>
    </template>
  </GeneralTemplate>
</template>
