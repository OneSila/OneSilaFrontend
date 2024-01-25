export enum FilterType {
  Boolean = "Boolean",
  Value = "Value",
  Choice = "Choice",
  Query = "Query",
  Calendar = "Calendar",
  Slider = "Slider",
  Checkbox = "Checkbox",
}

export enum OrderType {
  ASC = 'ASC',
  DESC = 'DESC'
}


export interface BaseFilter {
  type: FilterType;
  name: string;
  label: string;
  default?: any;
  disabled?: boolean | null;
}

export interface BooleanFilter extends BaseFilter {
  type: FilterType.Boolean;
  strict: boolean;
  dropdownPosition?: string;
  placeholder?: string;
}


export interface ValueFilter extends BaseFilter {
  type: FilterType.Value;
  placeholder?: string;
  error?: boolean;
  transparent?: boolean;
  secret?: boolean;
  number?: boolean;
  maxNumber?: number;
  minNumber?: number;
}


export interface ChoiceFilter extends BaseFilter {
  type: FilterType.Choice;
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
  type: FilterType.Query;
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


export interface CalendarFilter extends BaseFilter {
  type: FilterType.Calendar;
}

export interface SliderFilter extends BaseFilter {
  type: FilterType.Slider;
}

export interface CheckboxFilter extends BaseFilter {
  type: FilterType.Checkbox;
  uncheckedValue?: 'null' | 'false';
}


export interface OrderCriteria {
  name: string;
  label: string;
  type: OrderType;
}

export type SearchFilter = BooleanFilter | ValueFilter | ChoiceFilter | QueryFilter | CalendarFilter | SliderFilter | CheckboxFilter;

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