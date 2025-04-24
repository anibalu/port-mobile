//
//  MultipartUploader.swift
//  Port
//
//  Created by Shantanav Saurav on 18/04/2025.
//

import Foundation

struct Part: Codable {
  let partNumber: Int
  let etag: String
  enum CodingKeys: String, CodingKey {
    case partNumber = "PartNumber"
    case etag = "ETag"
  }
}

class MultipartUploader: IUploader {
  var type = "Multipart"
  static let DEFAULT_CHUNK_SIZE = Double(5 * 1024 * 1024)
  static let DEFAULT_MAX_RETRIES = 3
  static let DEFAULT_INITIAL_BACKOFF: UInt64 = 1_000_000_000
  static let DEFAULT_MAX_BACKOFF: UInt64 = 8_000_000_000

  let numChunks: Int
  let partSize: Double
  let beginURL: String
  let completeURL: String
  let abortURL: String

  init(
    numChunks: Int,
    partSize: Double,
    beginURL: String,
    completeURL: String,
    abortURL: String
  ) {
    self.numChunks = numChunks
    self.partSize = partSize
    self.beginURL = beginURL
    self.completeURL = completeURL
    self.abortURL = abortURL
  }

  /// Returns an AsyncThrowingStream of file chunks (as Data) from the specified file.
  func chunkFileGenerator(filePath: String, partSize: Double)
    -> AsyncThrowingStream<Data, Error>
  {
    AsyncThrowingStream { continuation in
      let fileURL = URL(fileURLWithPath: filePath)
      guard let fileHandle = try? FileHandle(forReadingFrom: fileURL) else {
        continuation.finish(
          throwing: NSError(
            domain: "PortMultipartUploader", code: 0,
            userInfo: [
              NSLocalizedDescriptionKey: "Could not open file at \(filePath)"
            ]))
        return
      }
      Task {
        do {
          let attributes = try FileManager.default.attributesOfItem(
            atPath: fileURL.path)
          let fileSize = attributes[.size] as! UInt64
          var position: UInt64 = 0
          while position < fileSize {
            try fileHandle.seek(toOffset: position)
            let remaining = min(UInt64(partSize), fileSize - position)
            let chunk: Data
            if #available(iOS 13.0, *) {
              chunk = try fileHandle.read(upToCount: Int(remaining)) ?? Data()
            } else {
              chunk = fileHandle.readData(ofLength: Int(remaining))
            }
            if chunk.isEmpty { break }
            continuation.yield(chunk)
            position += UInt64(chunk.count)
          }
          try fileHandle.close()
          continuation.finish()
        } catch {
          try? fileHandle.close()
          continuation.finish(throwing: error)
        }
      }
    }
  }

  /// Uploads a single chunk with retry logic.
  func uploadChunk(
    index: Int,
    url: String,
    chunk: Data,
    successfulChunks: inout Set<Int>,
    mediaId: String,
    uploadId: String,
    multipartAbortURL: String,
    partDetails: inout [Part],
    maxRetries: Int = DEFAULT_MAX_RETRIES,
    initialBackOff: UInt64 = DEFAULT_INITIAL_BACKOFF,
    maxBackoff: UInt64 = DEFAULT_MAX_BACKOFF
  ) async {
    var attempt = 0
    var currentBackOff = initialBackOff

    while attempt < maxRetries {
      do {
        var request = URLRequest(url: URL(string: url)!)
        request.httpMethod = "PUT"
        request.httpBody = chunk
        request.setValue(
          "application/octet-stream", forHTTPHeaderField: "Content-Type")
        let (_, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
          (200..<300).contains(httpResponse.statusCode)
        else {
          throw NSError(
            domain: "PortMediaUploader", code: 0,
            userInfo: [
              NSLocalizedDescriptionKey: "Upload failed with non-success status"
            ])
        }
        if let etag = (httpResponse.allHeaderFields["Etag"] as? String) {
          successfulChunks.insert(index)
          partDetails.append(Part(partNumber: index + 1, etag: etag))
          return
        } else {
          throw NSError(
            domain: "PortMediaUploader", code: 0,
            userInfo: [
              NSLocalizedDescriptionKey:
                "Upload succeeded but no ETag was returned"
            ])
        }
      } catch {
        try? await Task.sleep(nanoseconds: currentBackOff)
        currentBackOff = min(currentBackOff * 2, maxBackoff)
        attempt += 1
      }
    }
    // Abort on failure
    var abortRequest = URLRequest(url: URL(string: multipartAbortURL)!)
    abortRequest.httpMethod = "POST"
    abortRequest.setValue(
      "application/json", forHTTPHeaderField: "Content-Type")
    let jsonDict: [String: Any] = ["mediaId": mediaId, "uploadId": uploadId]
    abortRequest.httpBody = try? JSONSerialization.data(
      withJSONObject: jsonDict)
    _ = try? await URLSession.shared.data(for: abortRequest)
  }

  /// Orchestrates a multipart upload by retrieving the upload URLs, concurrently uploading chunks, and completing the upload.
  func upload(
    token: String,
    path: String
  ) async throws -> String {
    var beginRequest = URLRequest(url: URL(string: beginURL)!)
    beginRequest.httpMethod = "POST"
    beginRequest.setValue(token, forHTTPHeaderField: "Authorization")
    beginRequest.setValue(
      "application/json", forHTTPHeaderField: "Content-Type")
    let beginJson = try JSONSerialization.data(withJSONObject: [
      "parts": numChunks
    ])
    beginRequest.httpBody = beginJson
    let (beginData, _) = try await URLSession.shared.data(for: beginRequest)

    struct MultipartUploadResponseBody: Decodable {
      let mediaId: String
      let uploadId: String
      let urls: [String]
    }
    let multipartResponse = try JSONDecoder().decode(
      MultipartUploadResponseBody.self, from: beginData)
    let mediaId = multipartResponse.mediaId
    let uploadId = multipartResponse.uploadId
    let urls = multipartResponse.urls
    if urls.count != numChunks {
      throw NSError(
        domain: "PortMediaUploader", code: 0,
        userInfo: [
          NSLocalizedDescriptionKey: "Mismatch in expected URLs and chunks"
        ])
    }

    var successfulChunks = Set<Int>()
    var partDetails = [Part]()

    try await withThrowingTaskGroup(of: Void.self) { group in
      let stream = chunkFileGenerator(filePath: path, partSize: partSize)
      var index = 0
      for try await chunk in stream {
        let currentIndex = index
        let chunkURL = urls[currentIndex]
        group.addTask {
          await self.uploadChunk(
            index: currentIndex,
            url: chunkURL,
            chunk: chunk,
            successfulChunks: &successfulChunks,
            mediaId: mediaId,
            uploadId: uploadId,
            multipartAbortURL: self.abortURL,
            partDetails: &partDetails
          )
        }
        index += 1
      }
      try await group.waitForAll()
    }
    let sortedParts = partDetails.sorted { $0.partNumber < $1.partNumber }
    if successfulChunks.count == numChunks {
      var completeRequest = URLRequest(url: URL(string: completeURL)!)
      completeRequest.httpMethod = "POST"
      completeRequest.setValue(token, forHTTPHeaderField: "Authorization")
      completeRequest.setValue(
        "application/json", forHTTPHeaderField: "Content-Type")
      struct MultipartUploadCompletion: Encodable {
        let uploadId: String
        let mediaId: String
        let parts: [Part]
      }
      let completion = MultipartUploadCompletion(
        uploadId: uploadId, mediaId: mediaId, parts: sortedParts)
      completeRequest.httpBody = try JSONEncoder().encode(completion)
      _ = try await URLSession.shared.data(for: completeRequest)
      return mediaId
    } else {
      throw NSError(
        domain: "PortMediaUploader", code: 0,
        userInfo: [NSLocalizedDescriptionKey: "Failed to upload all chunks"])
    }
  }
}
