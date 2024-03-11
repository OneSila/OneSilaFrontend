import { FieldType } from '../../../../shared/utils/constants.js'

export interface PaginationConfig {
  alignment: 'start' | 'center' | 'end';
  buttonClass: 'default' | 'solid' | 'rounded';
  useIcons: boolean;
}
export interface BaseListingField {
  name: string;
  type: FieldType;
  customCss?: string;
  customCssClass?: string;
}


export interface TextField extends BaseListingField {
  type: FieldType.Text;
}

export interface DateField extends BaseListingField {
  type: FieldType.Date;
}
export interface BoleanField extends BaseListingField {
  type: FieldType.Boolean;
}
export interface ImageField extends BaseListingField {
  type: FieldType.Image;
  basePath: string;
  suffix?: string;
  alt?: string;
}

export interface NestedTextField extends BaseListingField {
  type: FieldType.NestedText;
  keys: string[];
}

export const accessNestedProperty = (obj, keys) => {
  return keys.reduce((accumulator, key) => {
    return (accumulator && accumulator[key] !== undefined) ? accumulator[key] : null;
  }, obj);
};

export type ListingField = TextField | BoleanField | ImageField | NestedTextField | DateField;

export interface ListingConfig {
  headers: string[];
  fields: ListingField[];
  identifierVariables?: Record<string, string>;
  urlQueryParams?: Record<string, string>;
  identifierKey?: string; // most times it will be 'id'
  paramIdentifier?: string; // most times it will be 'id'
  addEdit?: boolean;
  editUrlName?: string;
  addShow?: boolean;
  showUrlName?: string;
  addDelete?: boolean;
  deleteMutation?: string;
  deleteMutationRefetchQueries?: string[];
  addPagination?: boolean;
  paginationConfig?: PaginationConfig;
  addActions?: boolean;
}
