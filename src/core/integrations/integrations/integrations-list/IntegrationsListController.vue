<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { listingConfigConstructor, searchConfigConstructor, listingQueryKey, listingQuery } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { GeneralListing } from "../../../../shared/components/organisms/general-listing";
import { Link } from "../../../../shared/components/atoms/link";
import { Button } from "../../../../shared/components/atoms/button";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";

const { t } = useI18n();
const route = useRoute();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'integrations.integrations.list' }, name: t('integrations.title') }]" />
    </template>
    <template v-slot:buttons>
      <div>
        <Link :path="{ name: 'integrations.integrations.create' }">
          <Button type="button" class="btn btn-primary">
            {{ t('integrations.create.title') }}
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
      />
    </template>
  </GeneralTemplate>
</template>
