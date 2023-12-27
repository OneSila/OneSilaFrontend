import {gql} from "graphql-tag";

export const changeLanguageMutation = gql`
    mutation changeLanguage($newLanguage: String!) {
        updateMe (data: {language: $newLanguage}) {
            language
          }
    }
`;

