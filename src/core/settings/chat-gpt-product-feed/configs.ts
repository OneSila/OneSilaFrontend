import { FormConfig, FormField, FormType, QueryFormField } from '../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../shared/utils/constants.js';
import { propertiesQuerySelector, propertySelectValuesQuerySelector } from '../../../shared/api/queries/properties.js';
import { updateChatGptProductFeedConfigMutation } from '../../../shared/api/mutations/chatGptProductFeed.js';

const createPropertyField = (t: Function, name: string, labelKey: string, optional = true): FormField => ({
  type: FieldType.Query,
  name,
  label: t(labelKey),
  labelBy: 'name',
  valueBy: 'id',
  query: propertiesQuerySelector,
  dataKey: 'properties',
  isEdge: true,
  multiple: false,
  filterable: true,
  formMapIdentifier: 'id',
  placeholder: t('settings.chatGptProductFeed.placeholders.property'),
  optional,
});

const createValueField = (t: Function, name: string, labelKey: string): FormField => ({
  type: FieldType.Query,
  name,
  label: t(labelKey),
  labelBy: 'fullValueName',
  valueBy: 'id',
  query: propertySelectValuesQuerySelector,
  dataKey: 'propertySelectValues',
  isEdge: true,
  multiple: false,
  filterable: true,
  formMapIdentifier: 'id',
  placeholder: t('settings.chatGptProductFeed.placeholders.value'),
  optional: true,
  disabled: true,
});

const createTextField = (t: Function, name: string, labelKey: string, placeholderKey: string): FormField => ({
  type: FieldType.Text,
  name,
  label: t(labelKey),
  placeholder: t(placeholderKey),
  optional: true,
});

export const CHAT_GPT_PROPERTY_VALUE_DEPENDENCIES: Record<string, string[]> = {
  conditionProperty: ['condtionNewValue', 'condtionRefurbishedValue', 'condtionUsdValue'],
  ageGroupProperty: [
    'ageGroupNewbornValue',
    'ageGroupInfantValue',
    'ageGroupTodlerValue',
    'ageGroupKidsValue',
    'ageGroupAdultValue',
  ],
  pickupMethodProperty: [
    'pickupMethodInStoreValue',
    'pickupMethodReserveValue',
    'pickupMethodNotSupportedValue',
  ],
};

