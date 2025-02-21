#import "AppDelegate.h"
#import "RNBootSplash.h"
#import <Firebase.h>

#import <React/RCTBundleURLProvider.h>
// Add support for deep linking
#import <React/RCTLinkingManager.h>

#import "RNFBMessagingModule.h"
#import <TSBackgroundFetch/TSBackgroundFetch.h>
#import <UIKit/UIKit.h>
#import "RNCallKeep.h"
#import "React/RCTRootView.h"
#import "PushKit/PKPushRegistry.h"
#import "RNVoipPushNotificationManager.h"
#import "sqlite3.h"

#define GROUP_IDENTIFIER "group.tech.numberless.port"
#define DATABASE_NAME "numberless.db"


/**
 Deletes all Keychain items accessible by this app if this is the first time the user launches the app
 */
static void ClearKeychainIfNecessary() {
  // Checks wether or not this is the first time the app is run
  if ([[NSUserDefaults standardUserDefaults] boolForKey:@"HAS_RUN_BEFORE"] == NO) {
    // Set the appropriate value so we don't clear next time the app is launched
    [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"HAS_RUN_BEFORE"];
    
    NSArray *secItemClasses = @[
      (__bridge id)kSecClassGenericPassword,
      (__bridge id)kSecClassInternetPassword,
      (__bridge id)kSecClassCertificate,
      (__bridge id)kSecClassKey,
      (__bridge id)kSecClassIdentity
    ];
    
    // Maps through all Keychain classes and deletes all items that match
    for (id secItemClass in secItemClasses) {
      NSDictionary *spec = @{(__bridge id)kSecClass: secItemClass};
      SecItemDelete((__bridge CFDictionaryRef)spec);
    }
  }
}

@implementation AppDelegate
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  ClearKeychainIfNecessary();
  [FIRApp configure];
  self.moduleName = @"Port";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = [RNFBMessagingModule addCustomPropsToUserProps:nil withLaunchOptions:launchOptions];
  // Register the app for VoIP push notifications over APNS
  [RNVoipPushNotificationManager voipRegistration];
  
  // Register BackgroundFetch
  [[TSBackgroundFetch sharedInstance] didFinishLaunching];
  
  // Set up CallKeep stuff to be able to handle VoIP PushKit notifications
  // self.bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  
  [RNCallKeep setup:@{
    @"appName": @"Port",
    @"maximumCallGroups": @1,
    @"maximumCallsPerCallGroup": @1,
    @"supportsVideo": @YES,
  }];
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


// Add the ability to open a URL inside the app
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}
// And for universal linking:
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}



- (UIView *)createRootViewWithBridge:(RCTBridge *)bridge
                          moduleName:(NSString *)moduleName
                           initProps:(NSDictionary *)initProps {
  UIView *rootView = [super createRootViewWithBridge:bridge
                                          moduleName:moduleName
                                           initProps:initProps];
  
  [RNBootSplash initWithStoryboard:@"BootSplash" rootView:rootView];
  
  return rootView;
}

