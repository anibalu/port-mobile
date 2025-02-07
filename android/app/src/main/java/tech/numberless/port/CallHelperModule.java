package tech.numberless.port;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Person;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.ServiceCompat;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.Callback;

import java.util.Random;

/**
 * This file is a fucking monolith. At the very least, we should be able to move out the notification
 * generation stuff
 */
public class CallHelperModule extends ReactContextBaseJavaModule {
    CallHelperModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "CallHelperModule";
    }

    private final String CHANNEL_ID = "call_channel";

    @ReactMethod
    public void getCallAnswerInfo(Callback answerCallback) {
        Intent answerIntent = getCurrentActivity().getIntent();
        if (answerIntent.hasExtra("callNotificationResult")) {
            String result = answerIntent.getStringExtra("callNotificationResult");
            Log.d("CallAnswerInfo", result);
            // If a call was answered, we call callback with metadata about the call
            answerCallback.invoke(answerIntent.getStringExtra("callId"));
        }
    }

    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is not in the Support Library.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Calls";
            String description = "Channel to receive Port call notifications";
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            // Register the channel with the system. You can't change the importance
            // or other notification behaviors after this.
            NotificationManager notificationManager = this.getReactApplicationContext()
                    .getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @ReactMethod
    public void displayCallUI(String caller, String callId, Callback onSuccess) {
        createNotificationChannel();
        Log.d("CALL", caller);
        Person callerPerson = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            callerPerson = new Person.Builder()
                    .setName(caller)
                    .setImportant(true)
                    .build();
        }

        // When invoked, launch the app's main activity and let it know that the call was answered
        Intent answerIntent = new Intent();
        answerIntent.setAction(Intent.ACTION_ANSWER);
        answerIntent.setPackage("tech.numberless.port");
        answerIntent.putExtra("callNotificationResult", "Answer");
        answerIntent.putExtra("callId", callId);

        // When invoked, launch the app
        Intent clickIntent = new Intent();
        clickIntent.setAction(Intent.ACTION_MAIN);
        clickIntent.setPackage("tech.numberless.port");
        clickIntent.putExtra("callNotificationResult", "Click");
        clickIntent.putExtra("callId", callId);

        // When invoked, launch the app's main activity and let it know that the call was answered
        Intent declineIntent = new Intent();
        declineIntent.setAction(Intent.ACTION_ANSWER);
        declineIntent.setPackage("tech.numberless.port");
        declineIntent.putExtra("callNotificationResult", "Decline");
        declineIntent.putExtra("callId", callId);

        PendingIntent pendingAnswer = PendingIntent.getActivity(
                this.getReactApplicationContext(),              // Context
                1,         // Request code (can be any int value, used to identify the PendingIntent)
                answerIntent,              // The Intent to be executed
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE// Flags to update the PendingIntent if it already exists
        );

        PendingIntent pendingDecline = PendingIntent.getActivity(
                this.getReactApplicationContext(),              // Context
                2,         // Request code (can be any int value, used to identify the PendingIntent)
                declineIntent,              // The Intent to be executed
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE// Flags to update the PendingIntent if it already exists
        );

        PendingIntent pendingClick = PendingIntent.getActivity(
                this.getReactApplicationContext(),              // Context
                3,         // Request code (can be any int value, used to identify the PendingIntent)
                clickIntent,              // The Intent to be executed
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE// Flags to update the PendingIntent if it already exists
        );


        Notification.Builder notificationBuilder = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            notificationBuilder = new Notification.Builder(this.getReactApplicationContext(), CHANNEL_ID)
                    .setContentIntent(pendingClick)
                    .setCategory(NotificationCompat.CATEGORY_CALL)
                    .setStyle(
                            Notification.CallStyle.forIncomingCall(callerPerson, pendingDecline, pendingAnswer))
                    .addPerson(callerPerson)
                    .setFullScreenIntent(pendingDecline, true)
                    .setPriority(Notification.PRIORITY_HIGH)
                    .setSmallIcon(R.drawable.ic_small_icon)
                    .setTimeoutAfter(25 * 1000);    // Set a 25 second timeout
        }

        int notificationId = new Random().nextInt();
        Log.d("CALL", "About to notify");

        NotificationManagerCompat nm = NotificationManagerCompat.from(getReactApplicationContext());
        Log.d("CALL", "Notification manager constructed");

        nm.notify(notificationId, notificationBuilder.build());
        Log.d("CALL", "Notified");

        onSuccess.invoke();
    }
}
