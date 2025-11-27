import { FieldType } from "../../../../../../shared/utils/constants";
import { salesChannelImportsQuery } from "../../../../../../shared/api/queries/salesChannels.js";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import {SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";

export const getStatusBadgeMap = (t: Function) => ({
  new: { text: t('shared.labels.new'), color: 'gray' },
  pending: { text: t('shared.labels.pending'), color: 'blue' },
  failed: { text: t('shared.labels.failed'), color: 'red' },
  success: { text: t('shared.labels.completed'), color: 'green' },
  processing: { text: t('shared.labels.processing'), color: 'yellow' },
});


export interface SalesChannelImportItem {
  id: string;
  status: 'new' | 'pending' | 'failed' | 'success' | 'processing';
  percentage: number;
  createdAt: string;
}

export interface AmazonSalesChannelImportItem {
  id: string;
  type: string;
  status: 'new' | 'pending' | 'failed' | 'success' | 'processing';
  percentage: number;
  createdAt: string;
}

export interface EbaySalesChannelImportItem {
  id: string;
  type: string;
  status: 'new' | 'pending' | 'failed' | 'success' | 'processing';
  percentage: number;
  createdAt: string;
}

export interface SheinSalesChannelImportItem {
  id: string;
  proxyId: string;
  type: string;
  status: 'new' | 'pending' | 'failed' | 'success' | 'processing';
  percentage: number;
  createdAt: string;
}

export interface SalesChannelSubscriptionResult {
  salesChannel: {
    id: string;
    active: boolean;
    isImporting: boolean;
    saleschannelimportSet: SalesChannelImportItem[];
    amazonImports: AmazonSalesChannelImportItem[];
    ebayImports: EbaySalesChannelImportItem[];
    sheinImports: SheinSalesChannelImportItem[];
  };
}

export interface RemoteLanguage {
  id: string;
  remoteCode: string;
  name: string;
  localInstance: { id: string } | null;
  localInstanceId?: string | null;
}

export interface RemoteCurrency {
  id: string;
  remoteCode: string;
  name: string;
  marketplaceName?: string | null;
  localInstance: { id: string; isoCode?: string } | null;
  localInstanceId?: string | null;
}

export interface RemoteAttribute {
  id: string;
  attributeCode: string;
  data: string;
}

export interface MagentoAttributeSet {
  id: string;
  name: string;
}

export interface IntegrationData {
  syncEanCodes: boolean;
  eanCodeAttribute?: string;
  attributeSetSkeletonId?: number;
}

export interface EanCodeAttribute {
  id?: string;
  name: string;
  attributeCode: string;
  isNew: boolean;
}
