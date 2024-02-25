import { gql } from 'graphql-tag';

export const createCompanyMutation = gql`
mutation createCompany($data: CompanyInput!) {
  createCompany(data: $data){
    id
    name
    eoriNumber
    vatNumber
  }
}
`;

export const updateCompanyMutation = gql`
mutation updateCompany($data: CompanyPartialInput!) {
  updateCompany(data: $data) {
    id
    name
    vatNumber
    eoriNumber
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
      vatNumber
      eoriNumber
      isSupplier
      isCustomer
      isInfluencer
      isInternalCompany
      // Additional fields as needed
    }
  }
`;

export const createCustomersMutation = gql`
  mutation createCustomers($data: [CustomerInput!]!) {
    createCustomers(data: $data) {
      id
      name
      vatNumber
      eoriNumber
      isSupplier
      isCustomer
      isInfluencer
      isInternalCompany
      // Additional fields as needed
    }
  }
`;

export const updateCustomerMutation = gql`
  mutation updateCustomer($data: CustomerPartialInput!) {
    updateCustomer(data: $data) {
      id
      name
      vatNumber
      eoriNumber
      isSupplier
      isCustomer
      isInfluencer
      isInternalCompany
      // Additional fields as needed
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

export const deleteCustomersMutation = gql`
  mutation deleteCustomers($ids: [GlobalID!]!) {
    deleteCustomers(data: {ids: $ids}) {
      id
    }
  }
`;