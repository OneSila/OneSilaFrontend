import { IntegrationTypes } from '../../core/integrations/integrations/integrations';

interface IntegrationLabelTarget {
  id?: string | null;
  name?: string | null;
  hostname?: string | null;
  type?: string | null;
}

export const cleanHostname = (hostname: string, type?: string | null) => {
  if (!hostname) return '';
  if (type === IntegrationTypes.Amazon || type === IntegrationTypes.Ebay || type === IntegrationTypes.Shein) {
    // For Amazon, hostname might be a display name or marketplace label.
    return hostname;
  }
  try {
    const url = new URL(hostname.startsWith('http') ? hostname : `https://${hostname}`);
    return url.hostname.replace(/^www\./i, '');
  } catch {
    return hostname;
  }
};

export const formatIntegrationLabel = (integration?: IntegrationLabelTarget) => {
  if (!integration) return '';
  if (integration.name) return integration.name;
  const cleaned = cleanHostname(integration.hostname || '', integration.type || null);
  return cleaned || integration.type || integration.id || '';
};