export const getChatGptProductFeedFields = (t: Function, id:string): FormField[] => [
  {
    type: FieldType.Hidden,
    name: 'id',
    value: id
  },
  createPropertyField(t, 'conditionProperty', 'settings.chatGptProductFeed.labels.conditionProperty', false),
  createValueField(t, 'condtionNewValue', 'settings.chatGptProductFeed.labels.condtionNewValue'),
  createValueField(t, 'condtionRefurbishedValue', 'settings.chatGptProductFeed.labels.condtionRefurbishedValue'),
  createValueField(t, 'condtionUsdValue', 'settings.chatGptProductFeed.labels.condtionUsdValue'),
  createPropertyField(t, 'brandProperty', 'settings.chatGptProductFeed.labels.brandProperty', false),
  createPropertyField(t, 'materialProperty', 'settings.chatGptProductFeed.labels.materialProperty', false),
  createPropertyField(t, 'mpnProperty', 'settings.chatGptProductFeed.labels.mpnProperty'),
  createPropertyField(t, 'colorProperty', 'settings.chatGptProductFeed.labels.colorProperty', false),
  createPropertyField(t, 'sizeProperty', 'settings.chatGptProductFeed.labels.sizeProperty', false),
  createPropertyField(t, 'ageGroupProperty', 'settings.chatGptProductFeed.labels.ageGroupProperty'),
  createValueField(t, 'ageGroupNewbornValue', 'settings.chatGptProductFeed.labels.ageGroupNewbornValue'),
  createValueField(t, 'ageGroupInfantValue', 'settings.chatGptProductFeed.labels.ageGroupInfantValue'),
  createValueField(t, 'ageGroupTodlerValue', 'settings.chatGptProductFeed.labels.ageGroupTodlerValue'),
  createValueField(t, 'ageGroupKidsValue', 'settings.chatGptProductFeed.labels.ageGroupKidsValue'),
  createValueField(t, 'ageGroupAdultValue', 'settings.chatGptProductFeed.labels.ageGroupAdultValue'),
  createPropertyField(t, 'lengthProperty', 'settings.chatGptProductFeed.labels.lengthProperty'),
  createTextField(t, 'lengthUnit', 'settings.chatGptProductFeed.labels.lengthUnit', 'settings.chatGptProductFeed.placeholders.unit'),
  createPropertyField(t, 'widthProperty', 'settings.chatGptProductFeed.labels.widthProperty'),
  createPropertyField(t, 'heightProperty', 'settings.chatGptProductFeed.labels.heightProperty'),
  createPropertyField(t, 'weightProperty', 'settings.chatGptProductFeed.labels.weightProperty'),
  createTextField(t, 'weightUnit', 'settings.chatGptProductFeed.labels.weightUnit', 'settings.chatGptProductFeed.placeholders.unit'),
  createPropertyField(t, 'expirationDateProperty', 'settings.chatGptProductFeed.labels.expirationDateProperty'),
  createPropertyField(t, 'pickupMethodProperty', 'settings.chatGptProductFeed.labels.pickupMethodProperty'),
  createValueField(t, 'pickupMethodInStoreValue', 'settings.chatGptProductFeed.labels.pickupMethodInStoreValue'),
  createValueField(t, 'pickupMethodReserveValue', 'settings.chatGptProductFeed.labels.pickupMethodReserveValue'),
  createValueField(t, 'pickupMethodNotSupportedValue', 'settings.chatGptProductFeed.labels.pickupMethodNotSupportedValue'),
  createPropertyField(t, 'sizeSystemProperty', 'settings.chatGptProductFeed.labels.sizeSystemProperty'),
  createPropertyField(t, 'genderProperty', 'settings.chatGptProductFeed.labels.genderProperty'),
  createPropertyField(t, 'popularityScoreProperty', 'settings.chatGptProductFeed.labels.popularityScoreProperty'),
  createPropertyField(t, 'warningProperty', 'settings.chatGptProductFeed.labels.warningProperty'),
  createPropertyField(t, 'ageRestrictionProperty', 'settings.chatGptProductFeed.labels.ageRestrictionProperty'),
];

export const chatGptProductFeedFormConfigConstructor = (t: Function, id: string): FormConfig => ({
  type: FormType.EDIT,
  mutation: updateChatGptProductFeedConfigMutation,
  mutationKey: 'updateChatGptProductFeedConfig',
  submitUrl: { name: 'settings.chatGptProductFeedConfig' },
  addSubmitAndContinue: false,
  addDelete: false,
  addCancel: false,
  helpSections: [],
  omitNullValues: true,
  submitSuccessUpdate: t('settings.chatGptProductFeed.form.successUpdate'),
  fields: getChatGptProductFeedFields(t, id),
});

export const updateValueFieldDependencies = (fields: FormField[], form: Record<string, any>) => {
  fields.forEach((field) => {
    if (field.type !== FieldType.Query) {
      return;
    }

    const dependencyEntry = Object.entries(CHAT_GPT_PROPERTY_VALUE_DEPENDENCIES).find(([, valueFields]) =>
      valueFields.includes(field.name),
    );

    if (!dependencyEntry) {
      return;
    }

    const [propertyField] = dependencyEntry;
    const queryField = field as QueryFormField;
    const propertyValue = form[propertyField];
    const propertyId = typeof propertyValue === 'object' && propertyValue !== null ? propertyValue.id : propertyValue;

    if (propertyId) {
      queryField.disabled = false;
      queryField.queryVariables = {
        filter: {
          property: {
            id: {
              exact: propertyId,
            },
          },
        },
      };
    } else {
      queryField.disabled = true;
      if (queryField.queryVariables) {
        delete queryField.queryVariables;
      }
    }
  });
};
