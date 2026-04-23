export interface ProductPropertiesRuleReference {
  id?: string | null;
  salesChannel?: {
    id?: string | null;
    proxyId?: string | null;
  } | null;
}

export const getProductPropertiesRuleId = (
  rules?: Array<ProductPropertiesRuleReference | null> | null,
  salesChannelId?: string | null,
): string | null => {
  console.log(rules)
  console.log(salesChannelId)
  if (!Array.isArray(rules) || !rules.length) {
    return null;
  }

  if (salesChannelId) {
    const matchingRule = rules.find(
      (rule) => rule?.id && (rule?.salesChannel?.proxyId === salesChannelId || rule?.salesChannel?.id === salesChannelId),
    );
    if (matchingRule?.id) {
      return matchingRule.id;
    }
  }

  const defaultRule = rules.find((rule) => rule?.id && !rule?.salesChannel?.id);
  if (defaultRule?.id) {
    return defaultRule.id;
  }

  const firstRule = rules.find((rule) => rule?.id);
  return firstRule?.id || null;
};

export const getDefaultProductPropertiesRuleId = (
  rules?: Array<ProductPropertiesRuleReference | null> | null,
): string | null => getProductPropertiesRuleId(rules, null);
