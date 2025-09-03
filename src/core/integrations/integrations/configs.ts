import {FieldType} from "../../../shared/utils/constants";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import {integrationsQuery} from "../../../shared/api/queries/integrations.js";
import {SearchConfig} from "../../../shared/components/organisms/general-search/searchConfig";
import {IntegrationTypes} from "./integrations";
import {deleteIntegrationMutation} from "../../../shared/api/mutations/salesChannels";

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Boolean,
      name: 'active',
      label: t('shared.labels.active'),
      addLookup: true,
      strict: true,
    },
    {
      type: FieldType.Boolean,
      name: 'verifySSL',
      label: t('integrations.labels.verifySSL'),
      addLookup: true,
      strict: true,
    },
  ],
  orders: []
});

export const listingIntegrationTypeBadgeMap = (t: Function) => ({
  [IntegrationTypes.Magento]: { text: t('integrations.integrationTypes.magento'), color: 'red' },
  [IntegrationTypes.Shopify]: { text: t('integrations.integrationTypes.shopify'), color: 'green' },
  [IntegrationTypes.Woocommerce]: { text: t('integrations.integrationTypes.woocommerce'), color: 'blue' },
  [IntegrationTypes.Amazon]: { text: t('integrations.integrationTypes.amazon'), color: 'yellow' },
  [IntegrationTypes.Webhook]: { text: t('integrations.integrationTypes.webhook'), color: 'indigo' }
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('integrations.labels.hostname'),
    t('shared.labels.type'),
    t('shared.labels.active'),
    t('integrations.labels.verifySSL'),
    t('integrations.labels.successfullyConnected'),
    t('integrations.labels.requestsPerMinute'),
  ],
  fields: [
    { name: 'hostname', type: FieldType.Text },
    { name: 'type', type: FieldType.Badge, badgeMap: listingIntegrationTypeBadgeMap(t) },
    { name: 'active', type: FieldType.Boolean },
    { name: 'verifySsl', type: FieldType.Boolean },
    { name: 'connected', type: FieldType.Boolean },
    { name: 'requestsPerMinute', type: FieldType.Text },
  ],
  showUrlName: 'integrations.integrations.show',
  deleteMutation: deleteIntegrationMutation,
  identifierKey: 'proxyId',
  deleteIdentifierKey: 'id',
  secondIdentifierKey: 'type',
  secondIdentifierParam: 'type',
  addActions: true,
  addEdit: false,
  addShow: true,
  addDelete: true,
});

export function cleanShopHostname(input: string): string {
  const url = new URL(input.startsWith('http') ? input : `https://${input}`);
  return url.hostname;
}
export const listingQueryKey = 'integrations';
export const listingQuery = integrationsQuery;