import { gql } from 'graphql-tag';

export const createMcpApiKeyMutation = gql`
  mutation CreateMcpApiKey {
    createMcpApiKey {
      id
      key
      maskedKey
      isActive
    }
  }
`;

export const regenerateMcpApiKeyMutation = gql`
  mutation RegenerateMcpApiKey {
    regenerateMcpApiKey {
      id
      key
      maskedKey
      isActive
    }
  }
`;

export const activateMcpApiKeyMutation = gql`
  mutation ActivateMcpApiKey {
    activateMcpApiKey {
      id
      maskedKey
      isActive
    }
  }
`;

export const deactivateMcpApiKeyMutation = gql`
  mutation DeactivateMcpApiKey {
    deactivateMcpApiKey {
      id
      maskedKey
      isActive
    }
  }
`;
