//
//  NotificationService.swift
//  portnse
//  Mutate remote messages with potential mutable content
//
//  Created by Abhinav on 2024-04-20.
//

// TODO clean this file up
import Foundation
import SQLite3
import CommonCrypto


let GROUP_IDENTIFIER = "group.tech.numberless.port"
let DATABASE_NAME = "numberless.db"

// A pointer to the database object
// The db MUST be opened before executing queries
var db: OpaquePointer? = nil

/**
 Open the shared database to run queries needed to display notifications
 */
func openDB(){
  // If we've already opened the database, there's no need to open it again,
  // Simply return a reference to already open object.
  if (db != nil) {
    return
  }
  // The database is in the security group's shared folder
  var groupContainerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: GROUP_IDENTIFIER)
  // We need to suffix the path for the group with the database file name before opening
  guard sqlite3_open(groupContainerURL!.path + "/" + DATABASE_NAME, &db) == SQLITE_OK else {
    print("error opening database")
    sqlite3_close(db)
    db = nil
    return
  }
}

/**
 Close the shared database once you're done with all operations.
 Helps prevent memory leaks and connection leaks
 */
func closeDB() {
  // If the database is already closed, skip
  if (db == nil) {
    return
  }
  sqlite3_close(db)
  db = nil
}

/**
 Convert a string to a dictionary
 */
func convertToDictionary(text: String) -> [String: Any]? {
  if let data = text.data(using: .utf8) {
    do {
      return try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
    } catch {
      print(error.localizedDescription)
    }
  }
  return nil
}

func urlSafeBase64ToData(_ urlSafeBase64String: String) -> Data {
  var base64String = urlSafeBase64String
    .replacingOccurrences(of: "-", with: "+")
    .replacingOccurrences(of: "_", with: "/")
  
  // Add padding if necessary
  let paddingLength = base64String.count % 4
  if paddingLength > 0 {
    base64String += String(repeating: "=", count: 4 - paddingLength)
  }
  
  // Decode Base64 string to Data
  if let data = Data(base64Encoded: base64String) {
    return data
  } else {
    // Data decoding failed
    return Data(base64Encoded: "")!
  }
}

func decryptAES_CBC(encryptedData: Data, key: Data, iv: Data) -> Data? {
  // Define variables
  var decryptedData = Data(count: encryptedData.count)
  var numBytesDecrypted = 0
  let decryptOperation = CCOperation(kCCDecrypt)
  let algorithm = CCAlgorithm(kCCAlgorithmAES)
  let options = CCOptions(kCCOptionPKCS7Padding)
  
  // Decrypt data
  let status = key.withUnsafeBytes { keyBytes in
    iv.withUnsafeBytes { ivBytes in
      encryptedData.withUnsafeBytes { encryptedBytes in
        decryptedData.withUnsafeMutableBytes { decryptedBytes in
          CCCrypt(
            decryptOperation,
            algorithm,
            options,
            keyBytes.baseAddress,
            key.count,
            ivBytes.baseAddress,
            encryptedBytes.baseAddress,
            encryptedData.count,
            decryptedBytes.baseAddress,
            encryptedData.count,
            &numBytesDecrypted
          )
        }
      }
    }
  }
  
  // Check for errors
  guard status == kCCSuccess else {
    print("Decryption error: \(status)")
    return nil
  }
  
  // Adjust length
  decryptedData.count = numBytesDecrypted
  return decryptedData
}

func hexToData(_ hexString: String) -> Data? {
  var hex = hexString
  
  // Remove any spaces or non-hex characters
  hex = hex.replacingOccurrences(of: " ", with: "")
  hex = hex.replacingOccurrences(of: "\n", with: "")
  hex = hex.replacingOccurrences(of: "\r", with: "")
  hex = hex.replacingOccurrences(of: "\t", with: "")
  
  // Ensure even length
  guard hex.count % 2 == 0 else { return nil }
  
  // Convert hex to bytes
  var data = Data(capacity: hex.count / 2)
  var index = hex.startIndex
  while index < hex.endIndex {
    let nextIndex = hex.index(index, offsetBy: 2)
    if let byte = UInt8(hex[index..<nextIndex], radix: 16) {
      data.append(byte)
    } else {
      return nil
    }
    index = nextIndex
  }
  
  return data
}

