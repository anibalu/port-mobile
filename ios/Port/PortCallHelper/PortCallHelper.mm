#import <AVFoundation/AVFoundation.h>
#import "PortCallHelper.h"
#import <React/RCTLog.h>
#import <CallKit/CallKit.h>
#import <CallKit/CXProvider.h>
#import <AVKit/AVKit.h>
#import <React/RCTEventEmitter.h>
#import <ReactCommon/RCTTurboModule.h>
// Declare a static variable for the shared controller instance
static CXCallController *sharedCallController = nil;
// Declare a static variable for the shared provider instance
static CXProvider *sharedProvider = nil;
// Declare a static instance of the helper for delegate purposes
static PortCallHelper *sharedHelper = nil;

@interface PortCallHelper() <CXProviderDelegate>
@end

@implementation PortCallHelper

// Private initializer for the singleton instance
- (instancetype)initInstance {
    NSLog(@"[PortCallHelper] Initializing PortCallHelper singleton instance.");
    self = [super init];
    return self;
}

// Public init method always returns the shared helper
- (instancetype)init {
    return [PortCallHelper sharedHelper];
}

RCT_EXPORT_MODULE(NativeCallHelperModule);

// Class method to get the shared PortCallHelper instance
+ (instancetype)sharedHelper {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        // Call the private initializer within dispatch_once
        sharedHelper = [[self alloc] initInstance];
    });
    return sharedHelper;
}

// Class method to get the shared CXCallController instance
+ (CXCallController *)sharedCallController {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedCallController = [[CXCallController alloc] init];
    });
    return sharedCallController;
}

// Class method to get the shared CXProvider instance
+ (CXProvider *)sharedProvider {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        CXProviderConfiguration *configuration = [[CXProviderConfiguration alloc] init]; 
        configuration.supportsVideo = YES;
        configuration.maximumCallsPerCallGroup = 1;
        configuration.supportedHandleTypes = [NSSet setWithObject:[NSNumber numberWithInt:CXHandleTypeGeneric]];
        
        configuration.iconTemplateImageData = nil; // TODO: Set the app icon image data
        configuration.ringtoneSound = nil; // Use the efault ringtone
        
        sharedProvider = [[CXProvider alloc] initWithConfiguration:configuration];
        
        // Use the sharedHelper instance as the delegate
        [sharedProvider setDelegate:[PortCallHelper sharedHelper] queue:dispatch_get_main_queue()];
    });
    return sharedProvider;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeCallHelperModuleSpecJSI>(params);
}


RCT_EXPORT_METHOD(startOutgoingCall:(NSString *)callUUID callerName:(NSString *)callerName)
{
  NSLog(@"[PortCallHelper] startOutgoingCall received: %@ for recipient: %@", callUUID, callerName);

  NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:callUUID];
  if (!uuid) {
    NSLog(@"[PortCallHelper] Invalid UUID string for startOutgoingCall: %@", callUUID);
    return;
  }
  CXHandle *handle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:callerName];
  CXStartCallAction *startAction = [[CXStartCallAction alloc] initWithCallUUID:uuid handle:handle];
  startAction.video = YES;
  CXTransaction *transaction = [[CXTransaction alloc] initWithAction:startAction];
  CXCallController *callController = [PortCallHelper sharedCallController];

  [callController requestTransaction:transaction completion:^(NSError * _Nullable error) {
    if (error) {
      NSLog(@"[PortCallHelper] Error requesting transaction to start call %@: %@", callUUID, error.localizedDescription);
    } else {
      NSLog(@"[PortCallHelper] Transaction requested successfully for starting call %@", callUUID);
    }
  }];
}

RCT_EXPORT_METHOD(acceptIncomingCall:(NSString *)callUUID)
{
  NSLog(@"[PortCallHelper] acceptIncomingCall received: %@", callUUID);

  NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:callUUID];
  if (!uuid) {
    NSLog(@"[PortCallHelper] Invalid UUID string: %@", callUUID);
    return;
  }

  // Get the shared CXProvider and send a direct update before creating a transaction
  CXProvider *provider = [PortCallHelper sharedProvider];
  CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
  callUpdate.hasVideo = YES;
  [provider reportCallWithUUID:uuid updated:callUpdate];
  
  // Create CallKit action and transaction
  CXAnswerCallAction *answerAction = [[CXAnswerCallAction alloc] initWithCallUUID:uuid];
  CXTransaction *transaction = [[CXTransaction alloc] initWithAction:answerAction];

  // Get the shared CXCallController instance using the class method
  CXCallController *callController = [PortCallHelper sharedCallController];

  // Request the transaction using the shared instance
  [callController requestTransaction:transaction completion:^(NSError * _Nullable error) {
    if (error) {
      NSLog(@"[PortCallHelper] Error requesting transaction to answer call %@: %@", callUUID, error.localizedDescription);
    } else {
      NSLog(@"[PortCallHelper] Transaction requested successfully for answering call %@", callUUID);
    }
  }];
}

