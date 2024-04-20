//
//  NotificationService.swift
//  portnse
//  Mutate remote messages with potential mutable content
//
//  Created by Abhinav on 2024-04-20.
//

// TODO clean this file up
import Foundation
let GROUP_IDENTIFIER = "group.tech.numberless.port"

func getLocalSyncFileURL() -> URL? {
  var groupContainerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: GROUP_IDENTIFIER)
  print(groupContainerURL?.path ?? "no path found")
  do {
      print(try FileManager().contentsOfDirectory(atPath: groupContainerURL?.path ?? "None"))
  
    } catch (let msg){print(msg)}
  groupContainerURL = groupContainerURL?.appendingPathComponent("/syncFile.json/")
  return groupContainerURL
}

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


let defaultMessageText = "You have new messages"

func getNotificationTitleNameFromChatId(_ chatId: String) -> String {
  guard let location = getLocalSyncFileURL() else { return "Couldn't find sync file" }
  guard var fileContent = try? String(contentsOf: location) else {return defaultMessageText}
  let mapper = convertToDictionary(text: fileContent)
  if (mapper == nil){
    return defaultMessageText
  }
  let potentialTitle = (mapper ?? [String: String]())[chatId]
  print(potentialTitle)
  return potentialTitle as! String? ?? defaultMessageText
}

import UserNotifications

class NotificationService: UNNotificationServiceExtension {

    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?

    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        print("doing things in nse")
      self.contentHandler = contentHandler
      bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
      var providedSource: String
      if (request.content.userInfo["source"] != nil) {
        providedSource = request.content.userInfo["source"] as! String
      } else {
        providedSource = "no source"
      }
      if let bestAttemptContent = bestAttemptContent {
            // Modify the notification content here...
        bestAttemptContent.title = "\(getNotificationTitleNameFromChatId(providedSource))"
        contentHandler(bestAttemptContent)
        bestAttemptContent.body = "Open app to see new secure messages"
      }
    }
    
    override func serviceExtensionTimeWillExpire() {
        // Called just before the extension will be terminated by the system.
        // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
        if let contentHandler = contentHandler, let bestAttemptContent =  bestAttemptContent {
            contentHandler(bestAttemptContent)
        }
    }

}
