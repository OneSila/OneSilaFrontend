<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { Button } from "../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../shared/components/atoms/link";
import GeneralTemplate  from "../../../../../../shared/templates/GeneralTemplate.vue"
import {GeneralListing} from "../../../../../../shared/components/organisms/general-listing";
import { searchConfigConstructor, listingConfigConstructor, listingQueryKey, listingQuery } from '../../../../people/configs'

const props = defineProps<{ id: string }>();
const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, props.id);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'contacts.people.create', query: {companyId: id} }">
          <Button type="button" class="btn btn-primary">
              {{  t('contacts.people.create.title') }}
          </Button>
        </Link>
      </div>
    </template>


   <template v-slot:content>
     <GeneralListing
         :searchConfig="searchConfig"
         :config="listingConfig"
         :query="listingQuery"
         :query-key="listingQueryKey"
         :fixed-filter-variables="{'company': {'id': {'exact': id}}}"
      />
   </template>
  </GeneralTemplate>
</template>