- (void)applicationWillEnterForeground:(UIApplication *) application {
  
  // App badge count shenanigans
  NSString *suiteName = @GROUP_IDENTIFIER;
  NSUserDefaults *suiteDefaults = [[NSUserDefaults alloc] initWithSuiteName:suiteName];
  
  [suiteDefaults setInteger:1 forKey:@"count"];
  [suiteDefaults synchronize];
  [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
  
}


- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type {
  // Register VoIP push token (a property of PKPushCredentials) with server
  NSLog(@"Updated token: ");
  NSLog(@"%@", credentials.token);
  // Convert token to a string (hex format)
  NSMutableString *tokenString = [NSMutableString string];
  const unsigned char *bytes = (const unsigned char *)credentials.token.bytes;
  for (NSUInteger i = 0; i < credentials.token.length; i++) {
    [tokenString appendFormat:@"%02x", bytes[i]];
  }
  
  NSLog(@"VoIP Token String: %@", tokenString);
  
  [RNVoipPushNotificationManager didUpdatePushCredentials:credentials forType:(NSString *)type];
}


- (void)cacheTriggerMessage:(NSString *)triggerMessage  {
  sqlite3 *db;
  sqlite3_stmt *statement;
  NSString *result = nil;
  
  NSString *containerPath = [[[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier:@GROUP_IDENTIFIER] path];
  NSString *dbPath = [containerPath stringByAppendingPathComponent:@DATABASE_NAME];
  
  // Open database
  if (sqlite3_open([dbPath UTF8String], &db) == SQLITE_OK) {
    const char *sql = "INSERT INTO unprocessedMessages (unprocessedMessage) VALUES (?) ;";
    
    // Prepare statement
    if (sqlite3_prepare_v2(db, sql, -1, &statement, NULL) == SQLITE_OK) {
      // Bind the parameter (recordID as a string)
      sqlite3_bind_text(statement, 1, [triggerMessage UTF8String], -1, SQLITE_TRANSIENT);
      
      // Execute query
      sqlite3_step(statement);
    } else {
      NSLog(@"Could not prepare the statement");
    }
    
    // Finalize statement
    if (sqlite3_finalize(statement) != SQLITE_OK)
      NSLog(@"Error caching locallu");
    
  } else {
    NSLog(@"This database is not right is busted");
  }
  
  // Close database
  sqlite3_close(db);
}


- (NSString *)getChatName:(NSString *)chatId  {
  sqlite3 *db;
  sqlite3_stmt *statement;
  NSString *result = nil;
  
  NSString *containerPath = [[[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier:@GROUP_IDENTIFIER] path];
  NSString *dbPath = [containerPath stringByAppendingPathComponent:@DATABASE_NAME];
  
  // Open database
  if (sqlite3_open([dbPath UTF8String], &db) == SQLITE_OK) {
    const char *sql = "SELECT COALESCE(contacts.name, groups.name) AS name FROM (connections LEFT JOIN lines on connections.routingId = lines.lineId) LEFT JOIN contacts on contacts.pairHash = connections.pairHash LEFT JOIN groups on groups.groupId = connections.routingId WHERE COALESCE(lines.lineId, groups.groupId) = ?  ;";
    
    // Prepare statement
    if (sqlite3_prepare_v2(db, sql, -1, &statement, NULL) == SQLITE_OK) {
      // Bind the parameter (recordID as a string)
      sqlite3_bind_text(statement, 1, [chatId UTF8String], -1, SQLITE_TRANSIENT);
      
      // Execute query
      if (sqlite3_step(statement) == SQLITE_ROW) {
        // Retrieve column value
        const char *columnText = (const char *)sqlite3_column_text(statement, 0);
        if (columnText) {
          result = [NSString stringWithUTF8String:columnText];
        }
      } else {
        NSLog(@"Done iterating over rows");
      }
    } else {
      NSLog(@"Could not prepare the statement");
    }
    
    // Finalize statement
    sqlite3_finalize(statement);
  } else {
    NSLog(@"This database is not right is busted");
  }
  
  // Close database
  sqlite3_close(db);
  
  return result;
}

- (NSString *)jsonStringFromAnyHashable:(id)anyHashable {
  if (!anyHashable) {
    return nil;
  }
  
  if ([anyHashable isKindOfClass:[NSString class]]) {
    return (NSString *)anyHashable;
  } else if ([anyHashable isKindOfClass:[NSNumber class]]) {
    return [(NSNumber *)anyHashable stringValue];
  } else if ([NSJSONSerialization isValidJSONObject:anyHashable]) {
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:anyHashable options:0 error:&error];
    
    if (!error) {
      return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }
  }
  
  return [NSString stringWithFormat:@"%@", anyHashable]; // Fallback conversion
}



- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  // Process the received push
  NSLog(@"Incoming call received at pushRegistry in app delegate");
  [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];
  
  NSString *chatId = payload.dictionaryPayload[@"aps"][@"call_from"];
  NSString *chatName = [self getChatName:chatId];
  NSLog(@"You can update the chat name to: %@", chatName);
  if (Nil == chatName) chatName = @"Incoming call";
  NSLog(@"Using name: %@", chatName);
  
  [RNCallKeep reportNewIncomingCall: payload.dictionaryPayload[@"aps"][@"call_id"]  // Setting the call Id here, let's the JS thread update the call UI when readyÏ
                             handle: chatName
                         handleType: @"generic"
                           hasVideo: YES
                localizedCallerName: chatName
                    supportsHolding: NO
                       supportsDTMF: NO
                   supportsGrouping: NO
                 supportsUngrouping: NO
                        fromPushKit: YES
                            payload: Nil
              withCompletionHandler: completion];
  
  // Converting the hashable to a json string to cache the message to be processed on JS as soon as possible
  NSString *triggerMessage = [self jsonStringFromAnyHashable:payload.dictionaryPayload[@"aps"]];
  [self cacheTriggerMessage:triggerMessage];
  
  
  
}





@end
