<script lang="ts" setup>

import { ShowConfig } from '../../showConfig';
import { ApolloAlertMutation } from "../../../../molecules/apollo-alert-mutation";
import { Link } from "../../../../atoms/link";
import { Button } from "../../../../atoms/button";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();

const props = defineProps<{ config: ShowConfig;}>();

const handleDelete = (response) => {

  if (props.config.deleteUrl) {
      router.push(props.config.deleteUrl);
  }
}

</script>

<template>
  <Flex v-if="config.addEdit || config.addDelete || config.addBack">
    <FlexCell class="mr-2">
      <Link v-if="config.addEdit" :path="config.editUrl">
        <Button custom-class="btn btn-primary">
          {{ t('shared.button.edit') }}
        </Button>
      </Link>
    </FlexCell>
    <FlexCell class="mr-2">
      <ApolloAlertMutation v-if="config.addDelete && config.deleteMutation" :mutation="config.deleteMutation" :mutation-variables="config.deleteVariables" @done="handleDelete">
        <template v-slot="{ loading, confirmAndMutate }">
          <Button :disabled="loading" custom-class="btn btn-danger" @click="confirmAndMutate">{{ t('shared.button.delete') }}</Button>
        </template>
      </ApolloAlertMutation>
    </FlexCell>
    <FlexCell>
      <Link v-if="config.addBack" :path="config.backUrl">
        <Button class="btn btn-dark">
          {{ t('shared.button.back') }}
        </Button>
      </Link>
    </FlexCell>
  </Flex>
</template>
