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
  name: string;
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

export interface MiraklImportProcessItem {
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
    miraklImports: MiraklImportProcessItem[];
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

export interface MiraklFeedListItem {
  id: string;
  type?: string | null;
  stage?: string | null;
  status?: string | null;
  remoteId?: string | null;
  errorMessage?: string | null;
  itemsCount?: number | null;
  rowsCount?: number | null;
  lastSyncedAt?: string | null;
  lastSubmittedAt?: string | null;
  lastPolledAt?: string | null;
  createdAt?: string | null;
  importStatus?: string | null;
  reasonStatus?: string | null;
  remoteDateCreated?: string | null;
  hasErrorReport?: boolean | null;
  hasNewProductReport?: boolean | null;
  hasTransformationErrorReport?: boolean | null;
  hasTransformedFile?: boolean | null;
  errorReportFileUrl?: string | null;
  newProductReportFileUrl?: string | null;
  transformedFileUrl?: string | null;
  transformationErrorReportFileUrl?: string | null;
  productType?: {
    id?: string | null;
    name?: string | null;
    remoteId?: string | null;
    templateUrl?: string | null;
  } | null;
  salesChannelView?: {
    id?: string | null;
    name?: string | null;
    remoteId?: string | null;
  } | null;
}

export const concludedMiraklFeedStatuses = ['success', 'partial', 'failed', 'cancelled'];

export const getMiraklFeedStatusBadgeMap = (t: Function) => ({
  new: { text: t('integrations.imports.miraklFeeds.status.new'), color: 'gray' },
  pending: { text: t('integrations.imports.miraklFeeds.status.pending'), color: 'blue' },
  gathering_products: { text: t('integrations.imports.miraklFeeds.status.gathering_products'), color: 'indigo' },
  gathering_offers: { text: t('integrations.imports.miraklFeeds.status.gathering_offers'), color: 'indigo' },
  ready_to_render: { text: t('integrations.imports.miraklFeeds.status.ready_to_render'), color: 'sky' },
  submitted: { text: t('integrations.imports.miraklFeeds.status.submitted'), color: 'indigo' },
  processing: { text: t('integrations.imports.miraklFeeds.status.processing'), color: 'yellow' },
  success: { text: t('integrations.imports.miraklFeeds.status.success'), color: 'green' },
  partial: { text: t('integrations.imports.miraklFeeds.status.partial'), color: 'orange' },
  failed: { text: t('integrations.imports.miraklFeeds.status.failed'), color: 'red' },
  cancelled: { text: t('integrations.imports.miraklFeeds.status.cancelled'), color: 'gray' },
});

export const getMiraklFeedImportStatusLabel = (t: Function, value?: string | null) => {
  if (!value) {
    return '-';
  }
  const key = `integrations.imports.miraklFeeds.importStatus.${value}`;
  const translated = t(key);
  return translated === key ? value : translated;
};

export const getMiraklFeedFileBadges = (t: Function, feed: MiraklFeedListItem) => ([
  { text: t('integrations.imports.miraklFeeds.files.errorReport'), color: feed.hasErrorReport ? 'red' : 'gray' },
  { text: t('integrations.imports.miraklFeeds.files.newProductReport'), color: feed.hasNewProductReport ? 'blue' : 'gray' },
  { text: t('integrations.imports.miraklFeeds.files.transformedFile'), color: feed.hasTransformedFile ? 'green' : 'gray' },
  { text: t('integrations.imports.miraklFeeds.files.transformationErrorReport'), color: feed.hasTransformationErrorReport ? 'orange' : 'gray' },
]);
