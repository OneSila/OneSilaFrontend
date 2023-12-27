import { gql } from 'graphql-tag';

// export const updateMeMutation = gql`
//     mutation updateMe($firstName: String!, $lastName: String!, $mobileNumber: String, $whatsappNumber: String, $telegramNumber: String) {
//       updateMe(data: {firstName: $firstName, lastName: $lastName, mobileNumber: $mobileNumber, whatsappNumber: $whatsappNumber, telegramNumber: $telegramNumber}) {
//         username
//         lastName
//         firstName
//         mobileNumber
//         whatsappNumber
//         telegramNumber
//         avatar {
//           name
//           path
//           url
//         }
//         timezone
//         isMultiTenantCompanyOwner
//         dateJoined
//       }
//     }
// `;

export const updateMeMutation = gql`
    mutation updateMe($mobileNumber: String, $whatsappNumber: String, $telegramNumber: String) {
      updateMe(data: {mobileNumber: $mobileNumber, whatsappNumber: $whatsappNumber, telegramNumber: $telegramNumber}) {
        username
        lastName
        firstName
        mobileNumber
        whatsappNumber
        telegramNumber
        avatarResizedFullUrl
        timezone
        isMultiTenantCompanyOwner
        dateJoined
      }
    }
`;

export const updateMyCompanyMutation = gql`
  mutation updateMyCompany($name: String!, $address1: String, $address2: String, $postcode: String, $city: String, $email: String, $phoneNumber: String, $vatNumber: String, $website: String) {
    updateMyMultiTenantCompany(data: {name: $name, address1: $address1, address2: $address2, postcode: $postcode, city: $city, email: $email, phoneNumber: $phoneNumber, vatNumber: $vatNumber, website: $website}) {
      name
      address1
      address2
      postcode
      city
      language
      email
      phoneNumber
      vatNumber
      website
    }
  }
`;
