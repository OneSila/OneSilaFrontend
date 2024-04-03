<script setup lang="ts">
import { useI18n} from 'vue-i18n';
import { useRoute, useRouter} from "vue-router";
import { ref} from "vue";
import { GeneralShow } from "../../../../shared/components/organisms/general-show";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import { showConfigConstructor } from '../configs'
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(String(route.params.id));

const showConfig = showConfigConstructor(t, id.value, route.query.productId ? route.query.productId.toString() : null);

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'products.hsCodes.list' }, name: t('products.hsCodes.title') },
                   { path: { name: 'products.hsCodes.edit' }, name: t('products.hsCodes.show.title') }]" />
    </template>

   <template v-slot:content>
      <Card>
        <GeneralShow :config="showConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>