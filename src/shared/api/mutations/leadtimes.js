import { gql } from 'graphql-tag';

export const createLeadTimeMutation = gql`
  mutation createLeadTime($data: LeadTimeInput!) {
    createLeadTime(data: $data) {
      id
      minTime
      maxTime
      unit
      name
    }
  }
`;

export const createLeadTimesMutation = gql`
  mutation createLeadTimes($data: [LeadTimeInput!]!) {
    createLeadTimes(data: $data) {
      id
      minTime
      maxTime
      unit
    }
  }
`;

export const updateLeadTimeMutation = gql`
  mutation updateLeadTime($data: LeadTimePartialInput!) {
    updateLeadTime(data: $data) {
      id
      minTime
      maxTime
      unit
    }
  }
`;

export const deleteLeadTimeMutation = gql`
  mutation deleteLeadTime($id: GlobalID!) {
    deleteLeadTime(data: {id: $id}) {
      id
    }
  }
`;

export const deleteLeadTimesMutation = gql`
  mutation deleteLeadTimes($ids: [GlobalID!]!) {
    deleteLeadTimes(data: {ids: $ids}) {
      id
    }
  }
`;

export const createLeadTimeForShippingAddressMutation = gql`
  mutation createLeadTimeForShippingaddress($data: LeadTimeForShippingAddressInput!) {
    createLeadTimeForShippingaddress(data: $data) {
      id
      shippingaddress {
        id
        fullAddress
      }
      leadtime {
        id
        minTime
        maxTime
        unit
        name
      }
    }
  }
`;

export const createLeadTimesForShippingAddressesMutation = gql`
  mutation createLeadTimesForShippingAddresses($data: [LeadTimeForShippingAddressInput!]!) {
    createLeadTimesForShippingAddresses(data: $data) {
      id
      shippingaddress {
        id
        fullAddress
      }
      leadtime {
        id
        minTime
        maxTime
        unit
        name
      }
    }
  }
`;

export const updateLeadTimeForShippingAddressMutation = gql`
  mutation updateLeadTimeForShippingaddress($data: LeadTimeForShippingAddressPartialInput!) {
    updateLeadTimeForShippingaddress(data: $data) {
      id
      shippingaddress {
        id
        fullAddress
      }
      leadtime {
        id
        minTime
        maxTime
        unit
        name
      }
    }
  }
`;

export const deleteLeadTimeForShippingAddressMutation = gql`
  mutation deleteLeadTimeForShippingaddress($id: GlobalID!) {
    deleteLeadTimeForShippingaddress(data: {id: $id}) {
      id
    }
  }
`;

export const deleteLeadTimesForShippingAddressesMutation = gql`
  mutation deleteLeadTimesForShippingAddresses($ids: [GlobalID!]!) {
    deleteLeadTimesForShippingAddresses(data: {ids: $ids}) {
      id
    }
  }
`;

export const createLeadTimeProductOutOfStockMutation = gql`
  mutation createLeadTimeProductOutOfStock($data: LeadTimeProductOutOfStockInput!) {
    createLeadTimeProductOutOfStock(data: $data) {
      id
      product {
        id
        name
      }
      leadtimeOutofstock {
        id
        minTime
        maxTime
        unit
      }
    }
  }
`;

export const updateLeadTimeProductOutOfStockMutation = gql`
  mutation updateLeadTimeProductOutOfStock($data: LeadTimeProductOutOfStockPartialInput!) {
    updateLeadTimeProductOutOfStock(data: $data) {
      id
      product {
        id
        name
      }
      leadtimeOutofstock {
        id
        minTime
        maxTime
        unit
      }
    }
  }
`;

export const deleteLeadTimeProductOutOfStockMutation = gql`
  mutation deleteLeadTimeProductOutOfStock($id: GlobalID!) {
    deleteLeadTimeProductOutOfStock(data: {id: $id}) {
      id
    }
  }
`;