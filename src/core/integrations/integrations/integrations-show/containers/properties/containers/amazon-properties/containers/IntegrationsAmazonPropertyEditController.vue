<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import { amazonPropertyEditFormConfigConstructor } from "../configs";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { amazonPropertiesQuery } from "../../../../../../../../../shared/api/queries/salesChannels";
import { FormConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const amazonPropertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard == '1';
const propertyId = route.query.propertyId?.toString() || null;
const formConfig = ref<FormConfig | null>(null);
const formData = ref<Record<string, any>>({});
const nextWizardId = ref<string | null>(null);

const fetchNextUnmapped = async (): Promise<string | null> => {
  const { data } = await apolloClient.query({
    query: amazonPropertiesQuery,
    variables: {
      first: 1,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: false,
        NOT: {
          id: { exact: amazonPropertyId.value },
        },
      },
    },
    fetchPolicy: 'network-only',
  });

  const edges = data?.amazonProperties?.edges || [];
  return edges.length > 0 ? edges[0].node.id : null;
};

onMounted(async () => {
  formConfig.value = amazonPropertyEditFormConfigConstructor(t, type.value, amazonPropertyId.value, integrationId, propertyId);

  if (!isWizard) return;

  const nextId = await fetchNextUnmapped();
  nextWizardId.value = nextId;

  if (!nextId) {
    Toast.success(t('integrations.show.mapping.allMappedSuccess'));
    router.push({
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: 'properties' }
    });
  } else {
    formConfig.value.addSubmitAndContinue = false;
    formConfig.value.submitUrl = {
      name: 'integrations.amazonProperties.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1' },
    };
    console.log(amazonPropertyId.value)
    console.log(nextId)
    console.log(formConfig.value.submitUrl)
    formConfig.value.submitLabel = t('integrations.show.mapping.saveAndMapNext');
  }
});

const handleFormUpdate = (form) => {
  formData.value = form;
};

</script>


<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'properties'} }, name: t('integrations.show.amazon.title') }
        ]" />
    </template>
    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'properties.properties.create', query: { amazonRuleId: `${amazonPropertyId}__${integrationId}__${salesChannelId}`, name: formData.name, type: formData.type, amazonWizard: isWizard ? '1' : '0', } }">
            <Button type="button" class="btn btn-primary">
                {{  t('properties.properties.create.title') }}
            </Button>
          </Link>
      </div>
    </template>
    <template v-slot:content>
      <GeneralForm v-if="formConfig" :config="formConfig" @form-updated="handleFormUpdate" />
    </template>
  </GeneralTemplate>
</template>
