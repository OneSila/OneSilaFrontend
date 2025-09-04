import { Url, FieldType } from '../../../../shared/utils/constants.js'
import {FieldBoolean} from './containers/form-fields/field-boolean';
import {FieldDate} from './containers/form-fields/field-date';
import {FieldCheckbox} from './containers/form-fields/field-checkbox';
import {FieldChoice} from './containers/form-fields/field-choice';
import {FieldProxyChoice} from './containers/form-fields/field-proxy-choice';
import {FieldQuery} from './containers/form-fields/field-query';
import {FieldSlider} from './containers/form-fields/field-slider';
import {FieldValue} from './containers/form-fields/field-value';
import {FieldTextarea} from "./containers/form-fields/field-textarea";
import {FieldPhone} from "./containers/form-fields/field-phone";
import {FieldEmail} from "./containers/form-fields/field-email";
import {FieldDateRange} from "./containers/form-fields/field-date-range";
import {FieldImage} from "./containers/form-fields/field-image";
import {FieldWebsite} from "./containers/form-fields/field-website";
import {FieldIndividualFile} from "./containers/form-fields/field-individual-file";

import {FieldInlineItems} from "./containers/form-fields/field-inline-items";

export interface BaseFormField {
  type: FieldType;
  name: string;
  optional?: boolean;
  label?: string;
  disabled?: boolean;
  default?: any;
  help?: string;
  customCss?: string; // Custom CSS for individual form fields
  customCssClass?: string; // Custom CSS class for individual form fields
}

export interface BooleanFormField extends BaseFormField {
  type: FieldType.Boolean;
  strict: boolean;
  dropdownPosition?: string;
  placeholder?: string;
}

export interface ValueFormField extends BaseFormField {
  type: FieldType.Text;
  placeholder?: string;
  error?: boolean;
  transparent?: boolean;
  secret?: boolean;
  number?: boolean;
  float?: boolean;
  maxNumber?: number;
  minNumber?: number;
  allowAutocomplete?: boolean;
  prepend?: string;
  prependNestedKeys?: string[];
}

export interface EmailFormField extends BaseFormField {
  type: FieldType.Email;
  placeholder?: string;
  icon?: string;
  modelValue?: any;
  disabled?: boolean;
  focused?: boolean;
  required?: boolean;
}

export interface WebsiteFormField extends BaseFormField {
  type: FieldType.Website;
  placeholder?: string;
  icon?: string;
  modelValue?: any;
  disabled?: boolean;
  focused?: boolean;
  required?: boolean;
}

export interface TextareaFormField extends BaseFormField {
  type: FieldType.Textarea;
  placeholder?: string;
  transparent?: boolean;
  autogrow?: boolean;
  error?: boolean;
  gutterX?: string;
  gutterY?: string;
  gutterless?: boolean;
  blurOnEnterKeypress?: boolean;
  scroll?: boolean;
}

export interface ChoiceFormField extends BaseFormField {
  type: FieldType.Choice;
  options: any[];
  labelBy: string;
  valueBy: string;
  placeholder?: string;
  dropdownPosition?: string;
  mandatory?: boolean;
  multiple?: boolean;
  filterable?: boolean;
  removable?: boolean;
  limit?: number;
}

export interface ProxyChoiceFormField extends BaseFormField {
  type: FieldType.ProxyChoice;
  options: any[];
  labelBy: string;
  valueBy: string;
  placeholder?: string;
  dropdownPosition?: string;
  mandatory?: boolean;
  multiple?: boolean;
  filterable?: boolean;
  removable?: boolean;
  limit?: number;
}

export interface IndividualFileFormField extends BaseFormField {
  type: FieldType.IndividualFile;
}

export interface CreateOnTheFly {
  config: FormConfig;
  defaults?: Record<string, string>; // key will be filed name, value will be the default value
}

export interface InlineItemsFormField extends BaseFormField {
  type: FieldType.InlineItems;
  fields: FormField[]; // Fields for each row
  valueKey: string; // Unique identifier for each row (e.g., ID)
  allowAdd?: boolean; // Allow adding new rows dynamically
  allowDelete?: boolean; // Allow deleting rows dynamically