- (void)displayIncomingCall:(NSString *)callerName callUUID:(NSString *)callUUID
{
  NSLog(@"[PortCallHelper] reportIncomingCall received: Caller Name - %@, UUID - %@", callerName, callUUID);

  NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:callUUID];
  if (!uuid) {
    NSLog(@"[PortCallHelper] Invalid UUID string: %@", callUUID);
    return;
  }

  CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
  callUpdate.remoteHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:callerName];
  callUpdate.localizedCallerName = callerName;
  callUpdate.hasVideo = YES;
  callUpdate.supportsHolding = NO;
  callUpdate.supportsDTMF = NO;
  callUpdate.supportsGrouping = NO;
  callUpdate.supportsUngrouping = NO;

  // Get shared provider instance and report the call
  CXProvider *provider = [PortCallHelper sharedProvider];
  [provider reportNewIncomingCallWithUUID:uuid update:callUpdate completion:^(NSError * _Nullable error) {
    if (error) {
      NSLog(@"[PortCallHelper] Error reporting incoming call: %@", error.localizedDescription);
    } else {
      NSLog(@"[PortCallHelper] Incoming call reported successfully for UUID: %@", callUUID);
    }
  }];
}

RCT_EXPORT_METHOD(rejectIncomingCall:(NSString *)callUUID)
{
  NSLog(@"[PortCallHelper] rejectIncomingCall received: %@", callUUID);
  NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:callUUID];
  if (!uuid) {
    NSLog(@"[PortCallHelper] Invalid UUID string for rejectIncomingCall: %@", callUUID);
    return;
  }

  CXEndCallAction *endAction = [[CXEndCallAction alloc] initWithCallUUID:uuid];
  CXTransaction *transaction = [[CXTransaction alloc] initWithAction:endAction];
  CXCallController *callController = [PortCallHelper sharedCallController];

  [callController requestTransaction:transaction completion:^(NSError * _Nullable error) {
    if (error) {
      NSLog(@"[PortCallHelper] Error requesting transaction to reject call %@: %@", callUUID, error.localizedDescription);
    } else {
      NSLog(@"[PortCallHelper] Transaction requested successfully for rejecting call %@", callUUID);
      CXProvider *provider = [PortCallHelper sharedProvider];
      [provider reportCallWithUUID:uuid endedAtDate:[NSDate date] reason:CXCallEndedReasonDeclinedElsewhere];
    }
  }];
}

RCT_EXPORT_METHOD(endOngoingCall:(NSString *)callUUID)
{
  NSLog(@"[PortCallHelper] endOngoingCall received: %@", callUUID);
  NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:callUUID];
  if (!uuid) {
    NSLog(@"[PortCallHelper] Invalid UUID string for endOngoingCall: %@", callUUID);
    return;
  }
  CXEndCallAction *endAction = [[CXEndCallAction alloc] initWithCallUUID:uuid];
  CXTransaction *transaction = [[CXTransaction alloc] initWithAction:endAction];
  CXCallController *callController = [PortCallHelper sharedCallController];

  [callController requestTransaction:transaction completion:^(NSError * _Nullable error) {
    if (error) {
      NSLog(@"[PortCallHelper] Error requesting transaction to end call %@: %@", callUUID, error.localizedDescription);
    } else {
      NSLog(@"[PortCallHelper] Transaction requested successfully for ending call %@", callUUID);
      CXProvider *provider = [PortCallHelper sharedProvider];
      [provider reportCallWithUUID:uuid endedAtDate:[NSDate date] reason:CXCallEndedReasonRemoteEnded];
    }
  }];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(NSString *, didAnswerCall:(NSString *)callUUID)
{
  NSLog(@"[PortCallHelper] Check call state for UUID: %@", callUUID);

  NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:callUUID];
  if (!uuid) {
    NSLog(@"[PortCallHelper] Invalid UUID string for didAnswerCall: %@", callUUID);
    return @"declined";
  }

  CXCallController *callController = [PortCallHelper sharedCallController];

  // Check the calls in the call observer
  for (CXCall *call in callController.callObserver.calls) {
    if ([call.UUID isEqual:uuid]) {
      // Check if the call is connected (answered) and not ended
      if (call.hasConnected && !call.hasEnded) {
        NSLog(@"[PortCallHelper] Call %@ is answered.", callUUID);
        return @"answered"; 
      } else if (!call.hasConnected && !call.hasEnded) {
        // Call exists but is not yet connected (e.g., ringing incoming or dialing outgoing)
        NSLog(@"[PortCallHelper] Call %@ is pending (connected: %d, ended: %d).", callUUID, call.hasConnected, call.hasEnded);
        return @"pending";
      } else {
        // Call has ended or is in an unexpected state, treat as declined/ended
        NSLog(@"[PortCallHelper] Call %@ found but has ended or is in an unexpected state (connected: %d, ended: %d). Treating as declined.", callUUID, call.hasConnected, call.hasEnded);
        return @"declined";
      }
    }
  }

  NSLog(@"[PortCallHelper] No call found with UUID: %@", callUUID);
  return @"declined";
}

