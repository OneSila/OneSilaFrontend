import { gql } from 'graphql-tag';

export const updateChatGptProductFeedConfigMutation = gql`
  mutation updateChatGptProductFeedConfig($data: ChatGptProductFeedConfigPartialInput!) {
    updateChatGptProductFeedConfig(data: $data) {
      id
      conditionProperty {
        id
        name
      }
      condtionNewValue {
        id
        fullValueName
        property {
          id
        }
      }
      condtionRefurbishedValue {
        id
        fullValueName
        property {
          id
        }
      }
      condtionUsdValue {
        id
        fullValueName
        property {
          id
        }
      }
      brandProperty {
        id
        name
      }
      materialProperty {
        id
        name
      }
      mpnProperty {
        id
        name
      }
      colorProperty {
        id
        name
      }
      sizeProperty {
        id
        name
      }
      ageGroupProperty {
        id
        name
      }
      ageGroupNewbornValue {
        id
        fullValueName
        property {
          id
        }
      }
      ageGroupInfantValue {
        id
        fullValueName
        property {
          id
        }
      }
      ageGroupTodlerValue {
        id
        fullValueName
        property {
          id
        }
      }
      ageGroupKidsValue {
        id
        fullValueName
        property {
          id
        }
      }
      ageGroupAdultValue {
        id
        fullValueName
        property {
          id
        }
      }
      lengthProperty {
        id
        name
      }
      lengthUnit
      widthProperty {
        id
        name
      }
      heightProperty {
        id
        name
      }
      weightProperty {
        id
        name
      }
      weightUnit
      expirationDateProperty {
        id
        name
      }
      pickupMethodProperty {
        id
        name
      }
      pickupMethodInStoreValue {
        id
        fullValueName
        property {
          id
        }
      }
      pickupMethodReserveValue {
        id
        fullValueName
        property {
          id
        }
      }
      pickupMethodNotSupportedValue {
        id
        fullValueName
        property {
          id
        }
      }
      genderSystemProperty {
        id
        name
      }
      popularityScoreProperty {
        id
        name
      }
      warningProperty {
        id
        name
      }
      ageRestrictionProperty {
        id
        name
      }
    }
  }
`;