  // For "create" mode
  createMutation: any;
  createMutationKey: string;

  // For "edit" mode
  editMutation: any;
  editMutationKey: string;

  // For "delete" operation
  deleteMutation: any;
  deleteMutationKey: string;

  query: any; // Query to fetch existing data
  queryVariables?: Record<string, any>;
  dataKey: string;
  isEdge?: boolean;

  mode: FormType.CREATE | FormType.EDIT; // Determines if inline items are editable or just added
}



export interface QueryFormField extends BaseFormField {
  type: FieldType.Query;
  labelBy: string;
  valueBy: string;
  query: string;
  queryVariables?: Record<string, any>;
  dataKey: string;
  isEdge?: boolean;
  formMapIdentifier?: string;
  placeholder?: string;
  dropdownPosition?: string;
  mandatory?: boolean;
  multiple?: boolean;
  filterable?: boolean;
  removable?: boolean;
  limit?: number;
  minSearchLength?: number;
  autocompleteIfOneResult?: boolean;
  isLiveUpdate?: boolean;
  createOnFlyConfig?: CreateOnTheFly;
  setDefaultKey?: string;
  defaultExpectedValue?: any; // if we have a default key but we don't give the value the default will be true
}

export interface DateFormField extends BaseFormField {
  type: FieldType.Date;
}

export interface DateRangeFormField extends BaseFormField {
  type: FieldType.RangeDate;
  startName: string;
  endName: string;
  format?: any;
}

export interface SliderFormField extends BaseFormField {
  type: FieldType.Slider;
}

export interface PhoneFormField extends BaseFormField {
  type: FieldType.Phone;
}

export interface CheckboxFormField extends BaseFormField {
  type: FieldType.Checkbox;
  uncheckedValue?: 'null' | 'false';
}

export interface HiddenFormField extends BaseFormField {
  type: FieldType.Hidden;
  value: any;
}

export interface ImageFormField extends BaseFormField {
  type: FieldType.Image;
}

export enum FormType {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
}

export interface HelpSection {
  header?: string;
  content: string;
}

type RedirectIdentifier = Record<string, string>;


export type FormField = EmailFormField | PhoneFormField | TextareaFormField | BooleanFormField | ValueFormField |
                        ChoiceFormField | ProxyChoiceFormField | QueryFormField | DateFormField | DateRangeFormField | SliderFormField |
                        CheckboxFormField | HiddenFormField | WebsiteFormField | ImageFormField | IndividualFileFormField | InlineItemsFormField;

export interface FormConfig {
  cols?: 1 | 2;
  type: FormType;
  mutation: string;
  mutationKey: string;
  mutationId?: string; // optional, for EDIT only
  query?: string; // Optional, used only for Edit forms
  queryVariables?: Record<string, any>; // Variables for the query
  redirectIdentifiers?: RedirectIdentifier[]; // We can map the the redirect param from the mutation respose to another field. Ex. Treat proxyId as Id
  queryDataKey?: string; // Key to extract data from query response
  queryData?: any; // if we already have the data and we don't want get it again we can pass this and we will avoid another query
  submitUrl: Url; // URL for form submission
  submitLabel?: string; // label for submit / save button
  addSubmitAndContinue?: boolean; // if we have or not the submit and continue button
  submitAndContinueLabel?: string; // the label of the save and stay on page button
  submitAndContinueUrl?: Url; // URL for submit and continue operation
  hideButtons?: boolean; // sometimes we want to show the buttons in a different place that the fixed one so we can hide them like this
  addCancel?: boolean;  // if we add the cancel / back button
  cancelLabel?: string; // label for cancel / back button
  cancelUrl?: Url; // url to land after cancel
  addShow?: boolean;  // if we add the show button from the edit page
  showLabel?: string; // label for show button
  showUrlName?: string; // url to land after show
  addDelete?: boolean; // Relevant only for Edit forms
  deleteLabel?: string; // delete label
  deleteMutation?: string; // New addition for delete operation
  deleteUrl?: Url // url to lend after delete
  customStyle?: string;
  afterSubmitCallback?: () => void;
  allowNull?: boolean; // allow null response (some mutations can return null on purpose)
  submitSuccessCreate?: string; // toast message after create
  submitSuccessUpdate?: string; // toast message after update
  fields: FormField[];
  helpSections?: HelpSection[];
  addIdAsQueryParamInSubmitUrl?: boolean // on the submit url add the ID as query param
}

