package tech.numberless.port;

import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;
import android.app.Activity;
import android.app.KeyguardManager;

import tech.numberless.port.databinding.ActivityCallStyleBinding;

/**
 * An example full-screen activity that shows and hides the system UI (i.e.
 * status bar and navigation/system bar) with user interaction.
 */
public class CallStyleActivity extends AppCompatActivity {

    private View mControlsView;
    private PendingIntent declineIntent;
    private PendingIntent answerIntent;
    private final Runnable mShowPart2Runnable = new Runnable() {
        @Override
        public void run() {
            // Delayed display of UI elements
            ActionBar actionBar = getSupportActionBar();
            if (actionBar != null) {
                actionBar.show();
            }
            mControlsView.setVisibility(View.VISIBLE);
        }
    };

    private ActivityCallStyleBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);

        binding = ActivityCallStyleBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        Intent intent = getIntent();
        Bundle bundle = intent.getExtras();
        String callerName = bundle.getString("caller");
        declineIntent = getIntent().getParcelableExtra("DECLINE_INTENT");
        answerIntent = getIntent().getParcelableExtra("ANSWER_INTENT");
        int callRingTimeSeconds = bundle.getInt("RING_DURATION");
        Handler handler = new Handler(Looper.getMainLooper());

        handler.postDelayed(this::finish, callRingTimeSeconds * 1000);

        TextView callerTextView = findViewById(R.id.fullscreen_content);
        callerTextView.setText(callerName);

        // Upon interacting with UI controls, delay any scheduled hide()
        // operations to prevent the jarring behavior of controls going away
        // while interacting with the UI.
    }

    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
    }

    public void onDeclineCall(View view) {
        if (null != declineIntent) {
            try {
                declineIntent.send();
            } catch (PendingIntent.CanceledException e) {
                e.printStackTrace();;
            }
        }
        finish();
    }

    public void onAcceptCall(View view) {
        requestDeviceUnlock(this,
                "Authentication Required",
                "Unlock device to answer call",
                new UnlockCallback() {
                    @Override
                    public void onUnlockSucceeded() {
                        if (null != answerIntent) {
                            try {
                                answerIntent.send();
                            } catch (PendingIntent.CanceledException e) {
                                e.printStackTrace();
                            }
                        }
                        finish();
                    }

                    @Override
                    public void onUnlockFailed() {
                        finish();
                    }

                    @Override
                    public void onUnlockCancelled() {
                        Log.d("Call", "Unlock app cancelled");
                    }
                }
                );

    }
    /**
     * Request device unlock with a callback for success/failure
     * @param activity The current activity
     * @param title The title to show on the unlock screen
     * @param description The description to show on the unlock screen
     * @param callback Callback to receive the result of the unlock attempt
     */
    public static void requestDeviceUnlock(Activity activity, String title, String description,
                                           UnlockCallback callback) {
        KeyguardManager keyguardManager = (KeyguardManager) activity.getSystemService(Context.KEYGUARD_SERVICE);

        // Check if the device is secured with a lock screen
        if (keyguardManager == null || !keyguardManager.isKeyguardSecure()) {
            // Device is not secured or keyguard manager is unavailable
            callback.onUnlockSucceeded();
            return;
        }

        // For Android Oreo (API 26) and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            keyguardManager.requestDismissKeyguard(
                    activity,
                    new KeyguardManager.KeyguardDismissCallback() {
                        @Override
                        public void onDismissSucceeded() {
                            callback.onUnlockSucceeded();
                        }

                        @Override
                        public void onDismissError() {
                            callback.onUnlockFailed();
                        }

                        @Override
                        public void onDismissCancelled() {
                            callback.onUnlockCancelled();
                        }
                    }
            );
        } else {
            // For Android versions below Oreo
            try {
                // Create an intent to prompt the user to confirm their credentials
                Intent unlockIntent = keyguardManager.createConfirmDeviceCredentialIntent(title, description);

                if (unlockIntent != null) {
                    // Start the intent with a result code to handle in onActivityResult
                    activity.startActivityForResult(unlockIntent, UNLOCK_REQUEST_CODE);

                    // You need to handle the result in your activity's onActivityResult
                    // See the accompanying code example below
                } else {
                    // No secure lock set on this device
                    callback.onUnlockSucceeded();
                }
            } catch (Exception e) {
                callback.onUnlockFailed();
            }
        }
    }

    /**
     * Callback interface to receive unlock results
     */
    public interface UnlockCallback {
        void onUnlockSucceeded();
        void onUnlockFailed();
        void onUnlockCancelled();
    }

    // Define the request code constant somewhere in your class
    private static final int UNLOCK_REQUEST_CODE = 12345;

}