import {FormConfig, FormField, FormType} from '../../../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../../../shared/utils/constants'
import { SearchConfig } from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { deleteSalesPriceListItemMutation} from "../../../../../../shared/api/mutations/salesPrices.js";
import { salesPriceListItemsQuery } from "../../../../../../shared/api/queries/salesPrices.js";
import { productsQuerySelector } from "../../../../../../shared/api/queries/products.js";

export const baseFormConfigConstructor = (
  t: Function,
  type: FormType,
  mutation: any,
  mutationKey: string,
  salesPriceListId: string,
  productsId: string[] = [],
  autoUpdatePrice: boolean = false,
  currency: string | undefined = undefined
): FormConfig => {
  let fields: FormField[] = [
    {
      type: FieldType.Hidden,
      name: 'salespricelist',
      value: { "id": salesPriceListId }
    },
    {
      type: FieldType.Query,
      name: 'product',
      label: t('shared.labels.product'),
      labelBy: 'name',
      valueBy: 'id',
      query: productsQuerySelector,
      dataKey: 'products',
      queryVariables: productsId.length > 0
        ? {
            filter: {
              NOT: { id: { inList: productsId } }
            }
          }
        : undefined,
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      disabled: type == FormType.EDIT
    },
    {
      type: FieldType.Text,
      name: 'priceOverride',
      label: t('sales.priceLists.items.labels.priceOverride'),
      placeholder: t('sales.priceLists.items.placeholders.priceOverride'),
      float: true,
      prepend: currency
    },
    {
      type: FieldType.Text,
      name: 'discountOverride',
      label: t('sales.priceLists.items.labels.discountOverride'),
      placeholder: t('sales.priceLists.items.placeholders.discountOverride'),
      float: true,
      prepend: currency
    }
  ];

  if (!autoUpdatePrice) {
    fields.push({
      type: FieldType.Text,
      name: 'priceAuto',
      label: t('sales.priceLists.items.labels.priceAuto'),
      placeholder: t('sales.priceLists.items.placeholders.priceAuto'),
      float: true,
      prepend: currency,
      disabled: true
    });
    fields.push({
      type: FieldType.Text,
      name: 'discountAuto',
      label: t('sales.priceLists.items.labels.discountAuto'),
      placeholder: t('sales.priceLists.items.placeholders.discountAuto'),
      float: true,
      prepend: currency,
      disabled: true
    });
  }

  return {
    cols: 1,
    type: type,
    mutation: mutation,
    mutationKey: mutationKey,
    deleteMutation: deleteSalesPriceListItemMutation,
    submitUrl: { name: 'sales.priceLists.show', params: { id: salesPriceListId }, query: { tab: 'items' } },
    fields: fields,
    helpSections: [
      {
        header: t('sales.priceLists.items.helpSection.product.header'),
        content: t('sales.priceLists.items.helpSection.product.content')
      },
      {
        header: t('sales.priceLists.items.helpSection.priceOverride.header'),
        content: t('sales.priceLists.items.helpSection.priceOverride.content')
      },
      {
        header: t('sales.priceLists.items.helpSection.discountOverride.header'),
        content: t('sales.priceLists.items.helpSection.discountOverride.content')
      },
      {
        header: t('sales.priceLists.items.helpSection.priceAuto.header'),
        content: t('sales.priceLists.items.helpSection.priceAuto.content')
      },
      {
        header: t('sales.priceLists.items.helpSection.discountAuto.header'),
        content: t('sales.priceLists.items.helpSection.discountAuto.content')
      }
    ]
  };
};


export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: false,
  orderKey: "sort",
  filters: [],
  orders: []
});

export const listingConfigConstructor = (t: Function, salesPriceListId: string): ListingConfig => ({
  headers: [t('shared.labels.product'), t('shared.labels.price'), t('shared.labels.discountPrice'), t('sales.prices.labels.discountPercentage')],
  fields: [
    {
      name: 'product',
      type: FieldType.NestedText,
      keys: ['name']
    },
    {
      name: 'price',
      type: FieldType.Text,
    },
    {
      name: 'discount',
      type: FieldType.Text,
    },
    {
      name: 'salespricelist',
      type: FieldType.NestedText,
      keys: ['discountPcnt'],
    },
  ],
  identifierKey: 'id',
  editUrlName: 'sales.priceLists.items.edit',
  identifierVariables: { priceListId: salesPriceListId },
  addActions: true,
  addEdit: true,
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteSalesPriceListItemMutation,
});

export const listingQueryKey = 'salesPriceListItems';
export const listingQuery = salesPriceListItemsQuery;

