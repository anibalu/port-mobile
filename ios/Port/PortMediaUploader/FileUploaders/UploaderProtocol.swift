//
//  UploaderProtocol.swift
//  Port
//
//  Created by Shantanav Saurav on 18/04/2025.
//

protocol IUploader {
    /// A short identifier for the uploader type
    var type: String { get }
    
    func upload(token: String, path: String) async throws -> String
}