RCT_EXPORT_METHOD(displayIncomingCall:(NSString *)callerName callUUID:(NSString *)callUUID callRingTimeSeconds:(double)callRingTimeSeconds)
{
  NSLog(@"[PortCallHelper] skipping since on iOS: displayIncomingCall: Caller Name - %@, UUID - %@, Ring Time - %ld", callerName, callUUID, (long)callRingTimeSeconds);
}

// MARK: - CXProviderDelegate Methods

- (void)provider:(CXProvider *)provider performAnswerCallAction:(CXAnswerCallAction *)action {
  NSLog(@"[PortCallHelper] Provider received request to answer call: %@", action.callUUID);

  // Configure audio session
  AVAudioSession *audioSession = [AVAudioSession sharedInstance];
  NSError *error = nil;
  if (![audioSession setCategory:AVAudioSessionCategoryPlayAndRecord
                            mode:AVAudioSessionModeVoiceChat
                         options:AVAudioSessionCategoryOptionAllowBluetooth
                           error:&error]) {
    NSLog(@"[PortCallHelper] Error setting audio session category and mode: %@", error);
    [action fail]; // Fail the action if session can't be configured
    return;
  }

  // Activate the audio session. CallKit might also attempt to activate it,
  // but explicitly activating here ensures it's ready.
  if (![audioSession setActive:YES error:&error]) {
      NSLog(@"[PortCallHelper] Error activating audio session: %@", error);
      // Depending on the error, you might want to fail the action
      // For now, we'll log and proceed, as CallKit might still recover or manage activation.
  }


  NSString *callUUIDString = [action.callUUID UUIDString];

  // Emit event to JavaScript
  [self emitOnAccept:@{@"callUUID": callUUIDString}];

  [action fulfill];
  NSLog(@"[PortCallHelper] Answer call action fulfilled for: %@", action.callUUID);
}

- (void)provider:(CXProvider *)provider performEndCallAction:(CXEndCallAction *)action {
  NSLog(@"[PortCallHelper] Provider received request to end call: %@", action.callUUID);

  NSString *callUUIDString = [action.callUUID UUIDString];

  // Emit event to JavaScript
  [self emitOnEnd:@{@"callUUID": callUUIDString}];

  [action fulfill];
  NSLog(@"[PortCallHelper] End call action fulfilled for: %@", action.callUUID);

  // Deactivate audio session
  AVAudioSession *audioSession = [AVAudioSession sharedInstance];
  NSError *error = nil;
  if (![audioSession setActive:NO withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation error:&error]) {
    NSLog(@"[PortCallHelper] Error deactivating audio session: %@", error.localizedDescription);
  } else {
    NSLog(@"[PortCallHelper] Audio session deactivated successfully after call end.");
  }
}

- (void)provider:(CXProvider *)provider performSetHeldCallAction:(CXSetHeldCallAction *)action {
  NSLog(@"[PortCallHelper] Provider received request to set hold (%@) for call: %@", action.isOnHold ? @"ON" : @"OFF", action.callUUID);

  // We don't support holding calls on iOS yet

  [action fulfill];
  NSLog(@"[PortCallHelper] Hold action fulfilled for: %@", action.callUUID);
}

- (void)provider:(CXProvider *)provider performSetMutedCallAction:(CXSetMutedCallAction *)action {
  NSLog(@"[PortCallHelper] Provider received request to set mute (%@) for call: %@", action.isMuted ? @"ON" : @"OFF", action.callUUID);

  NSString *callUUIDString = [action.callUUID UUIDString];
  BOOL isMuted = action.isMuted;

  // Emit event to JavaScript
  [self emitOnMute:@{@"callUUID": callUUIDString, @"muted": @(isMuted)}];

  [action fulfill];
  NSLog(@"[PortCallHelper] Mute action fulfilled for: %@", action.callUUID);
}

