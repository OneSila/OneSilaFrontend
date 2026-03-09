export interface TabItem {
  name: string;
  label: string;
  icon: string;
  url: string;
}
export const getTabsConfig = (t: Function): TabItem[] => [
  {
    name: 'currencies',
    label: t('settings.currencies.title'),
    icon: 'money-bill',
    url: 'settings.currencies.list',
  },
  {
    name: 'documentTypes',
    label: t('settings.documentTypes.title'),
    icon: 'file-text',
    url: 'settings.documentTypes.list',
  },
  {
    name: 'vatRates',
    label: t('settings.vatRates.title'),
    icon: 'percent',
    url: 'settings.vatRates.list',
  },
  {
    name: 'brandIdentity',
    label: t('settings.brandIdentity.title'),
    icon: 'comment-dots',
    url: 'settings.brandIdentity.list',
  },
  {
    name: 'chatGptProductFeed',
    label: t('settings.chatGptProductFeed.title'),
    icon: 'robot',
    url: 'settings.chatGptProductFeedConfig',
  },
  {
    name: 'demoData',
    label: t('settings.demoData.title'),
    icon: 'database',
    url: 'settings.demoData.show',
  },
];
