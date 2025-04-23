//
//  RCTPortMultipartUploader.m
//  Port
//
//  Created by Shantanav Saurav on 11/04/2025.
//

#import "RCTPortMediaUploader-Bridging-Header.h"

// To export a module named PortMultipartUploader
@interface RCT_EXTERN_MODULE(PortMediaUploader, NSObject)

// ReactMethod: initialize(presign:begin:complete:abort:)
RCT_EXTERN_METHOD(
                  initialize:(NSString *)presign
                  begin:(NSString *)begin
                  complete:(NSString *)complete
                  abort:(NSString *)abort
                  )

// ReactMethod: uploadFile(_ path: String, token: String, partSize: Double, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock)
RCT_EXTERN_METHOD(
                  uploadFile:(NSString *)path
                  token:(NSString *)token
                  partSize:(double)partSize
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  )

// ReactMethod: cancelUpload(_ path: String) -> Bool
RCT_EXTERN_METHOD(
                  cancelUpload:(NSString *)path
                  )

@end
