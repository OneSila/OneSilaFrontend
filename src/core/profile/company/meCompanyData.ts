export interface FilteredMember {
  id: string;
  isActive: boolean;
  fullName: string;
  email: string;
  invitationAccepted: boolean;
  isOwner: boolean;
}
export interface CompanyUser {
  id: string;
  isActive: boolean;
  email: string;
  lastName: string;
  firstName: string;
  isMultiTenantCompanyOwner: boolean;
  invitationAccepted: boolean;
}

export interface LanguageDetail {
    code: string;
    name: string;
}

export interface MeCompanyData {
  name: string;
  language: string;
  languages: string[];
  address1?: string;
  address2?: string;
  postcode?: string;
  city?: string;
  country?: string;
  fullAddress?: string;
  email: string;
  phoneNumber?: string;
  vatNumber?: string;
  website?: string;
  multitenantuserSet: CompanyUser[];
  languageDetail: LanguageDetail;
}

export interface MeCompanySubscriptionResult {
  myMultiTenantCompany: {
    name: string;
    language: string;
    languages: string[];
    address1: string;
    address2: string;
    postcode: string;
    city: string;
    email: string;
    phoneNumber: string;
    vatNumber: string;
    website: string;
    multitenantuserSet: MultiTenantUser[];
    languageDetail: LanguageDetail;
  };
}

export interface MultiTenantUser {
  id: string;
  isActive: boolean;
  email: string;
  lastName: string;
  firstName: string;
  isMultiTenantCompanyOwner: boolean;
  invitationAccepted: boolean;
}