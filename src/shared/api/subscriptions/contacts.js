import { gql } from 'graphql-tag';

export const getCompanySubscription = gql`
subscription getSupplier ($id: String!) {
  company(pk: $id) {
    id
    name
    isSupplier
    vatNumber
    eoriNumber
    isSupplier
    isCustomer
    isInternalCompany
    isInfluencer
    relatedCompanies {
      id
      name
    }
  }
}`;

export const getPersonSubscription = gql`
  subscription getPerson($pk: String!) {
    person(pk: $pk) {
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

export const customerSubscription = gql`
  subscription getCustomerSubscription($pk: String!) {
    customer(pk: $pk) {
      id
      name
      vatNumber
      eoriNumber
      isSupplier
      isCustomer
      isInfluencer
      isInternalCompany
      relatedCompanies {
        id
        name
      }
    }
  }
`;
