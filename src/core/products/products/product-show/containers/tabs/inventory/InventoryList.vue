<script setup lang="ts">

import {Product} from "../../../../configs";
import {listingQuery, listingQueryKey, searchConfigConstructor, listingConfigConstructor} from "../../../../../../inventory/inventory/configs";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../shared/components/atoms/link";
import { Card } from "../../../../../../../shared/components/atoms/card";
import { GeneralListing } from "../../../../../../../shared/components/organisms/general-listing";
import {useI18n} from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import { ProductType } from "../../../../../../../shared/utils/constants";
import {Icon} from "../../../../../../../shared/components/atoms/icon";
import {Label} from "../../../../../../../shared/components/atoms/label";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();

</script>

<template>
  <TabContentTemplate>
      ??
  </TabContentTemplate>
</template>
