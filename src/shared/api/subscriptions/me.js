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
      languageDetail {
         code
         name
      }
      languages
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

export const aiPointsSubscriptions = gql`
  subscription meCompany {
    myMultiTenantCompany {
      aiPoints
      hasAmazonIntegration
  }
 }
`;