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

export const customerLanguagesQuery = gql`
  query customerLanguages {
    customerLanguages{
      name
      code
    }
  }
`;

export const translationLanguagesQuery = gql`
  query translationLanguages {
    translationLanguages {
      code
      name
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

export const timezonesQuery = gql`
query timezones {
  timezones {
    key
  }
}
`;