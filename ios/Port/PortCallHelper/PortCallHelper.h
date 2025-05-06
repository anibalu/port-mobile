#import <AppSpecs/AppSpecs.h>

NS_ASSUME_NONNULL_BEGIN

@interface PortCallHelper : NativeCallHelperModuleSpecBase <NativeCallHelperModuleSpec>
// Method to display the incoming call UI via CallKit
- (void)displayIncomingCall:(NSString *)callerName callUUID:(NSString *)callUUID;

@end 

NS_ASSUME_NONNULL_END
