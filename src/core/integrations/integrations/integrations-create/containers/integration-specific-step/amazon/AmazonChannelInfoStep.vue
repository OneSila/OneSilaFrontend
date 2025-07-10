<script setup lang="ts">
import { defineProps, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Label } from "../../../../../../../shared/components/atoms/label";
import { Selector } from "../../../../../../../shared/components/atoms/selector";
import { Toggle } from "../../../../../../../shared/components/atoms/toggle";
import { AmazonChannelInfo, AmazonRegions, AmazonCountries } from '../../../../integrations';

const props = defineProps<{
  channelInfo: AmazonChannelInfo
}>();

const { t } = useI18n();

const regionChoices = [
  { id: AmazonRegions.NORTH_AMERICA, text: t('integrations.regions.northAmerica') },
  { id: AmazonRegions.EUROPE, text: t('integrations.regions.europe') },
  { id: AmazonRegions.FAR_EAST, text: t('integrations.regions.farEast') },
];

const countryChoices = computed(() => {
  switch (props.channelInfo.region) {
    case AmazonRegions.NORTH_AMERICA:
      return [
        { id: AmazonCountries.CANADA, text: t('integrations.countries.canada') },
        { id: AmazonCountries.UNITED_STATES, text: t('integrations.countries.unitedStates') },
        { id: AmazonCountries.MEXICO, text: t('integrations.countries.mexico') },
        { id: AmazonCountries.BRAZIL, text: t('integrations.countries.brazil') },
      ];
    case AmazonRegions.EUROPE:
      return [
        { id: AmazonCountries.IRELAND, text: t('integrations.countries.ireland') },
        { id: AmazonCountries.SPAIN, text: t('integrations.countries.spain') },
        { id: AmazonCountries.UNITED_KINGDOM, text: t('integrations.countries.unitedKingdom') },
        { id: AmazonCountries.FRANCE, text: t('integrations.countries.france') },
        { id: AmazonCountries.BELGIUM, text: t('integrations.countries.belgium') },
        { id: AmazonCountries.NETHERLANDS, text: t('integrations.countries.netherlands') },
        { id: AmazonCountries.GERMANY, text: t('integrations.countries.germany') },
        { id: AmazonCountries.ITALY, text: t('integrations.countries.italy') },
        { id: AmazonCountries.SWEDEN, text: t('integrations.countries.sweden') },
        { id: AmazonCountries.SOUTH_AFRICA, text: t('integrations.countries.southAfrica') },
        { id: AmazonCountries.POLAND, text: t('integrations.countries.poland') },
        { id: AmazonCountries.EGYPT, text: t('integrations.countries.egypt') },
        { id: AmazonCountries.TURKEY, text: t('integrations.countries.turkey') },
        { id: AmazonCountries.SAUDI_ARABIA, text: t('integrations.countries.saudiArabia') },
        { id: AmazonCountries.UNITED_ARAB_EMIRATES, text: t('integrations.countries.unitedArabEmirates') },
        { id: AmazonCountries.INDIA, text: t('integrations.countries.india') },
      ];
    case AmazonRegions.FAR_EAST:
      return [
        { id: AmazonCountries.SINGAPORE, text: t('integrations.countries.singapore') },
        { id: AmazonCountries.AUSTRALIA, text: t('integrations.countries.australia') },
        { id: AmazonCountries.JAPAN, text: t('integrations.countries.japan') },
      ];
    default:
      return [];
  }
});

watch(
  () => props.channelInfo.region,
  () => {
    props.channelInfo.country = null;
  }
);
</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">
      {{ t('integrations.create.wizard.step4.amazon.content') }}
    </h1>
    <hr />
    <Flex vertical>
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.region') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <div class="w-96">
                  <Selector
                    class="w-full"
                    v-model="channelInfo.region"
                    :options="regionChoices"
                    value-by="id"
                    label-by="text"
                    :removable="false"
                  />
                </div>
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.country') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <div class="w-96">
                  <Selector
                    class="w-full"
                    v-model="channelInfo.country"
                    :options="countryChoices"
                    value-by="id"
                    label-by="text"
                    :removable="false"
                  />
                </div>
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.listingOwner') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <Toggle v-model="channelInfo.listingOwner" />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.salesChannel.helpText.listingOwner') }}</p>
            </div>
          </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>
  </div>
</template>
