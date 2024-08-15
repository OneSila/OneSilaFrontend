import { CreateOnTheFly, FormConfig, FormField, FormType } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType, PropertyTypes } from '../../../shared/utils/constants';
import { SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { productPropertiesRulesQuery } from "../../../shared/api/queries/properties.js";
import {deleteProductPropertiesRuleMutation, deletePropertyMutation, updatePropertyMutation} from "../../../shared/api/mutations/properties.js";
import { ShowConfig } from "../../../shared/components/organisms/general-show/showConfig";
import { getProductPropertiesRuleSubscription } from '../../../shared/api/subscriptions/properties.js';

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
    filters: [
    ],
  orders: []
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [t('properties.properties.labels.isProductType')],
  fields: [
    { name: 'productType', type: FieldType.NestedText, keys: ['value'] }
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'properties.rule.edit',
  showUrlName: 'properties.rule.show',
  addShow: true,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteProductPropertiesRuleMutation,
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
  cols: 1,
  subscription: getProductPropertiesRuleSubscription,
  subscriptionKey: 'productPropertiesRule',
  subscriptionVariables: { pk: id },
  backUrl: { name: 'properties.rule.list' },
  editUrl: { name: 'properties.rule.edit', params: { id: id } },
  deleteMutation: deletePropertyMutation,
  deleteVariables: { id: id },
  addBack: true,
  addEdit: true,
  addDelete: true,
  fields: [
    {
      label: t('properties.properties.labels.isProductType'),
      name: 'productType',
      type: FieldType.NestedText,
      keys: ['value']
    },
    {
      type: FieldType.Array,
      name: 'items',
      label: t('properties.title'),
      clickable: true,
      clickUrl: {name: 'properties.properties.show'},
      clickIdentifiers: [{id: ['property', 'id']}],
      keys: ['property', 'name'],
      showLabel: true
    }
  ]
});

export const listingQueryKey = 'productPropertiesRules';
export const listingQuery = productPropertiesRulesQuery;

export interface RuleItem {
   rule: {id: string},
   property: {id: string},
   type?: string | null;
   sortOrder: number
}