func cacheTriggerMessage(_ triggerMessage: String) {
  openDB()
  var statement: OpaquePointer?
  // Prepare a statement to save a message
  if sqlite3_prepare_v2(db, "INSERT INTO unprocessedMessages (unprocessedMessage) VALUES (?) ;", -1, &statement, nil) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("error preparing insert: \(errmsg)")
  }
  if sqlite3_bind_text(
    statement,
    1,
    triggerMessage,
    -1,
    // Tells the function to make a copy of the message while preparing the statement
    unsafeBitCast(-1, to: sqlite3_destructor_type.self) // SQLITE_TRANSIENT
  ) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("failure binding foo: \(errmsg)")
  }
  // Execute the statement
  sqlite3_step(statement)
  
  // Finalize the statement to commit and free any memory
  if sqlite3_finalize(statement) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("error finalizing prepared statement: \(errmsg)")
  }
  
  closeDB()
}

/**
 Extract the shared secret for a line chat based on the chatId
 */
func getSharedSecretForLineChat(_ chatId: String) -> String{
  openDB()
  // Pointer to the statement to execute
  var statement: OpaquePointer?
  // Prepare a statement to get the chat's name
  if sqlite3_prepare_v2(db, "SELECT sharedSecret FROM (lines JOIN cryptoData on lines.cryptoId = cryptoData.cryptoId) WHERE lines.lineId = ? ;", -1, &statement, nil) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("error preparing insert: \(errmsg)")
    return ""
  }
  
  // Set the chatId in the query to execute
  if sqlite3_bind_text(
    statement,
    1,
    chatId,
    -1,
    // Tells the function to make a copy of chatId while preparing the statement
    unsafeBitCast(-1, to: sqlite3_destructor_type.self) // SQLITE_TRANSIENT
  ) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("failure binding foo: \(errmsg)")
  }
  
  var sharedSecret: String = ""
  // Step through results for possible names
  while sqlite3_step(statement) == SQLITE_ROW {
    if let cString = sqlite3_column_text(statement, 0) {
      sharedSecret = String(cString: cString) // Replace the default name with one that actually works
      print("sharedSecret = \(sharedSecret)")
    } else {
      print("shared secret not found")
    }
  }
  // Finish running the statement
  if sqlite3_finalize(statement) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("error finalizing prepared statement: \(errmsg)")
  }
  
  closeDB()
  // Convert the shared secret to binary data
  return sharedSecret
}


func getSharedSecretForGroupMember(_ chatId: String, _ memberId: String) -> String {
  openDB()
  // Pointer to the statement to execute
  var statement: OpaquePointer?
  // Prepare a statement to get the chat's name
  if sqlite3_prepare_v2(db, "SELECT sharedSecret FROM (groupMembers JOIN cryptoData on groupMembers.cryptoId = cryptoData.cryptoId) WHERE groupMembers.groupId = ? AND groupMembers.memberId = ?;", -1, &statement, nil) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("error preparing insert: \(errmsg)")
    return ""
  }
  // Set the chatId in the query to execute
  if sqlite3_bind_text(
    statement,
    1,
    chatId,
    -1,
    // Tells the function to make a copy of chatId while preparing the statement
    unsafeBitCast(-1, to: sqlite3_destructor_type.self) // SQLITE_TRANSIENT
  ) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("failure binding foo: \(errmsg)")
  }
  
  if sqlite3_bind_text(
    statement,
    2,
    memberId,
    -1,
    // Tells the function to make a copy of chatId while preparing the statement
    unsafeBitCast(-1, to: sqlite3_destructor_type.self) // SQLITE_TRANSIENT
  ) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("failure binding foo: \(errmsg)")
  }
  
  
  var sharedSecret: String = "No Shared Secret"  // A default name to use
  // Step through results for possible names
  while sqlite3_step(statement) == SQLITE_ROW {
    if let cString = sqlite3_column_text(statement, 0) {
      sharedSecret = String(cString: cString) // Replace the default name with one that actually works
      print("sharedSecret = \(sharedSecret)")
    } else {
      print("shared secret not found")
    }
  }
  // Finish running the statement
  if sqlite3_finalize(statement) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("error finalizing prepared statement: \(errmsg)")
  }
  
  closeDB()
  // Convert the shared secret to binary data
  return sharedSecret
}

