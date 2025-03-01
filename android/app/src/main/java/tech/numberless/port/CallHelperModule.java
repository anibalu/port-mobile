package tech.numberless.port;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Person;
import android.content.Intent;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import android.media.RingtoneManager;

import java.util.Random;

/**
 * This file is a fucking monolith. At the very least, we should be able to move
 * out the notification
 * generation stuff
 */
public class CallHelperModule extends ReactContextBaseJavaModule {
    private static MediaPlayer activeMediaPlayer;

    CallHelperModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "CallHelperModule";
    }

    private final String CHANNEL_ID = "call_channel_high_priority";

    @ReactMethod
    public void getCallAnswerInfo(Promise promise) {
        if (getCurrentActivity() == null) { // This should never happen
            Log.e("CallAnswerInfo", "Activity is null, cannot get Intent.");
            promise.reject("No activity", "No activity");
            return;
        }
        Intent answerIntent = getCurrentActivity().getIntent();
        if (answerIntent == null) { // This will happen when app is foregrounded.

            promise.reject("No intent", "No intent");
            return;
        }
        if (answerIntent.hasExtra("callNotificationResult")) {
            WritableMap callData = Arguments.createMap();
            // If a call was answered, we resolve the promise with metadata about the call
            callData.putString("intentResult", answerIntent.getStringExtra("callNotificationResult"));
            callData.putString("callId", answerIntent.getStringExtra("callId"));
            Log.d("CallAnswerInfo", callData.toString());
            promise.resolve(callData);
        } else {
            promise.reject("No intent result", "No intent result");
        }
    }

    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is not in the Support Library.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Calls";
            String description = "Channel to receive Port call notifications";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableVibration(true);
            long[] vibrationPattern = { 0, 100, 250, 100, 100, 100, 200, 250, 250, 200, 200, 200, 200 };
            channel.setVibrationPattern(vibrationPattern);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            // Register the channel with the system. You can't change the importance
            // or other notification behaviors after this.
            NotificationManager notificationManager = this.getReactApplicationContext()
                    .getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @ReactMethod
    public void displayCallUI(String caller, String callId, int callRingTimeSeconds, Callback onSuccess) {
        createNotificationChannel();
        Log.d("CALL", caller);
        Person callerPerson = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            callerPerson = new Person.Builder()
                    .setName(caller)
                    .setImportant(true)
                    .build();
        }

        // When invoked, launch the app's main activity and let it know that the call
        // was answered
        Intent answerIntent = new Intent();
        answerIntent.setAction(Intent.ACTION_ANSWER);
        answerIntent.setPackage("tech.numberless.port");
        answerIntent.putExtra("callNotificationResult", "Answer");
        answerIntent.putExtra("callId", callId);
        answerIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                | Intent.FLAG_ACTIVITY_CLEAR_TOP
                | Intent.FLAG_ACTIVITY_CLEAR_TASK);

        PendingIntent pendingAnswer = PendingIntent.getActivity(
                this.getReactApplicationContext(), // Context
                1, // Request code (can be any int value, used to identify the PendingIntent)
                answerIntent, // The Intent to be executed
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE// Flags to update the PendingIntent if
                                                                                // it already exists
        );

        // When invoked, launch the app
        // Intent fullScreenIntent = new Intent(getReactApplicationContext(),
        // CallStyleActivity.class);

        // When invoked, launch the app's main activity and let it know that the call
        // was answered
        Intent declineIntent = new Intent();
        declineIntent.setAction(Intent.ACTION_ANSWER);
        declineIntent.setPackage("tech.numberless.port");
        declineIntent.putExtra("callNotificationResult", "Decline");
        declineIntent.putExtra("callId", callId);

        PendingIntent pendingDecline = PendingIntent.getActivity(
                this.getReactApplicationContext(), // Context
                2, // Request code (can be any int value, used to identify the PendingIntent)
                declineIntent, // The Intent to be executed
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE// Flags to update the PendingIntent if
                                                                                // it already exists
        );

        Intent fullScreenIntent = new Intent(getReactApplicationContext(), CallStyleActivity.class);
        fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_SINGLE_TOP |
                Intent.FLAG_ACTIVITY_CLEAR_TOP);
        fullScreenIntent.putExtra("callId", callId);
        fullScreenIntent.putExtra("caller", caller);
        fullScreenIntent.putExtra("DECLINE_INTENT", pendingDecline);
        fullScreenIntent.putExtra("ANSWER_INTENT", pendingAnswer);
        fullScreenIntent.putExtra("RING_DURATION", callRingTimeSeconds);

        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(getReactApplicationContext(), 0,
                fullScreenIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        long[] vibrationPattern = { 0, 100, 250, 100, 100, 100, 200, 250, 250, 200, 200, 200, 200 };

        Notification.Builder notificationBuilder = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            notificationBuilder = new Notification.Builder(this.getReactApplicationContext(), CHANNEL_ID)
                    .setContentIntent(fullScreenPendingIntent)
                    .setCategory(Notification.CATEGORY_CALL)
                    .setStyle(
                            Notification.CallStyle.forIncomingCall(callerPerson, pendingDecline, pendingAnswer))
                    .addPerson(callerPerson)
                    .setFullScreenIntent(fullScreenPendingIntent, true)
                    .setPriority(Notification.PRIORITY_HIGH)
                    .setSmallIcon(R.drawable.ic_small_icon)
                    .setVisibility(Notification.VISIBILITY_PUBLIC)
                    .setVibrate(vibrationPattern)
                    .setOngoing(true)
                    .setDefaults(Notification.DEFAULT_ALL)
                    .setTimeoutAfter(callRingTimeSeconds * 1000); // Set a ring timeout
        }

        playRingtone(callRingTimeSeconds);

        int notificationId = new Random().nextInt();
        Log.d("CALL", "About to notify");

        NotificationManagerCompat nm = NotificationManagerCompat.from(getReactApplicationContext());
        Log.d("CALL", "Notification manager constructed");

        nm.notify(notificationId, notificationBuilder.build());
        Log.d("CALL", "Notified");

        onSuccess.invoke();
    }

    private void playRingtone(int callRingTimeSeconds) {
        MediaPlayer mediaPlayer;
        if (null == CallHelperModule.activeMediaPlayer) {
            mediaPlayer = MediaPlayer.create(
                    getReactApplicationContext(),
                    RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE));
            // Configure to repeat
            mediaPlayer.setLooping(true);
            CallHelperModule.activeMediaPlayer = mediaPlayer;
        } else {
            mediaPlayer = CallHelperModule.activeMediaPlayer;
        }

        // Start playing
        mediaPlayer.start();
        // Loop the player until we're done with the timeout
        Handler handler = new Handler(Looper.getMainLooper());
        handler.postDelayed(this::cancelRingtone, callRingTimeSeconds * 1000);

    }

    @ReactMethod
    public void cancelRingtone() {
        Log.d("CALL", "Trying to cancel the thing");
        if (CallHelperModule.activeMediaPlayer != null) {

            CallHelperModule.activeMediaPlayer.stop();
            CallHelperModule.activeMediaPlayer.release();
            CallHelperModule.activeMediaPlayer = null;
        }
    }

}
