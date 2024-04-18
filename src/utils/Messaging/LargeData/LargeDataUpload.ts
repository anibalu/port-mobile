import {encryptFile} from '@utils/Crypto/aesFile';
import * as API from './APICalls';
import {
  addFilePrefix,
  deleteFile,
  getSafeAbsoluteURI,
} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

class LargeDataUpload {
  private fileUri: string;
  private fileName: string;
  private fileType: string;
  private key: string | null;
  private mediaId: string | null;
  private encryptedTempFilePath: string | null;
  constructor(
    fileUri: string,
    fileName: string,
    fileType: string,
    fileSource: 'doc' | 'cache' | 'tmp' = 'doc',
  ) {
    //we can assume this file uri is correctly prepended with "file://"
    this.fileUri = getSafeAbsoluteURI(fileUri, fileSource);
    console.log('file uri', fileUri);
    console.log('file uri 2', this.fileUri);
    this.fileName = fileName;
    this.fileType = fileType;
    this.key = null;
    this.mediaId = null;
    this.encryptedTempFilePath = null;
  }
  async upload() {
    try {
      //create encrypted temp file with associated decryption key
      await this.createEncryptedTempFile();
      //upload large data to s3 bucket
      await this.s3Upload();
    } catch (error) {
      await this.cleanUpEncryptedTempFile();
      console.log('Error uploading large data: ', error);
    }
  }
  getMediaIdAndKey() {
    if (!this.mediaId || !this.key) {
      console.error('MediaId: ', this.mediaId, 'Key: ', this.key);
      throw new Error('MediaIdOrKeyNull');
    }
    return {mediaId: this.mediaId, key: this.key};
  }
  private async createEncryptedTempFile() {
    const encryptedFileParams = await encryptFile(this.fileUri);
    this.encryptedTempFilePath = addFilePrefix(
      encryptedFileParams.encryptedFilePath,
    );
    this.key = encryptedFileParams.key;
  }
  private checkEncryptedTempFileNotNull() {
    if (!this.encryptedTempFilePath) {
      throw new Error('EncryptedTempFilePathNull');
    }
    return this.encryptedTempFilePath;
  }
  private async cleanUpEncryptedTempFile() {
    if (this.encryptedTempFilePath) {
      await deleteFile(this.encryptedTempFilePath);
      this.encryptedTempFilePath = null;
    }
  }
  private async s3Upload() {
    this.encryptedTempFilePath = this.checkEncryptedTempFileNotNull();
    const uploadParams = await API.getUploadPresignedUrl();
    const mediaId = uploadParams.mediaId;
    const url: string | null = uploadParams.url.url
      ? uploadParams.url.url
      : null;
    const fields: object | null = uploadParams.url.fields
      ? uploadParams.url.fields
      : null;
    if (!url || !fields) {
      throw new Error('ImproperUploadParams');
    }
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    await API.s3Upload(
      this.encryptedTempFilePath,
      formData,
      url,
      this.fileName,
    );
    if (mediaId) {
      this.mediaId = mediaId;
    }
    await this.cleanUpEncryptedTempFile();
  }
}

export default LargeDataUpload;
