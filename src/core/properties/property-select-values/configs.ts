import {
    CreateOnTheFly,
    FormConfig,
    FormField,
    FormType
} from '../../../shared/components/organisms/general-form/formConfig';
import {FieldType, PropertyTypes} from '../../../shared/utils/constants';
import { OrderType, SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import {ListingConfig} from "../../../shared/components/organisms/general-listing/listingConfig";
import {
    getPropertySelectValueQuery,
    propertiesQuerySelector,
    propertySelectValuesQuery
} from "../../../shared/api/queries/properties.js";
import {
    createPropertySelectValueMutation,
    deletePropertySelectValueMutation, deletePropertySelectValuesMutation,
    updatePropertySelectValueMutation
} from "../../../shared/api/mutations/properties.js";
import {ShowConfig} from "../../../shared/components/organisms/general-show/showConfig";
import {getPropertySelectValueSubscription} from '../../../shared/api/subscriptions/properties.js';

export const baseFormConfigConstructor = (
    t: Function,
    type: FormType,
    mutation: any,
    mutationKey: string,
    propertyId: string | null = null,
    addImage: boolean = true,
    redirectToRules: boolean = false,
    remoteRuleId: string | null = null,
    remoteSelectValueId: string | null = null,
    remoteSelectValueType: string | null = null,
): FormConfig => ({
    cols: 1,
    type: type,
    mutation: mutation,
    mutationKey: mutationKey,
    submitUrl: getSubmitUrl(redirectToRules, propertyId, remoteRuleId, remoteSelectValueId, remoteSelectValueType),
    addSubmitAndContinue: !remoteRuleId && !remoteSelectValueId,
    submitAndContinueUrl: {name: 'properties.values.edit'},
    deleteMutation: deletePropertySelectValueMutation,
    ...((redirectToRules && remoteRuleId) || remoteSelectValueId ? { addIdAsQueryParamInSubmitUrl: true } : {}),
    fields: [
        getPropertyField(t, propertyId, type),
        {
            type: FieldType.Text,
            name: 'value',
            label: t('properties.values.show.title'),
            placeholder: t('properties.values.placeholders.value')
        },
        ...(addImage ? [{
            type: FieldType.Image,
            name: 'image',
            label: t('shared.labels.image'),
            optional: true,
        } as FormField] : [])
    ],
});

const getSubmitUrl = (
    redirectToRules: boolean,
    propertyId: string | null,
    remoteRuleId: string | null,
    remoteSelectValueId: string | null,
    remoteSelectValueType: string | null,
) => {
    const parseRemoteIdentifier = (value: string) => {
        const parts = value.split('__');
        const [id = '', integrationId = '', salesChannelId = '', fourth = '', fifth = ''] = parts;
        let type = '';
        let wizard = '';

        if (parts.length >= 5) {
            type = fourth;
            wizard = fifth;
        } else if (parts.length === 4) {
            if (fourth === '0' || fourth === '1') {
                wizard = fourth;
            } else {
                type = fourth;
            }
        }

        return { id, integrationId, salesChannelId, type, wizard };
    };

    if (remoteSelectValueId) {
        const { id: selectValueId, integrationId, salesChannelId, type, wizard } = parseRemoteIdentifier(remoteSelectValueId);
        const url: any = {
            name: 'integrations.remotePropertySelectValues.edit',
            params: { type: remoteSelectValueType ?? (type || 'amazon'), id: selectValueId }
        };
        if (integrationId) {
            url.query = { integrationId } as any;
            if (salesChannelId) {
                url.query.salesChannelId = salesChannelId;
            }
            if (wizard) {
                url.query.wizard = wizard;
            }
        }
        return url;
    }
    if (redirectToRules && remoteRuleId) {
        const { id: ruleId, integrationId, salesChannelId, type, wizard } = parseRemoteIdentifier(remoteRuleId);
        const url: any = { name: 'integrations.remoteProductTypes.edit', params: { type: type || 'amazon', id: ruleId } };
        if (integrationId) {
            url.query = { integrationId } as any;
            if (salesChannelId) {
                url.query.salesChannelId = salesChannelId;
            }
            if (wizard) {
                url.query.wizard = wizard;
            }
        }
        return url;
    }

    if (redirectToRules) {
        return { name: 'properties.rule.list' };
    }

    if (propertyId !== null) {
        return { name: 'properties.properties.show', params: { id: propertyId }, query: { tab: 'values' } };
    }

    return { name: 'properties.values.list' };
};

export const selectValueOnTheFlyConfig = (t: Function, propertyId, defaultValue: string | null = null): CreateOnTheFly => ({
    config: {
        cols: 1,
        type: FormType.CREATE,
        mutation: createPropertySelectValueMutation,
        mutationKey: 'createPropertySelectValue',
        submitUrl: propertyId !== null ? {
            name: 'properties.properties.show',
            params: {id: propertyId},
            query: {tab: 'values'}
        } : {name: 'properties.values.list'},
        submitAndContinueUrl: {name: 'properties.values.edit'},
        deleteMutation: deletePropertySelectValueMutation,
        fields: [
            getPropertyField(t, propertyId, FormType.CREATE),
            {
                type: FieldType.Text,
                name: 'value',
                label: t('properties.values.show.title'),
                placeholder: t('properties.values.placeholders.value'),
            },
        ],
    },
    isSelectValue: true,
      ...(defaultValue ? { defaults: { value: defaultValue } } : {}),
})

export const editFormConfigConstructor = (
    t: Function,
    id: string,
    data: any,
    addImage: boolean = true,
): FormConfig => ({
    cols: 1,
    type: FormType.EDIT,
    mutation: updatePropertySelectValueMutation,
    mutationKey: 'updatePropertySelectValue',
    submitUrl: {name: 'properties.values.list'},
    submitAndContinueUrl: {name: 'properties.values.edit'},
    deleteMutation: deletePropertySelectValueMutation,
    mutationId: id,
    query: getPropertySelectValueQuery,
    queryVariables: {},
    queryData: data,
    queryDataKey: 'propertySelectValue',
    addShow: true,
    showUrlName: 'properties.values.show',
    fields: [
        {
            type: FieldType.Hidden,
            name: 'id',
            value: id
        },
        {
            type: FieldType.Query,
            name: 'property',
            label: t('properties.properties.show.title'),
            labelBy: 'name',
            valueBy: 'id',
            query: propertiesQuerySelector,
            queryVariables: {filter: {'type': {'exact': PropertyTypes.SELECT}}},
            dataKey: 'properties',
            isEdge: true,
            multiple: false,
            filterable: true,
            formMapIdentifier: 'id',
            disabled: true
        },
        ...(addImage ? [{
            type: FieldType.Image,
            name: 'image',
            label: t('shared.labels.image'),
            optional: true,
        } as FormField] : [])
    ],
});


const getPropertyField = (t, propertyId, type): FormField => {
    if (propertyId) {
        return {
            type: FieldType.Hidden,
            name: 'property',
            value: {"id": propertyId}
        };
    } else {
        return {
            type: FieldType.Query,
            name: 'property',
            label: t('properties.properties.show.title'),
            labelBy: 'name',
            valueBy: 'id',
            query: propertiesQuerySelector,
            queryVariables: {filter: {'type': {'inList': [PropertyTypes.SELECT, PropertyTypes.MULTISELECT]}}},
            dataKey: 'properties',
            isEdge: true,
            multiple: false,
            filterable: true,
            formMapIdentifier: 'id',
            disabled: type === FormType.EDIT
        };
    }
}

export const searchConfigConstructor = (t: Function): SearchConfig => ({
    search: true,
    orderKey: "sort",
    filters: [
        {
            type: FieldType.Query,
            name: 'property',
            label: t('properties.properties.show.title'),
            labelBy: 'name',
            valueBy: 'id',
            query: propertiesQuerySelector,
            queryVariables: {filter: {'type': {'inList': [PropertyTypes.SELECT, PropertyTypes.MULTISELECT]}}},
            dataKey: 'properties',
            filterable: true,
            isEdge: true,
            addLookup: true,
            lookupKeys: ['id']
        },
        {
            type: FieldType.Boolean,
            name: 'missingMainTranslation',
            label: t('properties.values.labels.missingMainTranslation'),
            strict: true,
        },
        {
            type: FieldType.Boolean,
            name: 'missingTranslations',
            label: t('properties.values.labels.missingTranslations'),
            strict: true,
        },
        {
            type: FieldType.Boolean,
            name: 'usedInProducts',
            label: t('properties.values.labels.usedInProducts'),
            strict: true,
        },
    ],
    orders: [
        {
            name: 'createdAt',
            label: t('shared.sort.newest'),
            type: OrderType.DESC
        },
        {
            name: 'createdAt',
            label: t('shared.sort.oldest'),
            type: OrderType.ASC
        },
        {
            name: 'usageCount',
            label: t('properties.values.sort.mostUsed'),
            type: OrderType.DESC
        },
        {
            name: 'usageCount',
            label: t('properties.values.sort.leastUsed'),
            type: OrderType.ASC
        },
    ]
});

export const listingConfigConstructor = (t: Function, addActions: boolean = true, isMainPage: boolean = false, addGrid: boolean = false): ListingConfig => ({
    headers: [t('properties.values.show.title'), t('properties.properties.show.title'), t('properties.values.labels.usageCount')],
    fields: [
        {
            name: 'value',
            type: FieldType.Text,
            ...(addGrid ? {addImage: true, imageField: 'thumbnailUrl'} : {})
        },
        {
            name: 'property',
            type: FieldType.NestedText,
            keys: ['name'],
            clickable: true,
            clickIdentifiers: [{id: ['id']}],
            clickUrl: {name: 'properties.properties.show'}
        },
        {
            name: 'usageCount',
            type: FieldType.Text,
        },
    ],
    identifierKey: 'id',
    addActions: addActions,
    addEdit: true,
    editUrlName: 'properties.values.edit',
    showUrlName: 'properties.values.show',
    addShow: true,
    addDelete: true,
    addPagination: true,
    addGridView: addGrid,
    defaultGridIcon: 'image',
    isMainPage: isMainPage,
    deleteMutation: deletePropertySelectValueMutation,
    addBulkDelete: isMainPage,
    bulkDeleteMutation: deletePropertySelectValuesMutation,
    bulkDeleteSuccessAlert: t('properties.values.alert.toast.bulkDeleteSuccess'),
    bulkDeleteErrorAlert: t('properties.values.alert.toast.bulkDeleteError'),
});

export const showConfigConstructor = (t: Function, id): ShowConfig => ({
    cols: 1,
    subscription: getPropertySelectValueSubscription,
    subscriptionKey: 'propertySelectValue',
    subscriptionVariables: {pk: id},
    backUrl: {name: 'properties.values.list'},
    editUrl: {name: 'properties.values.edit', params: {id: id}, query: {tab: 'translations'}},
    deleteMutation: deletePropertySelectValueMutation,
    deleteVariables: {id: id},
    deleteUrl: {name: 'properties.values.list'},
    addBack: true,
    addEdit: true,
    addDelete: true,
    fields: [
        {
            label: t('properties.properties.show.title'),
            name: 'property',
            type: FieldType.NestedText,
            keys: ['name'],
        },
        {
            label: t('properties.values.show.title'),
            name: 'value',
            type: FieldType.Text
        },
        {
            label: t('properties.values.labels.usageCount'),
            name: 'usageCount',
            type: FieldType.Text
        }
    ]
});

export const listingQueryKey = 'propertySelectValues';
export const listingQuery = propertySelectValuesQuery;
