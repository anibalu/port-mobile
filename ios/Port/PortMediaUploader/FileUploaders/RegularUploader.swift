//
//  RegularUploader.swift
//  Port
//
//  Created by Shantanav Saurav on 18/04/2025.
//

import Foundation

// Expected JSON structure for a single-upload response.
struct URLData: Decodable {
  struct Fields: Decodable {
    let key: String
    let xAmzAlgorithm: String
    let xAmzCredential: String
    let xAmzDate: String
    let xAmzSecurityToken: String
    let policy: String
    let xAmzSignature: String
    enum CodingKeys: String, CodingKey {
      case key
      case xAmzAlgorithm = "x-amz-algorithm"
      case xAmzCredential = "x-amz-credential"
      case xAmzDate = "x-amz-date"
      case xAmzSecurityToken = "x-amz-security-token"
      case policy
      case xAmzSignature = "x-amz-signature"
    }
  }
  let url: String
  let fields: Fields
}

struct SingleUploadURLResponseBody: Decodable {
  let mediaId: String
  let url: URLData
}

struct SingleUploadURLResponse: Decodable {
  let body: SingleUploadURLResponseBody
  let statusCode: Int
}

class RegularUploader : IUploader {
  var type = "Single-shot"
  let presignedURL: String
  
  init(presignedURL: String) {
    self.presignedURL = presignedURL
  }
  // Default chunk size for determining single vs multipart upload
  static let DEFAULT_CHUNK_SIZE = Double(5 * 1024 * 1024)
  
  /// Returns the number of chunks for the file at the given path.
  func getNumChunks(path: String, chunkSize: Double = DEFAULT_CHUNK_SIZE) -> Int {
    guard let attributes = try? FileManager.default.attributesOfItem(atPath: path),
          let fileSize = attributes[.size] as? UInt64 else {
      return -1
    }
    return Int(ceil(Double(fileSize) / chunkSize))
  }
  
  /// For this example, use regular (non-multipart) upload if there is exactly one chunk.
  func useRegularUpload(numChunks: Int) -> Bool {
    return numChunks == 1
  }
  
  /// Regular (single-shot) file upload.
  func upload(token: String, path: String) async throws -> String {
    let fileURL = URL(fileURLWithPath: path)
    guard FileManager.default.fileExists(atPath: fileURL.path) else {
      throw NSError(domain: "RegularFileUploader", code: 404, userInfo: [NSLocalizedDescriptionKey: "File not found: \(path)"])
    }
    
    var request = URLRequest(url: URL(string: presignedURL)!)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    let (data, response) = try await URLSession.shared.data(for: request)
    guard let httpResponse = response as? HTTPURLResponse, (200..<300).contains(httpResponse.statusCode) else {
      throw NSError(domain: "RegularFileUploader", code: 0, userInfo: [NSLocalizedDescriptionKey: "Fetching presigned URL failed"])
    }
    
    let presignedResponse = try JSONDecoder().decode(SingleUploadURLResponse.self, from: data)
    let mediaId = presignedResponse.body.mediaId
    let urlData = presignedResponse.body.url
    
    let boundary = "Boundary-\(UUID().uuidString)"
    // This is called multipart because it's a form-data object, not because it's meant to be a multipart upload
    var multipartRequest = URLRequest(url: URL(string: urlData.url)!)
    multipartRequest.httpMethod = "POST"
    multipartRequest.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
    
    var body = Data()
    let formFields: [(name: String, value: String)] = [
      ("key", urlData.fields.key),
      ("x-amz-algorithm", urlData.fields.xAmzAlgorithm),
      ("x-amz-credential", urlData.fields.xAmzCredential),
      ("x-amz-date", urlData.fields.xAmzDate),
      ("x-amz-security-token", urlData.fields.xAmzSecurityToken),
      ("policy", urlData.fields.policy),
      ("x-amz-signature", urlData.fields.xAmzSignature)
    ]
    
    // Add each field.
    for (name, value) in formFields {
      body.append("--\(boundary)\r\n".data(using: .utf8)!)
      body.append("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n".data(using: .utf8)!)
      body.append("\(value)\r\n".data(using: .utf8)!)
    }
    
    // Append file.
    let fileData = try Data(contentsOf: fileURL)
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    let filename = fileURL.lastPathComponent
    body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
    body.append("Content-Type: application/octet-stream\r\n\r\n".data(using: .utf8)!)
    body.append(fileData)
    body.append("\r\n".data(using: .utf8)!)
    body.append("--\(boundary)--\r\n".data(using: .utf8)!)
    
    multipartRequest.httpBody = body
    let (_, uploadResponse) = try await URLSession.shared.data(for: multipartRequest)
    guard let uploadHTTPResponse = uploadResponse as? HTTPURLResponse, (200..<300).contains(uploadHTTPResponse.statusCode) else {
      throw NSError(domain: "RegularFileUploader", code: 0, userInfo: [NSLocalizedDescriptionKey: "File upload failed"])
    }
    return mediaId
  }
}
