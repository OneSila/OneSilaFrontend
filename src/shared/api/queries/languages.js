import { gql } from 'graphql-tag';

export const languagesQuery = gql`
query languages {
  languages {
    name
    code
    bidi
    nameLocal
    nameTranslated
  }
}
`;

export const countriesQuery = gql`
query countries{
  countries{
    code
    name
  }
}
`;