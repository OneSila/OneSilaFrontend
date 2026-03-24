export const TYPE_IMAGE = 'IMAGE'
export const TYPE_VIDEO = 'VIDEO'
export const TYPE_DOCUMENT = 'FILE'
export const IMAGE_TYPE_PACK = 'PACK'
export const IMAGE_TYPE_MOOD = 'MOOD'
export const IMAGE_TYPE_COLOR = 'COLOR'


export const getId = (media: any) => {
  const identifier = media.proxyId ? 'proxyId' : 'id';
  return media[identifier]
}
export const getPath = (media: any) => {
  const id = getId(media);
  const routeName = getRouteName(media.type);
  return { name: routeName, params: { id: id } };
};

export const getRouteName = (type: string) => {
  switch (type) {
    case TYPE_IMAGE:
      return 'media.images.show';
    case TYPE_VIDEO:
      return 'media.videos.show';
    case TYPE_DOCUMENT:
      return 'media.documents.show';

  }
};

const cleanFileName = (name?: string | null) => (name || '').replace(/^images\//, '');

const getNameFromUrl = (value?: string | null) => {
  if (!value) {
    return '';
  }
  const cleanValue = value.split('#')[0].split('?')[0];
  return cleanValue.split('/').pop() || cleanValue;
};

const getDocumentBinary = (media: any) => {
  if (media?.type !== TYPE_DOCUMENT) {
    return null;
  }

  if (media?.file) {
    return media.file;
  }

  if (media?.isDocumentImage && media?.image) {
    return media.image;
  }

  return null;
};

export const getFileName = (media: any) => {
  if (media?.type === TYPE_IMAGE) {
    const fileName = cleanFileName(media?.image?.name) || cleanFileName(getNameFromUrl(media?.imageWebUrl));
    return fileName ? truncateText(fileName, 25) : '-';
  }
  if (media?.type === TYPE_DOCUMENT) {
    const documentBinary = getDocumentBinary(media);
    const fileName = cleanFileName(documentBinary?.name)
      || cleanFileName(getNameFromUrl(documentBinary?.url || media?.fileUrl))
      || cleanFileName(media?.title);
    return fileName ? truncateText(fileName, 25) : '-';
  }
  if (media?.type === TYPE_VIDEO) {
    return media?.videoUrl ? truncateText(media.videoUrl, 25) : '-';
  }
  return '-';
};

export const getFileSize = (media: any) => {
  if (media?.type === TYPE_IMAGE) return humanFileSize(media?.image?.size);
  if (media?.type === TYPE_DOCUMENT) return humanFileSize(getDocumentBinary(media)?.size);
  return '-';
};

export const truncateText = (text: string, max: number = 30) => {
  return text.length > max ? text.substring(0, max) + '...' : text;
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export const humanFileSize = (bytes, si=false, dp=1) => {
  if (bytes === null || bytes === undefined || bytes === '') {
    return '-';
  }

  let normalizedBytes = typeof bytes === 'number' ? bytes : Number(bytes);
  if (Number.isNaN(normalizedBytes)) {
    return '-';
  }

  const thresh = si ? 1000 : 1024;

  if (Math.abs(normalizedBytes) < thresh) {
    return normalizedBytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    normalizedBytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(normalizedBytes) * r) / r >= thresh && u < units.length - 1);


  return normalizedBytes.toFixed(dp) + ' ' + units[u];
}
