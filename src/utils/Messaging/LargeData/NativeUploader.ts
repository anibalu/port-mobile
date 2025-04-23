import {NativeModules} from 'react-native';

import {
  LARGE_FILE_PRESIGNED_URL_RESOURCE,
  MULTIPART_ABORT,
  MULTIPART_BEGIN,
  MULTIPART_COMPLETE,
} from '@configs/api';

const {PortMediaUploader} = NativeModules;
PortMediaUploader.initialize(
  LARGE_FILE_PRESIGNED_URL_RESOURCE,
  MULTIPART_BEGIN,
  MULTIPART_COMPLETE,
  MULTIPART_ABORT,
);

export default PortMediaUploader;
