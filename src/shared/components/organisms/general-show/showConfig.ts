import { Url } from '../../../../shared/utils/constants.js'
import { FieldType} from "../../../../shared/utils/constants.js";

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

export type ShowField = ArrayField | TextField | BooleanField | ImageField | NestedTextField;

export const updateField = (showConfig, fieldName, newConfig) => {
  const fieldIndex = showConfig.fields.findIndex(field => field.name === fieldName);
  if (fieldIndex !== -1) {
    showConfig.fields[fieldIndex] = { ...showConfig.fields[fieldIndex], ...newConfig };
  }
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