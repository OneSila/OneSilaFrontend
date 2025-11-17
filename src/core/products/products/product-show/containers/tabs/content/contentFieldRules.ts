import { IntegrationTypes } from '../../../../../../integrations/integrations/integrations';

type ContentFieldRuleFlags = {
  name: boolean;
  subtitle: boolean;
  shortDescription: boolean;
  description: boolean;
  urlKey: boolean;
  bulletPoints: boolean;
};

export type ContentFieldLimitKey = 'name' | 'subtitle' | 'shortDescription' | 'description' | 'bulletPoints';
export type ContentFieldLimitConfig = Partial<Record<ContentFieldLimitKey, number>>;

export interface ContentFieldRules extends ContentFieldRuleFlags {
  limits: ContentFieldLimitConfig;
}

const baseFieldRuleFlags: ContentFieldRuleFlags = {
  name: true,
  subtitle: false,
  shortDescription: true,
  description: true,
  urlKey: true,
  bulletPoints: false,
};

const defaultLimits: ContentFieldLimitConfig = {
  name: 512,
  shortDescription: 500,
  description: 6000,
  bulletPoints: 255,
};

const createRule = (
  overrides: Partial<ContentFieldRuleFlags> = {},
  limitOverrides: ContentFieldLimitConfig = {},
): ContentFieldRules => ({
  ...baseFieldRuleFlags,
  ...overrides,
  limits: { ...defaultLimits, ...limitOverrides },
});

export const FIELD_RULES: Record<string, ContentFieldRules> = {
  [IntegrationTypes.Magento]: createRule({}, { name: 255 }),
  [IntegrationTypes.Woocommerce]: createRule(),
  [IntegrationTypes.Shopify]: createRule({ shortDescription: false }, { name: 70, description: 5000 }),
  [IntegrationTypes.Amazon]: createRule(
    { shortDescription: false, urlKey: false, bulletPoints: true },
    { name: 200, description: 2000 },
  ),
  [IntegrationTypes.Ebay]: createRule({ subtitle: true }, { name: 80, subtitle: 55, description: 50000 }),
  shein: createRule({}, { name: 1000, description: 5000 }),
  default: createRule(),
};

export function getContentFieldRules(type?: string): ContentFieldRules {
  if (!type) return FIELD_RULES.default;
  const normalized = type.toLowerCase();
  return FIELD_RULES[normalized] || FIELD_RULES.default;
}