/**
 Get the name of a chat from the chatId from the lines table
 */
func getChatName(_ chatId: String) throws -> String {
  openDB()
  // Pointer to the statement to execute
  var statement: OpaquePointer?
  // Prepare a statement to get the chat's name
  if sqlite3_prepare_v2(db, "SELECT COALESCE(contacts.name, groups.name) AS name FROM (connections LEFT JOIN lines on connections.routingId = lines.lineId) LEFT JOIN contacts on contacts.pairHash = connections.pairHash LEFT JOIN groups on groups.groupId = connections.routingId WHERE COALESCE(lines.lineId, groups.groupId) = ?  ;", -1, &statement, nil) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("error preparing insert: \(errmsg)")
    return ""
  }
  
  // Set the chatId in the query to execute
  if sqlite3_bind_text(
    statement,
    1,
    chatId,
    -1,
    // Tells the function to make a copy of chatId while preparing the statement
    unsafeBitCast(-1, to: sqlite3_destructor_type.self) // SQLITE_TRANSIENT
  ) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("failure binding foo: \(errmsg)")
  }
  
  var name: String = "New contact"  // A default name to use
  // Step through results for possible names
  while sqlite3_step(statement) == SQLITE_ROW {
    if let cString = sqlite3_column_text(statement, 0) {
      name = String(cString: cString) // Replace the default name with one that actually works
      print("name = \(name)")
    } else {
      print("name not found")
    }
  }
  // Finish running the statement
  if sqlite3_finalize(statement) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("error finalizing prepared statement: \(errmsg)")
  }
  
  
  closeDB()
  return name
}

func getGroupMemberName(_ chatId: String, _ memberId: String) -> String {
  openDB()
  // Pointer to the statement to execute
  var statement: OpaquePointer?
  // Prepare a statement to get the chat's name
  if sqlite3_prepare_v2(db, "SELECT contacts.name FROM groupMembers LEFT JOIN contacts ON contacts.pairHash = groupMembers.pairHash WHERE groupId = ? AND memberId = ?;", -1, &statement, nil) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("error preparing insert: \(errmsg)")
    return ""
  }
  
  // Set the chatId in the query to execute
  if sqlite3_bind_text(
    statement,
    1,
    chatId,
    -1,
    // Tells the function to make a copy of chatId while preparing the statement
    unsafeBitCast(-1, to: sqlite3_destructor_type.self) // SQLITE_TRANSIENT
  ) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("failure binding foo: \(errmsg)")
  }
  
  // Bind the memberId to the query
  if sqlite3_bind_text(
    statement,
    2,
    memberId,
    -1,
    // Tells the function to make a copy of chatId while preparing the statement
    unsafeBitCast(-1, to: sqlite3_destructor_type.self) // SQLITE_TRANSIENT
  ) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("failure binding foo: \(errmsg)")
  }

  
  var name: String = "New contact"  // A default name to use
  // Step through results for possible names
  while sqlite3_step(statement) == SQLITE_ROW {
    if let cString = sqlite3_column_text(statement, 0) {
      name = String(cString: cString) // Replace the default name with one that actually works
      print("name = \(name)")
    } else {
      print("name not found")
    }
  }
  // Finish running the statement
  if sqlite3_finalize(statement) != SQLITE_OK {
    let errmsg = String(cString: sqlite3_errmsg(db)!)
    print("error finalizing prepared statement: \(errmsg)")
  }
  
  
  closeDB()
  return name
}



func decryptTriggerMessage(_ trigger: String?, sharedSecret: String) throws -> String {
  
  let key = hexToData(sharedSecret)
  if (nil == key) {
    return ""
  }
  
  if nil == trigger {
    return ""
  }
  print("key = \(key!)")
  let messageDict = convertToDictionary(text: trigger!)
  if nil == messageDict || nil == messageDict!["messageContent"] {
    return ""
  }
  guard let messageContent = messageDict!["messageContent"] else {
    return ""
  }
  guard let encryptedContentString = (messageContent as! [String: String])["encryptedContent"] else {
    return ""
  }
  let encryptedData = urlSafeBase64ToData(encryptedContentString)
  print("encrypted data = \(encryptedData)")
  let plaintext = decryptAES_CBC(encryptedData: encryptedData.suffix(from: 16), key: key!, iv: encryptedData.prefix(through: 16))
  return String(data: plaintext!, encoding: .utf8)!
}

