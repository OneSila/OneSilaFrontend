import { gql } from 'graphql-tag';

export const meSubscription = gql`
  subscription me {
      me {
       username
        lastName
        firstName
        mobileNumber
        whatsappNumber
        telegramNumber
        timezone
        isMultiTenantCompanyOwner
        dateJoined
        avatarResizedFullUrl
      }
  }
`;

export const meCompanySubscription = gql`
  subscription meCompany {
    myMultiTenantCompany {
      name
      language
      address1
      address2
      postcode
      city
      email
      phoneNumber
      vatNumber
      website
      multitenantuserSet {
          email
          lastName
          firstName
          isMultiTenantCompanyOwner
          invitationAccepted
        }
    }
  }
`;