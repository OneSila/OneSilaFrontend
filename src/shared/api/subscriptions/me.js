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
        isActive
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
      country
      email
      phoneNumber
      vatNumber
      website
      fullAddress
      multitenantuserSet {
          id
          isActive
          email
          lastName
          firstName
          isMultiTenantCompanyOwner
          isActive
          invitationAccepted
        }
    }
  }
`;