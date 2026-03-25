import { FieldType } from "../../../../../../../../shared/utils/constants";
import { miraklPropertiesQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import type { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import type { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";

export const miraklDefaultUnitConfiguratorsSearchConfigConstructor = (): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [],
  orders: [],
});

export const miraklDefaultUnitConfiguratorsListingConfigConstructor = (
  t: Function,
  specificIntegrationId: string,
): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.properties.labels.code'),
    t('integrations.show.mirakl.defaultUnits.labels.selectedUnit'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'code', type: FieldType.Text },
    { name: 'defaultValue', type: FieldType.Text },
  ],
  identifierKey: 'id',
  urlQueryParams: { integrationId: specificIntegrationId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.miraklDefaultUnitConfigurators.edit',
  showUrlName: 'integrations.miraklDefaultUnitConfigurators.edit',
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'miraklProperties';
export const listingQuery = miraklPropertiesQuery;