export interface FormConfigDefaultTranslations {
  submitLabel: string;
  cancelLabel: string;
  submitAndContinueLabel: string;
  deleteLabel: string;
  showLabel: string;
}

export const defaultFormConfig = {
  cols: 1,
  addSubmitAndContinue: true,
  addDelete: true,
  addCancel: true,
};

export function getEnhancedConfig(config: Partial<FormConfig>, defaultTranslations: FormConfigDefaultTranslations): FormConfig {
  // if the attributes from the default are not filled they will be fileld with the default ones
  let enhancedConfig = { ...defaultFormConfig, ...config } as FormConfig;

  enhancedConfig.submitLabel = config.submitLabel || defaultTranslations.submitLabel;
  enhancedConfig.cancelLabel = config.cancelLabel || defaultTranslations.cancelLabel;
  enhancedConfig.submitAndContinueLabel = config.submitAndContinueLabel || defaultTranslations.submitAndContinueLabel;
  enhancedConfig.deleteLabel = config.deleteLabel || defaultTranslations.deleteLabel;
  enhancedConfig.showLabel = config.showLabel || defaultTranslations.showLabel;

  // if we have addDelete but not have deleteUrl it will get the submit one that is usually the listing
  if (enhancedConfig.addDelete && !enhancedConfig.deleteUrl) {
    enhancedConfig.deleteUrl = enhancedConfig.submitUrl;
  }

  if (enhancedConfig.addCancel && !enhancedConfig.cancelUrl) {
    enhancedConfig.cancelUrl = enhancedConfig.submitUrl;
  }

  return enhancedConfig;
}

const formatDateForBackend = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const cleanUpDataForMutation = (formData, fields, formType) => {
  let cleanedData = { ...formData };

  fields.forEach(field => {
    const fieldValue = cleanedData[field.name];

    if (field.type === FieldType.ProxyChoice) {
      delete cleanedData[field.name];

      if (fieldValue == null) {
        field.options.forEach(option => {
          const optionValue = option[field.valueBy];
          cleanedData[optionValue] = false;
        });
        return;
      }


      if (field.multiple) {
        field.options.forEach(option => {
          const optionValue = option[field.valueBy];
          cleanedData[optionValue] = fieldValue.includes(optionValue);
        });
      } else {
        field.options.forEach(option => {
          const optionValue = option[field.valueBy];
          cleanedData[optionValue] = (fieldValue === optionValue);
        });
      }
    } else if (field.type === FieldType.Query && field.formMapIdentifier) {

      // we only want to ignore this value if we create, if we edit we might want to delete the old value and replace with a new one
      if (fieldValue == null && formType === FormType.CREATE) {
        delete cleanedData[field.name];
        return;
      }

      // Check if fieldValue is already in the correct format
      if (field.multiple) {
          if (Array.isArray(fieldValue) && fieldValue.every(item => typeof item === 'object' && item.hasOwnProperty(field.formMapIdentifier))) {
            // Map each item to an object that only contains the formMapIdentifier key
            cleanedData[field.name] = fieldValue.map(item => ({
              [field.formMapIdentifier]: item[field.formMapIdentifier]
            }));
            return;
          }
      } else {
        if (typeof fieldValue === 'object' && fieldValue != null  && field.formMapIdentifier) {
            cleanedData[field.name] = { [field.formMapIdentifier]: fieldValue[field.formMapIdentifier] };
        } else {
            if (fieldValue === null) {
              // if the new value of a foreign key is null we don't need to add null to the id but to the foreign key itself
              // so if we have null it will be storeLocation: null instead storeLocation: { id: null }
              cleanedData[field.name] = fieldValue;
            } else {
              cleanedData[field.name] = { [field.formMapIdentifier]: fieldValue};
            }

        }

        return;
      }

      let newValue;
      if (field.multiple) {
        newValue = fieldValue.map(value => ({ [field.formMapIdentifier]: value }));
      } else {
        newValue = { [field.formMapIdentifier]: fieldValue };
      }
      cleanedData[field.name] = newValue;
    } else if (field.type === FieldType.RangeDate) {
      const cleanValues = fieldValue === null;
      cleanedData[field.startName] = formatDateForBackend(cleanValues ? null : fieldValue[0]);
      cleanedData[field.endName] = formatDateForBackend(cleanValues ? null : fieldValue[1]);
      delete cleanedData[field.name];
    } else if (field.type === FieldType.InlineItems) {
      delete cleanedData[field.name]; // this will be processed elsewhere
    }

    if (field.type === FieldType.IndividualFile) {
      if (fieldValue?.notUpdated) {
        delete cleanedData[field.name];
      }
    }

  });

  return cleanedData;
};

