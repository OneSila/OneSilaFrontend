export type UploadedFile = {
  altText: string;
  name: string;
  aspectRatio: number;
  originalFile: any;
  file: any;
  shouldCrop: boolean;
  preview?: any;
  cropperFile?: any;
  uploading: boolean;
  uploadProgress: number;
  uploaded: boolean;
  uploadErrored: boolean;
  url: string;
}