let contentPrefix: [Int: String] = [
  3:  "📷 ",
  4:  "🎥 ",
  5:  "📎 ",
  11: "👤 ",
  12: "👤 ",
  21: "🔊 ",
  18: "Reacted ",
]
let contentDefaultText: [Int: String] = [
  3:  "Image",
  4:  "Video",
  5:  "File",
  11: "Sent you a contact",
  12: "Requested a Port to share your contact",
  21: "Audio",
]
let defaultBodyText = "Open app to see new secure messages"
func notificationBodyFromPlaintextMessage(_ messageString: String) -> String {
  // This section maps content type ints to readable strings. Proxy for enums.
  if "" == messageString {
    return defaultBodyText
  }
  let message = convertToDictionary(text: messageString)!
  let contentType = message["contentType"] as! Int
  let prefix: String = contentPrefix[contentType] ?? ""
  let data = message["data"] as! [String: Any]
  if (18 == contentType) { // This is a reaction, which deviates from the regular flow
    let reaction = data["reaction"] as? String
    return prefix + (reaction ?? "")
  }
  let providedText = data["text"] as? String
  if (nil != providedText && "" != providedText) {
    return prefix + (providedText!)
  }
  let previewText = contentDefaultText[contentType] ?? defaultBodyText
  return prefix + previewText
}


let defaultMessageText = "You have new messages"
import UserNotifications

class NotificationService: UNNotificationServiceExtension {
  
  var contentHandler: ((UNNotificationContent) -> Void)?
  var bestAttemptContent: UNMutableNotificationContent?
  
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    self.contentHandler = contentHandler
    bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
    var providedSource: String
    if (request.content.userInfo["source"] != nil) {
      providedSource = request.content.userInfo["source"] as! String
    } else {
      // There was no source specified, so default to the server message.
      contentHandler(bestAttemptContent!)
      return
    }
    
    var providedMember: String? = nil
    if request.content.userInfo["member"] != nil {
      providedMember = request.content.userInfo["member"] as! String
    }
    
    var triggerMessage: String
    if (request.content.userInfo["trigger"] != nil) {
      triggerMessage = request.content.userInfo["trigger"] as! String
    } else {
      triggerMessage = "no trigger"
    }
    
    if let bestAttemptContent = bestAttemptContent {
      // Modify the notification content here...
      do {
        try bestAttemptContent.title = getChatName(providedSource)
      } catch {
        // Revert to server title
      }
      var sharedSecret: String
      if providedMember == nil {
        sharedSecret = getSharedSecretForLineChat(providedSource)
      } else {
        sharedSecret = getSharedSecretForGroupMember(providedSource, providedMember as! String)
        let groupMemberName = getGroupMemberName(providedSource, providedMember as! String)
        bestAttemptContent.subtitle = groupMemberName
      }
      var plaintextMessage: String
      do {
        try plaintextMessage = decryptTriggerMessage(triggerMessage, sharedSecret: sharedSecret)
      } catch {
        plaintextMessage = ""
      }
      bestAttemptContent.body = notificationBodyFromPlaintextMessage(plaintextMessage)
      let defaults = UserDefaults(suiteName: GROUP_IDENTIFIER)
      let maybeCount: Int? = defaults?.value(forKey: "count") as? Int
      var count: Int;
      if maybeCount == nil{
        count = 1
      } else {
        count = maybeCount!
      }
      bestAttemptContent.badge = NSNumber(value: count)
      count = count + 1
      defaults?.set(count, forKey: "count")
      contentHandler(bestAttemptContent)
      // Save the trigger message so that the app can process messages
      // while waiting for the API to return when opened
      cacheTriggerMessage(triggerMessage)
    }
  }
  
  override func serviceExtensionTimeWillExpire() {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    // In the case that we are about to time out, we default to the server title and body by NOT calling contentHandler and allowing the system to take over managing the notification.
  }
}
