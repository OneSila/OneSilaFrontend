import { gql } from 'graphql-tag';

export const companiesQuery = gql`
query Companies($first: Int, $last: Int, $after: String, $before: String, $order: CompanyOrder, $filter: CompanyFilter) {
  companies(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
    edges {
      node {
        id
        name
        phone
        email
        language
        country
        currency {
          id
          isoCode
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

export const getCompanyQuery = gql`
query getCompany ($id: GlobalID!) {
  company(id: $id) {
    id
    name
    phone
    email
    language
    isCustomer
    isInfluencer
    isSupplier
    isInternalCompany
    currencySymbol
    currency {
      id
      isoCode
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
        fullAddress
        vatNumber
        eoriNumber
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

export const companyInvoiceAddressesQuery = gql`
query invoiceAddresses($filter: InvoiceAddressFilter) {
  invoiceAddresses(filters: $filter) {
    edges {
      node {
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

export const companyShippingAddressesQuery = gql`
query shippingAddresses($filter: ShippingAddressFilter) {
  shippingAddresses(filters: $filter) {
    edges {
      node {
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

export const internalShippingAddressesQuery = gql`
  query internalShippingAddresses($filter: InternalShippingAddressFilter) {
    internalShippingAddresses(filters: $filter) {
      edges {
        node {
          id
          isInvoiceAddress
          isShippingAddress
          address1
          address2
          address3
          vatNumber
          eoriNumber
          fullAddress
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
    vatNumber
    eoriNumber
    postcode
    city
    country
    person {
      id
      firstName
      fullName
    }   
  }
}
`;

export const peopleQuery = gql`
query People($first: Int, $last: Int, $after: String, $before: String, $order: PersonOrder, $filter: PersonFilter) {
  people(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
    edges {
      node {
        id
        firstName
        lastName
        active
        role
        fullName
        company {
          id
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

export const customersQuery = gql`
  query Customers($first: Int, $last: Int, $after: String, $before: String, $order: CustomerOrder, $filter: CustomerFilter) {
    customers(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
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

export const suppliersQuery = gql`
  query Suppliers($first: Int, $last: Int, $after: String, $before: String, $order: SupplierOrder, $filter: SupplierFilter) {
    suppliers(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
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

export const getSupplierQuery = gql`
  query getSupplier($id: GlobalID!) {
    supplier(id: $id) {
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