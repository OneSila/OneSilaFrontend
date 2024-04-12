import { gql } from 'graphql-tag';

export const getCompanySubscription = gql`
subscription getCompany ($id: String!) {
  company(pk: $id) {
    id
    name
    phone
    email
    language
    isSupplier
    isSupplier
    isCustomer
    isInternalCompany
    isInfluencer
  }
}`;

export const getSupplierSubscription = gql`
subscription getSupplier ($id: String!) {
  supplier(pk: $id) {
    id
    name
    phone
    email
    language
    isSupplier
  }
}`;
export const getPersonSubscription = gql`
  subscription getPerson($pk: String!) {
    person(pk: $pk) {
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
      person {
        id
        firstName
      }
    }
  }
`;

export const getCustomerSubscription = gql`
  subscription getCustomerSubscription($pk: String!) {
    customer(pk: $pk) {
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
