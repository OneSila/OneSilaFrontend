import { FieldType } from '../../../../shared/utils/constants.js'

export enum OrderType {
  ASC = 'ASC',
  DESC = 'DESC'
}


export interface BaseFilter {
  type: FieldType;
  name: string;
  label: string;
  default?: any;
  disabled?: boolean | null;
}

export interface BooleanFilter extends BaseFilter {
  type: FieldType.Boolean;
  strict: boolean;
  dropdownPosition?: string;
  placeholder?: string;
}


export interface ValueFilter extends BaseFilter {
  type: FieldType.Text;
  placeholder?: string;
  error?: boolean;
  transparent?: boolean;
  secret?: boolean;
  number?: boolean;
  maxNumber?: number;
  minNumber?: number;
}


export interface ChoiceFilter extends BaseFilter {
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

export interface QueryFilter extends BaseFilter {
  type: FieldType.Query;
  labelBy: string;
  valueBy: string;
  query: string;
  dataKey: string;
  placeholder?: string;
  dropdownPosition?: string;
  mandatory?: boolean;
  multiple?: boolean;
  filterable?: boolean;
  removable?: boolean;
  limit?: number;
}


export interface DateFilter extends BaseFilter {
  type: FieldType.Date;
}

export interface SliderFilter extends BaseFilter {
  type: FieldType.Slider;
}

export interface CheckboxFilter extends BaseFilter {
  type: FieldType.Checkbox;
  uncheckedValue?: 'null' | 'false';
}


export interface OrderCriteria {
  name: string;
  label: string;
  type: OrderType;
}

export type SearchFilter = BooleanFilter | ValueFilter | ChoiceFilter | QueryFilter | DateFilter | SliderFilter | CheckboxFilter;

export interface SearchConfig {
  search: boolean;
  cols?: number;
  orderKey?: string;
  filters?: SearchFilter[];
  orders?: OrderCriteria[];
  limitPerPage?: number;
}


export const defaultSearchConfig: SearchConfig = {
  search: false,
  orderKey: "sort",
  cols: 1,
  filters: [],
  orders: [],
  limitPerPage: 20
};

export const defaultSearchConfigVals = {
  search: false,
  orderKey: "sort",
  cols: 1,
  filters: [],
  orders: [],
  limitPerPage: 20
} as const;