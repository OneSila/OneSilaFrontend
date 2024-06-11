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
    name: 'vatRates',
    label: t('settings.vatRates.title'),
    icon: 'percent',
    url: 'settings.vatRates.list',
  },
  {
    name: 'units',
    label: t('settings.units.title'),
    icon: 'ruler',
    url: 'settings.units.list',
  },
  {
    name: 'companies',
    label: t('settings.internalCompanies.title'),
    icon: 'building',
    url: 'settings.internalCompanies.list',
  },
  {
    name: 'demoData',
    label: t('settings.demoData.title'),
    icon: 'database',
    url: 'settings.demoData.show',
  },
];