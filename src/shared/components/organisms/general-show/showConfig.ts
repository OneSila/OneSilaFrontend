import { Url } from '../../../../shared/utils/constants.js'
import { FieldType} from "../../../../shared/utils/constants.js";
import {FieldText} from "./containers/field-text";
import {FieldImage} from "./containers/field-image";
import {FieldNestedText} from "./containers/field-nested-text";
import {FieldArray} from "./containers/field-array";
import {FieldBoolean} from "./containers/field-boolean";
import {FieldPhone} from "./containers/field-phone";
import {FieldDate} from "./containers/field-date";
import {FieldEmail} from "./containers/field-email";
import {FieldWebsite} from "./containers/field-website";

export interface ShowBaseField {
  name: string;
  icon?: string;
  label?: string;
  clickable?: boolean;
  showLabel?: boolean;
  clickUrl?: Url; // url to navigate when clicked
  customCss?: string; // Custom CSS for individual fields
  customCssClass?: string; // Custom CSS class for individual fields
}

export interface TextField extends ShowBaseField {
  type: FieldType.Text;
}

export interface PhoneField extends ShowBaseField {
  type: FieldType.Phone;
}

export interface EmailField extends ShowBaseField {
  type: FieldType.Email;
}

export interface WebsiteField extends ShowBaseField {
  type: FieldType.Website;
}
export interface DateField extends ShowBaseField {
  type: FieldType.Date;
}
export interface BooleanField extends ShowBaseField {
  type: FieldType.Boolean;
}
export interface ImageField extends ShowBaseField {
  type: FieldType.Image;
  basePath?: string;
  suffix?: string;
  alt?: string;
  width?: string;
  height?: string;
}

export interface NestedTextField extends ShowBaseField {
  type: FieldType.NestedText;
  keys: string[];
  clickUrl?: any;
}

type ClickIdentifier = Record<string, string[]>;

export interface ArrayField extends ShowBaseField {
  type: FieldType.Array;
  keys: string[];
  clickIdentifiers?: ClickIdentifier[];
}

export type ShowField = DateField | PhoneField | ArrayField | TextField | BooleanField | ImageField | NestedTextField | EmailField | WebsiteField;

export const updateField = (showConfig, fieldName, newConfig) => {
  const fieldIndex = showConfig.fields.findIndex(field => field.name === fieldName);
  if (fieldIndex !== -1) {
    showConfig.fields[fieldIndex] = { ...showConfig.fields[fieldIndex], ...newConfig };
  }
};

export const getFieldComponent = (type) => {
  switch (type) {
    case FieldType.Text: return FieldText;
    case FieldType.Image: return FieldImage;
    case FieldType.NestedText: return FieldNestedText;
    case FieldType.Array: return FieldArray;
    case FieldType.Boolean: return FieldBoolean;
    case FieldType.Phone: return FieldPhone;
    case FieldType.Date: return FieldDate;
    case FieldType.Email: return FieldEmail;
    case FieldType.Website: return FieldWebsite;
    default: return null;
  }
};

export const accessNestedProperty = (obj, keys) => {
  return keys.reduce((accumulator, key) => {
    return (accumulator && accumulator[key] !== undefined) ? accumulator[key] : null;
  }, obj);
};

export interface ShowConfig {
  cols?: 1 | 2;
  subscription: string;
  subscriptionKey: string;
  subscriptionVariables?: Record<string, any>;
  addBack?: boolean;  // if we add the back / back button
  backUrl?: Url; // url to land after back
  addEdit?: boolean;  // if we add the edit
  editUrl?: Url; // url to land after edit clicked
  addDelete?: boolean; // Relevant only for Edit forms
  deleteMutation?: string; // New addition for delete operation
  deleteVariables?: Record<string, any>;
  deleteUrl?: Url; // url to lend after delete
  customStyle?: string;
  fields: ShowField[];
}