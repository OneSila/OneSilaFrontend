import _slugify from '@sindresorhus/slugify';
import {useI18n} from 'vue-i18n';

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

export const getLength = (array) => {
  return Array.isArray(array) && array !== undefined ? array.length : 0;
}

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

export const getFlagImageSrc = (code: string) => {
  return `/images/flags/${code.toUpperCase()}.svg`;
}
export const getSrcImage = (path: string) => {
  try {
    return new URL(path, import.meta.url).href
  } catch (error) {
    console.error('Error constructing URL:', error);
    return '';
  }
};

const matchComplexError = (message, t) => {

  const matchPattern = (pattern, message, translationKey, matchIndex = 1) => {
    const regex = new RegExp(pattern);
    const match = message.match(regex);
    if (match && match[matchIndex]) {
      const fieldName = match[matchIndex];
      return { [fieldName]: t(translationKey) };
    }
    return null;
  };

 // Match non-nullable field error
  let result = matchPattern(
    "Variable '\\$data' got invalid value None at 'data\\.(\\w+)'; Expected non-nullable type '.*' not to be None\\.",
    message,
    'shared.validationErrors.required'
  );
  if (result) return result;

  // Match non-nullable foreign key error
  result = matchPattern(
    "Variable '\\$data' got invalid value \\{.*\\}; Field '(\\w+)' of required type '[^']+' was not provided",
    message,
    'shared.validationErrors.required'
  );
  if (result) return result;

  // This is for foreign key edit
  result = matchPattern(
    "Variable '\\$data' got invalid value None at 'data\\.(\\w+)\\.[\\w\\d]+'; Expected non-nullable type '[^']+' not to be None\\.",
    message,
    'shared.validationErrors.required'
  );
  if (result) return result;

  // manual integrity error thrown from the backend
  result = matchPattern(
      "Missing required field '(\\w+)'",
      message,
      'shared.validationErrors.required'
  );
  if (result) return result;

  return null;
};

const toCamelCase = (str) => {
  return str.replace(/([-_][a-z])/g, (group) => group.toUpperCase()
                                            .replace('-', '')
                                            .replace('_', ''));
};

export const processGraphQLErrors = (errorResponse, t) => {
  const validationErrors = {};

  if (errorResponse && errorResponse.graphQLErrors && Array.isArray(errorResponse.graphQLErrors)) {
    errorResponse.graphQLErrors.forEach(({ message }) => {
      try {
        const parsedError = JSON.parse(message.replace(/'/g, '"'));
        if (typeof parsedError === 'object' && parsedError !== null) {
          Object.keys(parsedError).forEach(key => {
            const camelCaseKey = key === '__all__' ? key : toCamelCase(key);
            validationErrors[camelCaseKey] = Array.isArray(parsedError[key]) && parsedError[key].length > 0
                ? parsedError[key][0]
                : parsedError[key];
          });
        }
      } catch (e) {
        const matchedError = matchComplexError(message, t);
        if (matchedError) {
          Object.assign(validationErrors, matchedError);
        }
      }
    });
  }

  return validationErrors;
};