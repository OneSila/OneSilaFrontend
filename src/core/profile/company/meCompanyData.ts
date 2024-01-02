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
export interface MeCompanyData {
  name: string;
  language: string;
  address1?: string;
  address2?: string;
  postcode?: string;
  city?: string;
  email: string;
  phoneNumber?: string;
  vatNumber?: string;
  website?: string;
  multitenantuserSet: CompanyUser[];
}
