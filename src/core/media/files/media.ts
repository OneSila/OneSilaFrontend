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

  }
};

export const getFileName = (media: any) => {
  const cleanFileName = (name) => name.replace(/^images\//, '');

  if (media.type === TYPE_IMAGE) return truncateText(cleanFileName(media.image.name), 25);
  if (media.type === TYPE_DOCUMENT) return truncateText(cleanFileName(media.file.name), 25);
  if (media.type === TYPE_VIDEO) return truncateText(media.videoUrl, 25);
  return '-';
};

export const getFileSize = (media: any) => {
  if (media.type === TYPE_IMAGE) return humanFileSize(media.image.size);
  if (media.type === TYPE_DOCUMENT) return humanFileSize(media.file.size);
  return '-';
};

export const truncateText = (text: string, max: number = 30) => {
  return text.length > max ? text.substring(0, max) + '...' : text;
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export const humanFileSize = (bytes, si=false, dp=1) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}
