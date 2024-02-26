import { Url } from '../../../../shared/utils/constants.js'
export enum FieldType {
  Boolean = "Boolean",
  Value = "Value",
  Choice = "Choice",
  Query = "Query",
  Calendar = "Calendar",
  Slider = "Slider",
  Checkbox = "Checkbox",
  Hidden = "Hidden",
  ProxyChoice = "ProxyChoice"
}

export interface BaseFormField {
  type: FieldType;
  name: string;
  label?: string;
  disabled?: boolean;
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
  type: FieldType.Value;
  placeholder?: string;
  error?: boolean;
  transparent?: boolean;
  secret?: boolean;
  number?: boolean;
  maxNumber?: number;
  minNumber?: number;
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
}

export interface CalendarFormField extends BaseFormField {
  type: FieldType.Calendar;
}

export interface SliderFormField extends BaseFormField {
  type: FieldType.Slider;
}

export interface CheckboxFormField extends BaseFormField {
  type: FieldType.Checkbox;
  uncheckedValue?: 'null' | 'false';
}

export interface HiddenFormField extends BaseFormField {
  type: FieldType.Hidden;
  value: any;
}
export enum FormType {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
}

export type FormField = BooleanFormField | ValueFormField | ChoiceFormField | ProxyChoiceFormField | QueryFormField |
    CalendarFormField | SliderFormField | CheckboxFormField | HiddenFormField;

export interface FormConfig {
  cols?: 1 | 2;
  type: FormType;
  mutation: string;
  mutationKey: string;
  mutationId?: string; // optional, for EDIT only
  query?: string; // Optional, used only for Edit forms
  queryVariables?: Record<string, any>; // Variables for the query
  queryDataKey?: string; // Key to extract data from query response
  submitUrl: Url; // URL for form submission
  submitLabel?: string; // label for submit / save button
  addSubmitAndContinue?: boolean; // if we have or not the submit and continue button
  submitAndContinueLabel?: string; // the label of the save and stay on page button
  submitAndContinueUrl?: Url; // URL for submit and continue operation
  addCancel?: boolean;  // if we add the cancel / back button
  cancelLabel?: string; // label for cancel / back button
  cancelUrl?: Url; // url to land after cancel
  addDelete?: boolean; // Relevant only for Edit forms
  deleteLabel?: string; // delete label
  deleteMutation?: string; // New addition for delete operation
  deleteUrl?: Url // url to lend after delete
  customStyle?: string;
  afterSubmitCallback?: () => void;
  fields: FormField[];
}

export interface FormConfigDefaultTranslations {
  submitLabel: string;
  cancelLabel: string;
  submitAndContinueLabel: string;
  deleteLabel: string;
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

  // if we have addDelete but not have deleteUrl it will get the submit one that is usually the listing
  if (enhancedConfig.addDelete && !enhancedConfig.deleteUrl) {
    enhancedConfig.deleteUrl = enhancedConfig.submitUrl;
  }

  if (enhancedConfig.addCancel && !enhancedConfig.cancelUrl) {
    enhancedConfig.cancelUrl = enhancedConfig.submitUrl;
  }

  return enhancedConfig;
}



export const cleanUpDataForMutation = (formData, fields) => {
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

      if (fieldValue == null) {
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
        cleanedData[field.name] = { [field.formMapIdentifier]: fieldValue[field.formMapIdentifier] }
        return;
      }

      let newValue;
      if (field.multiple) {
        newValue = fieldValue.map(value => ({ [field.formMapIdentifier]: value }));
      } else {
        newValue = { [field.formMapIdentifier]: fieldValue };
      }
      cleanedData[field.name] = newValue;
    }
  });

  return cleanedData;
};