import { gql } from 'graphql-tag';

export const createCompanyMutation = gql`
mutation createCompany($data: CompanyInput!) {
  createCompany(data: $data){
    id
    name
    phone
    email
    language
    currency {
      id
      isoCode
    }
  }
}
`;

export const updateCompanyMutation = gql`
mutation updateCompany($data: CompanyPartialInput!) {
  updateCompany(data: $data) {
    id
    name
    phone
    email
    language
    currency {
      id
      isoCode
    }
  }
}
`;

export const deleteCompanyMutation = gql`
mutation deleteCompany($id: GlobalID!) {
  deleteCompany(data: {id: $id}) {
      id
  }
}
`;
export const createCompanyAddressMutation = gql`
mutation createCompanyAddressMutation($data: AddressInput!) {
  createAddress(data: $data) {
    id
    isInvoiceAddress
    isShippingAddress
    address1
    address2
    address3
    vatNumber
    eoriNumber
    postcode
    city
    country
  }
}
`;

export const createCompanyInvoiceAddressMutation = gql`
mutation createCompanyInvoiceAddressMutation($data: InvoiceAddressInput!) {
  createInvoiceAddress(data: $data) {
    id
    fullAddress
    isInvoiceAddress
    isShippingAddress
    address1
    address2
    address3
    vatNumber
    eoriNumber
    postcode
    city
    country
  }
}
`;

export const createCompanyShippingAddressMutation = gql`
mutation createCompanyShippingAddressMutation($data: ShippingAddressInput!) {
  createShippingAddress(data: $data) {
    id
    isInvoiceAddress
    isShippingAddress
    address1
    address2
    address3
    vatNumber
    eoriNumber
    postcode
    city
    country
  }
}
`;

export const updateCompanyAddressMutation = gql`
mutation updateCompanyAddressMutation($data: AddressPartialInput!) {
  updateAddress(data: $data) {
        id
        isInvoiceAddress
        isShippingAddress
        address1
        address2
        address3
        vatNumber
        eoriNumber
        postcode
        city
        country
  }
}
`;

export const deleteCompanyAddressMutation = gql`
mutation deleteCompanyAddressMutation($id: GlobalID!) {
  deleteAddress(data: {id: $id}) {
      id
      isInvoiceAddress
      isShippingAddress
      address1
      address2
      address3
      vatNumber
      eoriNumber
      postcode
      city
      country
  }
}
`;


export const createPersonMutation = gql`
  mutation createPerson($data: PersonInput!) {
    createPerson(data: $data) {
      id
      firstName
      lastName
      fullName
      active
      role
      company {
        id
        name
      }
      phone
      email
      language
    }
  }
`;

export const createPeopleMutation = gql`
  mutation createPeople($data: [PersonInput!]!) {
    createPeople(data: $data) {
      id
      firstName
      lastName
      active
      role
      company {
        id
        name
      }
      phone
      email
      language
    }
  }
`;

export const updatePersonMutation = gql`
  mutation updatePerson($data: PersonPartialInput!) {
    updatePerson(data: $data) {
      id
      firstName
      lastName
      active
      role
      company {
        id
        name
      }
      phone
      email
      language
    }
  }
`;

export const deletePersonMutation = gql`
  mutation deletePerson($id: GlobalID!) {
    deletePerson(data: {id: $id}) {
      id
    }
  }
`;

export const deletePeopleMutation = gql`
  mutation deletePeople($ids: [GlobalID!]!) {
    deletePeople(data: {ids: $ids}) {
      id
    }
  }
`;

export const createCustomerMutation = gql`
  mutation createCustomer($data: CustomerInput!) {
    createCustomer(data: $data) {
      id
      name
      phone
      email
      language
      isSupplier
      isCustomer
      isInfluencer
      isInternalCompany
    }
  }
`;

export const createSupplierMutation = gql`
  mutation createSupplier($data: SupplierInput!) {
    createSupplier(data: $data) {
      id
      name
      phone
      email
      language
      isSupplier
      isCustomer
      isInfluencer
      isInternalCompany
    }
  }
`;

export const createCustomersMutation = gql`
  mutation createCustomers($data: [CustomerInput!]!) {
    createCustomers(data: $data) {
      id
      name
      phone
      email
      language
      isSupplier
      isCustomer
      isInfluencer
      isInternalCompany
    }
  }
`;

export const updateCustomerMutation = gql`
  mutation updateCustomer($data: CustomerPartialInput!) {
    updateCustomer(data: $data) {
      id
      name
      phone
      email
      language
      isSupplier
      isCustomer
      isInfluencer
      isInternalCompany
    }
  }
`;

export const updateSupplierMutation = gql`
  mutation updateSupplier($data: SupplierPartialInput!) {
    updateSupplier(data: $data) {
      id
      name
      phone
      email
      language
      isSupplier
      isCustomer
      isInfluencer
      isInternalCompany
    }
  }
`;

export const deleteCustomerMutation = gql`
  mutation deleteCustomer($id: GlobalID!) {
    deleteCustomer(data: {id: $id}) {
      id
    }
  }
`;

export const deleteSupplierMutation = gql`
  mutation deleteSupplier($id: GlobalID!) {
    deleteSupplier(data: {id: $id}) {
      id
    }
  }
`;
export const deleteCustomersMutation = gql`
  mutation deleteCustomers($ids: [GlobalID!]!) {
    deleteCustomers(data: {ids: $ids}) {
      id
    }
  }
`;