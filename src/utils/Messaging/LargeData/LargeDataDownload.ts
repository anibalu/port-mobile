import {
  decryptToLargeFileDir,
  deleteFile,
  downloadResourceToTmpDir,
} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import * as API from './APICalls';
import {ContentType} from '../interfaces';

class LargeDataDownload {
  private chatId: string;
  private contentType: ContentType;
  private mediaId: string;
  private key: string;
  private encryptedTempFilePath: string | null;
  private fileName: string;
  private outputFilePath: string | null;
  constructor(
    chatId: string,
    contentType: ContentType,
    mediaId: string,
    key: string,
    fileName: string = '',
  ) {
    this.chatId = chatId;
    this.contentType = contentType;
    this.mediaId = mediaId;
    this.key = key;
    this.encryptedTempFilePath = null;
    this.fileName = fileName || ''; //covers the case where fileName maybe null.
    this.outputFilePath = null;
  }

  async download() {
    try {
      //download file to temp location
      await this.s3Download();
      //decrypt temp file to local chat storage
      await this.createDecryptedFile();
    } catch (error) {
      await this.cleanUpEncryptedTempFile();
      console.log('Error downloading large data: ', error);
    }
  }
  async downloadGroupData(groupId: string) {
    try {
      //download file to temp location
      await this.groupS3Download(groupId);
      //decrypt temp file to local chat storage
      await this.createDecryptedFile();
    } catch (error) {
      await this.cleanUpEncryptedTempFile();
      console.log('Error downloading large data: ', error);
    }
  }
  getDownloadedFilePath() {
    return this.checkOutputFileNotNull();
  }
  private async createDecryptedFile() {
    this.encryptedTempFilePath = this.checkEncryptedTempFileNotNull();
    this.outputFilePath = await decryptToLargeFileDir(
      this.chatId,
      this.contentType,
      this.encryptedTempFilePath,
      this.key,
      this.fileName,
    );
  }
  private checkOutputFileNotNull() {
    if (!this.outputFilePath) {
      throw new Error('OutputFilePathNull');
    }
    return this.outputFilePath;
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
  private async s3Download() {
    if (this.encryptedTempFilePath) {
      return;
    }
    const downloadUrl: string = await API.getDownloadPresignedUrl(this.mediaId);
    this.encryptedTempFilePath = await downloadResourceToTmpDir(downloadUrl);
  }
  private async groupS3Download(groupId: string) {
    if (this.encryptedTempFilePath) {
      return;
    }
    const downloadUrl: string =
      await API.getDownloadPresignedUrlFromGroupPictureResource(groupId);
    this.encryptedTempFilePath = await downloadResourceToTmpDir(downloadUrl);
  }
}

export default LargeDataDownload;