- (void)provider:(CXProvider *)provider performStartCallAction:(CXStartCallAction *)action {
    NSLog(@"[PortCallHelper] Provider received request to start call: %@", action.callUUID);

    // Configure audio session
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    NSError *error = nil;
    if (![audioSession setCategory:AVAudioSessionCategoryPlayAndRecord
                              mode:AVAudioSessionModeVoiceChat
                           options:AVAudioSessionCategoryOptionAllowBluetooth
                             error:&error]) {
        NSLog(@"[PortCallHelper] Error setting audio session category and mode for start call: %@", error);
        [action fail];
        return;
    }

    // Activate the audio session.
    if (![audioSession setActive:YES error:&error]) {
        NSLog(@"[PortCallHelper] Error activating audio session for start call: %@", error);
        // Proceeding, but this might indicate an issue.
    }

    [provider reportOutgoingCallWithUUID:action.callUUID startedConnectingAtDate:[NSDate date]];
    // Simulate connection after a short delay for now.
    // TODO: Remove this once we have a real connection management system
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [provider reportOutgoingCallWithUUID:action.callUUID connectedAtDate:[NSDate date]];
        [action fulfill];
        NSLog(@"[PortCallHelper] Start call action fulfilled for: %@", action.callUUID);
    });
}

- (void)providerDidReset:(CXProvider *)provider {
  NSLog(@"[PortCallHelper] Provider did reset. Cleaning up calls.");
  
  // Reset audio session
  AVAudioSession *audioSession = [AVAudioSession sharedInstance];
  NSError *audioError = nil;
  [audioSession setActive:NO withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation error:&audioError];
  if (audioError) {
    NSLog(@"[PortCallHelper] Error deactivating audio session: %@", audioError.localizedDescription);
  }
}

- (void)provider:(CXProvider *)provider didActivateAudioSession:(AVAudioSession *)audioSession {
    NSLog(@"[PortCallHelper] Provider activated audio session.");
}

- (void)provider:(CXProvider *)provider didDeactivateAudioSession:(AVAudioSession *)audioSession {
    NSLog(@"[PortCallHelper] Provider deactivated audio session.");
}

- (void)provider:(CXProvider *)provider timedOutPerformingAction:(CXAction *)action {
    NSLog(@"[PortCallHelper] Timed out performing action: %@", action);
    
    if ([action respondsToSelector:@selector(fail)]) {
        [action fail];
    }
}

// Method to get available audio routes
RCT_EXPORT_METHOD(getAudioRoutes:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject)
{
  // For now we only support speakerphone and earpiece. Extend to support Bluetooth and other routes.
  resolve(@[@"Speakerphone", @"Earpiece"]);
}

// Method to set a specific audio route based on portName
RCT_EXPORT_METHOD(setAudioRoute:(NSString *)route)
{
  NSLog(@"[PortCallHelper] setAudioRoute called with route: %@", route);
  
  dispatch_async(dispatch_get_main_queue(), ^{
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    NSError *error = nil;
    AVAudioSessionPortOverride portOverride = AVAudioSessionPortOverrideNone;
    
    if ([route isEqualToString:@"Speakerphone"]) {
      portOverride = AVAudioSessionPortOverrideSpeaker;
      NSLog(@"[PortCallHelper] Setting audio output to speaker.");
    } else {
      portOverride = AVAudioSessionPortOverrideNone; // Use default/built-in receiver
      NSLog(@"[PortCallHelper] Setting audio output to default receiver.");
    }
    
    // Set the override
    if (![audioSession overrideOutputAudioPort:portOverride error:&error]) {
      NSLog(@"[PortCallHelper] Error overriding audio port: %@", error.localizedDescription);
    } else {
      NSLog(@"[PortCallHelper] Successfully set audio route to: %@", route);
    }
  });
}

/*
 * On iOS, we don't need to cancel the ringtone. It will naturally stop when the call is answered or declined.
 */
RCT_EXPORT_METHOD(cancelRingtone)
{
  NSLog(@"[PortCallHelper] skipping since on iOS: cancelRingtone");
}

RCT_EXPORT_METHOD(startKeepPhoneAwake)
{
  NSLog(@"[PortCallHelper] Starting to keep phone awake.");
  dispatch_async(dispatch_get_main_queue(), ^{
    if (![[UIApplication sharedApplication] isIdleTimerDisabled]) {
        [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
        NSLog(@"[PortCallHelper] Idle timer disabled.");
    } else {
        NSLog(@"[PortCallHelper] Idle timer already disabled.");
    }
  });
}

RCT_EXPORT_METHOD(endKeepPhoneAwake)
{
  NSLog(@"[PortCallHelper] Ending keeping phone awake.");
  dispatch_async(dispatch_get_main_queue(), ^{
    if ([[UIApplication sharedApplication] isIdleTimerDisabled]) {
        [[UIApplication sharedApplication] setIdleTimerDisabled:NO];
        NSLog(@"[PortCallHelper] Idle timer enabled.");
    } else {
        NSLog(@"[PortCallHelper] Idle timer already enabled (was not disabled by us or was already re-enabled).");
    }
  });
}

@end
