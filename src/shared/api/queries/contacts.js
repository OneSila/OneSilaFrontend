import { gql } from 'graphql-tag';

export const companiesQuery = gql`
query Companies($first: Int, $last: Int, $after: String, $before: String, $order: CompanyOrder, $filter: CompanyFilter) {
  companies(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
    edges {
      node {
        id
        name
        eoriNumber
        vatNumber
      }
      cursor
    }
    totalCount
    pageInfo {
      endCursor
      startCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
`;

export const getCompanyQuery = gql`
query getCompany ($id: GlobalID!) {
  company(id: $id) {
    id
    name
    eoriNumber
    vatNumber
    isCustomer
    isInfluencer
    isSupplier
    isInternalCompany
    relatedCompanies{
      id
      name
    }
  }
}
`;

export const companyAddressesQuery = gql`
query companyAddresses($filter: AddressFilter) {
  addresses(filters: $filter) {
    edges {
      node {
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
      cursor
    }
    totalCount
    pageInfo {
      endCursor
      startCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
`;

export const getCompanyAddressQuery = gql`
query getCompanyAddress ($id: GlobalID!){
  address (id: $id) {
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

export const peopleQuery = gql`
query People($first: Int, $last: Int, $after: String, $before: String, $order: PersonOrder) {
  people(first: $first, last: $last, after: $after, before: $before, order: $order) {
    edges {
      node {
        id
        firstName
        lastName
        company {
          name
        }
        phone
        email
        language
      }
      cursor
    }
    totalCount
    pageInfo {
      endCursor
      startCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
`;

export const getPersonQuery = gql`
  query getPerson($id: GlobalID!) {
    person(id: $id) {
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

export const customersQuery = gql`
  query Customers($first: Int, $last: Int, $after: String, $before: String, $order: CustomerOrder, $filter: CustomerFilter) {
    customers(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
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
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getCustomerQuery = gql`
  query getCustomer($id: GlobalID!) {
    customer(id: $id) {
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
