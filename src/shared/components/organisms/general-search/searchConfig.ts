import { FieldType } from '../../../../shared/utils/constants.js'

export enum OrderType {
  ASC = 'ASC',
  DESC = 'DESC'
}


export interface BaseFilter {
  type: FieldType;
  name: string;
  label: string;
  helpText?: string;
  default?: any;
  disabled?: boolean | null;
  filterKey?: string;
  fixedFilter?: Record<string, any>;
  addLookup?: boolean;
  lookupKeys?: string[];
  lookupType?: string | null;
  isNot?: boolean;
}

export interface BooleanFilter extends BaseFilter {
  type: FieldType.Boolean;
  strict: boolean;
  dropdownPosition?: string;
  placeholder?: string;
  reverse?: boolean;
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
  queryVariables?: Record<string, any>;
  placeholder?: string;
  dropdownPosition?: string;
  mandatory?: boolean;
  isEdge?: boolean;
  multiple?: boolean;
  filterable?: boolean;
  removable?: boolean;
  limit?: number;
  minSearchLength?: number;
  skipFilterParam?: boolean;
}

export interface IntegrationFilter extends BaseFilter {
  type: FieldType.Integration;
  query: string;
  dataKey: string;
  queryVariables?: Record<string, any>;
  placeholder?: string;
  multiple?: boolean;
  filterable?: boolean;
  removable?: boolean;
  addDefault?: boolean;
  excludeIds?: string[];
  isEdge?: boolean;
  skipFilterParam?: boolean;
}


export interface DateFilter extends BaseFilter {
  type: FieldType.Date;
}

export interface DateRangeFilter extends BaseFilter {
  type: FieldType.RangeDate;
}

export interface SliderFilter extends BaseFilter {
  type: FieldType.Slider;
  min?: number;
  max?: number;
  step?: number;
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

export type SearchFilter = BooleanFilter | ValueFilter | ChoiceFilter | QueryFilter | IntegrationFilter | DateFilter | DateRangeFilter | SliderFilter | CheckboxFilter;

export interface SearchConfig {
  search: boolean;
  cols?: number;
  orderKey?: string;
  filters?: SearchFilter[];
  filterSections?: FilterSection[];
  orders?: OrderCriteria[];
  limitPerPage?: number;
}

export interface FilterSection {
  title: string;
  helpText?: string;
  filters: string[];
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
