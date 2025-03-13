<script setup lang="ts">

import { SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { useI18n } from 'vue-i18n';
import { Button } from "../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { listingConfigConstructor, searchConfigConstructor, listingQueryKey, listingQuery } from "../configs";

const props = defineProps<{ id: string }>();

const { t } = useI18n();
const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, props.id);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:buttons>
        <Link :path="{ name: 'contacts.companies.address.create', params: {companyId: id} }">
          <Button class="btn btn-primary">
              {{  t('contacts.companies.address.create.title') }}
          </Button>
        </Link>
    </template>

   <template v-slot:content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{'company': {'id': {'exact': id}}}"
    />
   </template>
  </GeneralTemplate>
</template>