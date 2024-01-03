import _slugify from '@sindresorhus/slugify';
import { useI18n } from 'vue-i18n';

export const isIntegrated = () => window.location !== window.parent.location;

export const useStringifyActiveStatus = () => {
  const { t } = useI18n();
  return (isActive: boolean) =>
    `${t('shared.labels.active')}: ${
      isActive ? t('shared.labels.yes') : t('shared.labels.no')
    }`;
};

export const slugify = _slugify;

export const flipBoolean = (value?: any) =>
  [undefined, null, '', 'all'].includes(value) ? value : !value;

export const booleanify = (
  value?: any,
  defaultValue: boolean | null = null,
) => {
  if (!['true', 'false', 'null', 'all', null, undefined, ''].includes(value)) {
    return defaultValue;
  }

  if ([undefined, null, ''].includes(value)) {
    return defaultValue;
  }

  if (value === 'all') {
    return null;
  }

  return value === 'true';
};

export const booleanifyIfNeeded = (value?: any) => {

  if (typeof value === 'boolean') {
    return value;
  }

  const booleanStringValues = ['true', 'false', 'null', 'all'];

  if (booleanStringValues.includes(value)) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null' || value === 'all') return null;
  }

  return value;
};

export const booleanSelectify = (value?: any) =>
  [undefined, null, ''].includes(value) ? 'all' : value;

export const truncate = (text: string, max = 10) => {
  return text.substring(0, max - 1) + (text.length > max ? '...' : '');
};

export const getSelectedOrderIndex = (orders, routeQuery, orderKey = 'sort') => {
  const orderValue = String(routeQuery[orderKey]);
  if (!orderValue) return -1;

  const isDescending = orderValue.startsWith('-');
  const orderName = isDescending ? orderValue.substring(1) : orderValue;

  return orders?.findIndex(order =>
    order.name === orderName &&
    (isDescending ? order.type === 'DESC' : order.type === 'ASC')
  ) ?? -1;
};

export const dataImageToBlob = (image: string) => {
  if (!window || window.window !== window) {
    throw new Error('This module is only available in browser');
  }

  const Blob =
    window.Blob || (window as any).MozBlob || (window as any).WebKitBlob;

  if (!Blob) {
    throw new Error('Blob was not supported');
  }

  const imagePattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/;

  // parse the image components as per RFC 2397
  const matches = image.match(imagePattern);

  if (!matches) {
    throw new Error('invalid dataURI');
  }

  // default to text/plain;charset=utf-8
  const mediaType = matches[2]
    ? matches[1]
    : 'text/plain' + (matches[3] || ';charset=utf-8');

  const isBase64 = !!matches[4];
  const dataString = image.slice(matches[0].length);
  const byteString = isBase64
    ? // convert base64 to raw binary data held in a string
      atob(dataString)
    : // convert base64/URLEncoded data component to raw binary
      decodeURIComponent(dataString);

  const array: any[] = [];

  for (let i = 0; i < byteString.length; i++) {
    array.push(byteString.charCodeAt(i));
  }

  return new Blob([new Uint8Array(array)], { type: mediaType });
};
