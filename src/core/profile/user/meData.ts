export interface MeData {
  username: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  telegramNumber?: string;
  dateJoined: string;
  timezone: string;
  isMultiTenantCompanyOwner: boolean;
  avatarResizedFullUrl?: string;
  mcpApiKey?: McpApiKeyData | null;
}

export interface McpApiKeyData {
  id: string;
  maskedKey: string;
  isActive: boolean;
}
