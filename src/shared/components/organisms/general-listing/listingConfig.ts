import {ShowField} from "../general-show/showConfig";

export interface PaginationConfig {
  alignment: 'start' | 'center' | 'end';
  buttonClass: 'default' | 'solid' | 'rounded';
  useIcons: boolean;
}

export interface ListingConfig {
  headers: string[];
  fields: ShowField[];
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
