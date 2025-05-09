package tech.numberless.port

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Person
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import tech.numberless.port.specs.NativeCallHelperModuleSpec
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import java.util.Random
import android.Manifest
import android.content.pm.PackageManager
import android.view.WindowManager

class NativeCallHelperModule(reactContext: ReactApplicationContext) : NativeCallHelperModuleSpec(reactContext) {

    private val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    override fun getName() = NAME

    /**
     * Starting an outgoing call is not supported on Android.
     */
    @ReactMethod
    override fun startOutgoingCall(callUUID: String, callerName: String) {
        startAudioServices()
    }

    /**
     * Display an incoming call notification. Leverages Call type notifications, providing an activity
     * display when the phone is locked.
     */
    @ReactMethod
    override fun displayIncomingCall(caller: String, callId: String, callRingTimeSeconds: Double) {
        createNotificationChannel()
        Log.d(NAME, "Displaying incoming call UI for: $caller, ID: $callId")
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
            Log.w(NAME, "Caller person not supported on SDK version ${Build.VERSION.SDK_INT}")
            return
        }
        var callerPerson: Person = Person.Builder()
                    .setName(caller)
                    .setImportant(true)
                    .build()

        // Answer Intent
        val answerIntent = Intent().apply {
            action = Intent.ACTION_ANSWER
            `package` = "tech.numberless.port"
            putExtra("callNotificationResult", "Answer")
            putExtra("callId", callId)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingAnswer = PendingIntent.getActivity(
                reactApplicationContext,
                1,
                answerIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Decline Intent
        val declineIntent = Intent().apply {
            action = Intent.ACTION_ANSWER
            `package` = "tech.numberless.port"
            putExtra("callNotificationResult", "Decline")
            putExtra("callId", callId)
        }
         val pendingDecline = PendingIntent.getActivity(
                reactApplicationContext,
                2,
                declineIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Full Screen Intent
        val fullScreenIntent = Intent(reactApplicationContext, CallStyleActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("callId", callId)
            putExtra("caller", caller)
            putExtra("DECLINE_INTENT", pendingDecline)
            putExtra("ANSWER_INTENT", pendingAnswer)
            putExtra("RING_DURATION", callRingTimeSeconds)
        }
        val fullScreenPendingIntent = PendingIntent.getActivity(
            reactApplicationContext,
            0,
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val vibrationPattern = longArrayOf(0, 100, 250, 100, 100, 100, 200, 250, 250, 200, 200, 200, 200)

        var notificationBuilder: Notification.Builder? = null
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
             notificationBuilder = Notification.Builder(reactApplicationContext, CHANNEL_ID)
                    .setContentIntent(fullScreenPendingIntent)
                    .setCategory(Notification.CATEGORY_CALL)
                    .setStyle(Notification.CallStyle.forIncomingCall(callerPerson, pendingDecline, pendingAnswer))
                    .addPerson(callerPerson)
                    .setFullScreenIntent(fullScreenPendingIntent, true)
                    .setPriority(Notification.PRIORITY_HIGH)
                    .setSmallIcon(R.drawable.ic_small_icon)
                    .setVisibility(Notification.VISIBILITY_PUBLIC)
                    .setVibrate(vibrationPattern)
                    .setOngoing(true)
                    .setDefaults(Notification.DEFAULT_ALL)
                    .setTimeoutAfter(callRingTimeSeconds.toLong() * 1000L)
        }

        playRingtone(callRingTimeSeconds.toInt())

        val notificationId = Random().nextInt()
        Log.d(NAME, "About to notify incoming call with ID: $notificationId")

        val nm = NotificationManagerCompat.from(reactApplicationContext)
        Log.d(NAME, "Notification manager constructed for incoming call")

        if (notificationBuilder != null) {
             try {
                nm.notify(notificationId, notificationBuilder.build())
                Log.d(NAME, "Incoming call notification displayed successfully")
            } catch (e: SecurityException) {
                Log.e(NAME, "Notification permission maybe missing?", e)
            }
        } else {
            Log.w(NAME, "Notification.Builder is null, cannot notify. SDK version might be < S.")
        }
    }

    @ReactMethod
    override fun acceptIncomingCall(callUUID: String) {
        startAudioServices()
    }

    @ReactMethod
    override fun rejectIncomingCall(callUUID: String) {
        // Nothing to do on Android
    }

    /**
     * Ending an ongoing call is not supported on Android.
     */
    @ReactMethod
    override fun endOngoingCall(callUUID: String) {
        endAudioServices()
    }

    /**
     * Check if the call has been answered or declined. If unknown, returns pending.
     */
    @ReactMethod
    override fun didAnswerCall(callUUID: String) : String {
        Log.d(NAME, "Checking call state for UUID via Intent: $callUUID")
        val currentActivity = reactApplicationContext.currentActivity
        if (currentActivity == null) {
            Log.w(NAME, "Current activity is null, cannot check intent. Returning 'declined'.")
            return "penging"
        }

        val intent = currentActivity.intent
        if (intent == null || !intent.hasExtra("callNotificationResult") || !intent.hasExtra("callId")) {
            Log.d(NAME, "No relevant intent extras found. Returning 'pending'.")
            return "pending"
        }

        val intentCallId = intent.getStringExtra("callId")
        val intentResult = intent.getStringExtra("callNotificationResult")

        if (intentCallId == callUUID) {
            when (intentResult) {
                "Answer" -> {
                    Log.d(NAME, "Intent indicates call $callUUID was answered.")
                    return "answered"
                }
                "Decline" -> {
                    Log.d(NAME, "Intent indicates call $callUUID was declined.")
                    return "declined"
                }
                else -> {
                    Log.w(NAME, "Intent for $callUUID has unknown result '$intentResult'. Returning 'pending'.")
                    return "pending"
                }
            }
        } else {
            Log.d(NAME, "Intent found, but for different callId ('$intentCallId'). Returning 'pending' for $callUUID.")
            return "pending"
        }
    }

    /**
     * Get a list of currently available audio routes.
     */
    @ReactMethod
    override fun getAudioRoutes(promise: Promise) {
        Log.d(NAME, "Getting available audio routes")
        val routes = Arguments.createArray()
        routes.pushString("Speakerphone")
        routes.pushString("Earpiece")
        promise.resolve(routes)
    }

    /**
     * Set which audio route to use for the call.
     */
    @ReactMethod
    override fun setAudioRoute(route: String) {
        Log.d(NAME, "Setting audio route to: $route")
        when (route) {
            "Speakerphone" -> {
                audioManager.isSpeakerphoneOn = true
                Log.d(NAME, "Speakerphone enabled.")
            }
            "Earpiece" -> {
                audioManager.isSpeakerphoneOn = false
                Log.d(NAME, "Earpiece enabled (Speakerphone disabled).")
            }
            else -> {
                Log.w(NAME, "Unknown audio route specified: $route")
            }
        }
    }

    private fun startAudioServices() {
        Log.d(NAME, "Starting audio services...")
        audioManager.mode = AudioManager.MODE_IN_COMMUNICATION

        // Start the foreground service
        val serviceIntent = Intent(reactApplicationContext, CallAudioService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Check for POST_NOTIFICATIONS permission if targeting Android 13+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (ActivityCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    Log.w(NAME, "POST_NOTIFICATIONS permission not granted. Cannot start foreground service properly on Android 13+.")
                    // Optionally, request permission here or notify JS layer
                }
            }
             reactApplicationContext.startForegroundService(serviceIntent)
        } else {
            reactApplicationContext.startService(serviceIntent)
        }
        Log.d(NAME, "CallAudioService started.")
    }

    private fun endAudioServices() {
        Log.d(NAME, "Ending audio services...")
        audioManager.mode = AudioManager.MODE_NORMAL
        reactApplicationContext.stopService(Intent(reactApplicationContext, CallAudioService::class.java))
        Log.d(NAME, "CallAudioService stopped.")
    }

    companion object {
        const val NAME = "NativeCallHelperModule"
        private const val CHANNEL_ID = "call_channel_high_priority"
        private var activeMediaPlayer: MediaPlayer? = null
    }

    /**
     * Create a notification channel for incoming calls.
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Calls"
            val descriptionText = "Channel to receive Port call notifications"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 100, 250, 100, 100, 100, 200, 250, 250, 200, 200, 200, 200)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            val notificationManager: NotificationManager =
                reactApplicationContext.getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
            Log.d(NAME, "Notification channel created or already exists.")
        }
    }

    /**
     * Play the ringtone for the incoming call.
     */
    private fun playRingtone(callRingTimeSeconds: Int) {
        var mediaPlayer: MediaPlayer?
        if (activeMediaPlayer == null) {
            val ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            mediaPlayer = MediaPlayer.create(reactApplicationContext, ringtoneUri)?.apply {
                 isLooping = true
            }
            activeMediaPlayer = mediaPlayer
             Log.d(NAME, "Created and cached new MediaPlayer instance.")
        } else {
            mediaPlayer = activeMediaPlayer
             Log.d(NAME, "Reusing cached MediaPlayer instance.")
        }

        if (mediaPlayer == null) {
            Log.e(NAME, "Failed to create MediaPlayer, cannot play ringtone.")
            return
        }

        try {
            if (!mediaPlayer.isPlaying) {
                 mediaPlayer.start()
                 Log.d(NAME, "Ringtone started.")
                val handler = Handler(Looper.getMainLooper())
                handler.postDelayed({ this.cancelRingtone() }, callRingTimeSeconds * 1000L)
            } else {
                 Log.d(NAME, "Ringtone already playing.")
            }
        } catch (e: IllegalStateException) {
             Log.e(NAME, "MediaPlayer error on start: ${e.message}", e)
             cancelRingtone()
        }
    }

    /**
     * Cancel the ringtone for the incoming call.
     */
    @ReactMethod
    override fun cancelRingtone() {
        Log.d(NAME, "Attempting to cancel ringtone...")
        activeMediaPlayer?.let {
            if (it.isPlaying) {
                 try {
                    it.stop()
                    Log.d(NAME, "Ringtone stopped.")
                 } catch (e: IllegalStateException) {
                     Log.e(NAME, "Error stopping media player: ${e.message}", e)
                 }
            }
             try {
                it.release()
                 Log.d(NAME, "MediaPlayer released.")
             } catch (e: Exception) {
                 Log.e(NAME, "Error releasing media player: ${e.message}", e)
             }
            activeMediaPlayer = null
        } ?: Log.d(NAME, "No active MediaPlayer to cancel.")
    }

    @ReactMethod
    override fun startKeepPhoneAwake() {
        Log.d(NAME, "Attempting to keep screen on.")
        val activity = currentActivity
        if (activity != null) {
            activity.runOnUiThread {
                activity.window?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                Log.d(NAME, "FLAG_KEEP_SCREEN_ON added.")
            }
        } else {
            Log.w(NAME, "Current activity is null, cannot set FLAG_KEEP_SCREEN_ON.")
        }
    }

    @ReactMethod
    override fun endKeepPhoneAwake() {
        Log.d(NAME, "Attempting to allow screen to turn off.")
        val activity = currentActivity
        if (activity != null) {
            activity.runOnUiThread {
                activity.window?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                Log.d(NAME, "FLAG_KEEP_SCREEN_ON cleared.")
            }
        } else {
            Log.w(NAME, "Current activity is null, cannot clear FLAG_KEEP_SCREEN_ON.")
        }
    }
} 