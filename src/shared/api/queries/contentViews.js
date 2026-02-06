import { gql } from 'graphql-tag';

export const companyContentViewsQuery = gql`
  query CompanyContentViews {
    companyContentViews {
      key
      name
    }
  }
`;
