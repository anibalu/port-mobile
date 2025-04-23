//
//  RCTPortMediaUploader.swift
//  Port
//
//  Created by Shantanav Saurav on 11/04/2025.
//

import Foundation
import React

@objc(PortMediaUploader)
class PortMediaUploader: NSObject {
  static let NAME = "PortMediaUploader"
  
  // API endpoints for file upload
  private var presignUrl: String?
  private var multipartBeginUrl: String?
  private var multipartCompleteUrl: String?
  private var multipartAbortUrl: String?
  
  // MARK: — React Method to initialize endpoints
  @objc(initialize:begin:complete:abort:)
  func initialize(
    presign: String,
    begin: String,
    complete: String,
    abort: String
  ) {
    presignUrl = presign
    multipartBeginUrl = begin
    multipartCompleteUrl = complete
    multipartAbortUrl = abort
    NSLog("\(Self.NAME): Initialized URLs for file uploading.")
  }
  
  private var uploadJobs: [String: Task<Void, Never>] = [:]
  private var uploadPromises: [String: (resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock)] = [:]
  
  // MARK: — Helper to choose uploader
  func selectUploader(
    path: String,
    partSize: Double
  ) throws -> IUploader {
    // Ensure all endpoints are set
    for (_, url) in [
      "presignUrl": presignUrl,
      "multipartBeginUrl": multipartBeginUrl,
      "multipartCompleteUrl": multipartCompleteUrl,
      "multipartAbortUrl": multipartAbortUrl
    ] {
      guard let u = url, !u.isEmpty else {
        throw NSError(domain: "PortMediaUploader", code: 0, userInfo: [NSLocalizedDescriptionKey: "Make sure uploader has been initialized"])
      }
    }
    guard let attributes = try? FileManager.default.attributesOfItem(atPath: path),
          let fileSize = attributes[.size] as? UInt64 else {
      throw NSError(domain: "PortMediaUploader", code: 0, userInfo: [NSLocalizedDescriptionKey: "File not found"])
    }
    // Check file existence and compute chunk count
    let numChunks = Int(ceil(Double(fileSize) / partSize))
    guard numChunks > 0 else {
      throw NSError(domain: "PortMediaUploader", code: 0, userInfo: [NSLocalizedDescriptionKey: "Chunk count invalid"])
    }

    // Pick uploader
    if numChunks == 1 {
      return RegularUploader(presignedURL: presignUrl!)
    } else {
      return MultipartUploader(
        numChunks: numChunks,
        partSize: partSize,
        beginURL: multipartBeginUrl!,
        completeURL: multipartCompleteUrl!,
        abortURL: multipartAbortUrl!
      )
    }
  }
  
  @objc
  func uploadFile(_ path: String,
                  token: String,
                  partSize: Double,
                  resolver resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {
    let promiseTuple = (resolve: resolve, reject: reject)
    uploadJobs[path] = Task.detached(priority: .background) { [weak self] in
      guard let self = self else { return }
      do {
        self.uploadPromises[path] = promiseTuple
        let uploader: IUploader = try selectUploader(path: path, partSize: partSize)
        let mediaId: String = try await uploader.upload(token: token, path: path)
        NSLog("PortMediaUploader: \(uploader.type) upload completed")
        resolve(mediaId)
      } catch {
        NSLog("PortMediaUploader ERROR: \(error.localizedDescription)")
        reject("UPLOAD_ERROR", error.localizedDescription, nil)
      }
      self.uploadJobs.removeValue(forKey: path)
      self.uploadPromises.removeValue(forKey: path)
    }
  }
  
  @objc(cancelUpload:)
  func cancelUpload(_ path: String) -> Bool {
    if let task = uploadJobs.removeValue(forKey: path) {
      task.cancel()
      if let promise = uploadPromises.removeValue(forKey: path) {
        promise.reject("UPLOAD_CANCELED", "Upload was canceled for \(path)", nil)
      }
      return true
    }
    return false
  }
}

extension PortMediaUploader: RCTBridgeModule {
  static func moduleName() -> String! {
    return PortMediaUploader.NAME
  }
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
