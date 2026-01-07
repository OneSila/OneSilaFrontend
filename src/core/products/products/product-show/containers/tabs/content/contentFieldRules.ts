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
export type ContentFieldLimitRange = { min?: number; max?: number };
export type ContentFieldLimitValue = number | ContentFieldLimitRange;
export type ContentFieldLimitConfig = Partial<Record<ContentFieldLimitKey, ContentFieldLimitValue>>;

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

const AMAZON_MIN_TITLE_LENGTH = 150;
const AMAZON_MIN_DESCRIPTION_LENGTH = 1000;

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
    {
      name: { min: AMAZON_MIN_TITLE_LENGTH, max: 200 },
      description: { min: AMAZON_MIN_DESCRIPTION_LENGTH, max: 2000 },
    },
  ),
  [IntegrationTypes.Ebay]: createRule({ subtitle: true, urlKey: false }, { name: 80, subtitle: 55, description: 50000 }),
  [IntegrationTypes.Shein]: createRule(
    {
      subtitle: false,
      shortDescription: false,
      urlKey: false,
      bulletPoints: false,
    },
    { name: 1000, description: 5000 },
  ),
  default: createRule(),
};

export function getContentFieldRules(type?: string): ContentFieldRules {
  if (!type) return FIELD_RULES.default;
  const normalized = type.toLowerCase();
  return FIELD_RULES[normalized] || FIELD_RULES.default;
}