export interface FieldConfig {
  enabled: {
    [key: string]: any;
  };
  disabled: {
    [key: string]: any;
  };
}

export interface FieldConfigs {
  [fieldName: string]: FieldConfig;
}
export const updateFieldConfigs = (
  targetId,
  fieldConfigs: FieldConfigs,
  formConfig: any
  ) => {
  Object.entries(fieldConfigs).forEach(([fieldName, config]) => {
    const field = formConfig.value.fields.find(f => f.name === fieldName);

    if (field) {
      const fieldConfig = targetId ? config.enabled : config.disabled;

      Object.entries(fieldConfig).forEach(([key, value]) => {
        if (value === null) {
          delete field[key];
        } else {
          field[key] = value;
        }
      });
    }
  });
};

/**
 * Extracts IDs from a dataset, allowing for nested keys and optional exclusion based on provided keys and a single value.
 */
export function filterAndExtractIds(dataset, toAddKeys, toExcludeKeys: string[] = [] , toExcludeValue: any | null = null) {
  const needExclusion = toExcludeKeys.length > 0 && toExcludeValue !== null;

  return dataset.reduce((acc, item) => {
    let currentItem = item;
    // Navigate through the nested properties to get the target value
    for (const key of toAddKeys) {
      currentItem = currentItem[key];
      if (!currentItem) break; // Stop if the property does not exist
    }

    if (!currentItem) return acc; // Skip if no valid ID was found

    // Apply exclusion based on the keys and the single exclusion value
    if (needExclusion) {
      const exclude = toExcludeKeys.some(key => item[key] && item[key].toString() === toExcludeValue);

      if (!exclude) {
        acc.push(currentItem);
      }
    } else {
      acc.push(currentItem);
    }

    return acc;
  }, []);
}

export const getFieldComponent = (type) => {
  switch (type) {
    case FieldType.Boolean: return FieldBoolean;
    case FieldType.Date: return FieldDate;
    case FieldType.Checkbox: return FieldCheckbox;
    case FieldType.Choice: return FieldChoice;
    case FieldType.ProxyChoice: return FieldProxyChoice;
    case FieldType.Query: return FieldQuery;
    case FieldType.Slider: return FieldSlider;
    case FieldType.Text: return FieldValue;
    case FieldType.Textarea: return FieldTextarea;
    case FieldType.Phone: return FieldPhone;
    case FieldType.Email: return FieldEmail;
    case FieldType.RangeDate: return FieldDateRange;
    case FieldType.Image: return FieldImage;
    case FieldType.Website: return FieldWebsite;
    case FieldType.IndividualFile: return FieldIndividualFile;
    case FieldType.InlineItems: return FieldInlineItems;
    default: return null;
  }
};