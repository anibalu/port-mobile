package tech.numberless.port

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import java.util.UUID

class CallAudioService : Service() {

    private val CHANNEL_ID = "call_audio_service_channel"

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        Log.d(NativeCallHelperModule.NAME, "CallAudioService created.")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(NativeCallHelperModule.NAME, "CallAudioService starting...")

        val notificationIntent = Intent(this, MainActivity::class.java) // Intent to open when notification is tapped
        val pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE)

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Ongoing Call")
            .setContentText("Tap here to view the ongoing call in Port")
             .setSmallIcon(R.drawable.ic_small_icon) // Use the same small icon
            .setContentIntent(pendingIntent)
             .setPriority(NotificationCompat.PRIORITY_LOW) // Lower priority for ongoing service
            .setOngoing(true)
             .setSound(null) // No sound for the service notification itself
            .build()

        // Generate UUID and get its hash code for the notification ID
        val notificationId = UUID.randomUUID().hashCode()
        try {
            startForeground(notificationId, notification)
            Log.d(NativeCallHelperModule.NAME, "CallAudioService started in foreground.")
        } catch (e: Exception) {
            // Catch potential SecurityException or others on specific Android versions
            Log.e(NativeCallHelperModule.NAME, "Error starting foreground service: ${e.message}", e)
            stopSelf() // Stop the service if foreground fails
            return START_NOT_STICKY
        }

        return START_STICKY // Restart service if killed
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(NativeCallHelperModule.NAME, "CallAudioService destroyed.")
        stopForeground(true) // Remove notification
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null // Not binding to this service
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Ongoing Call Service",
                NotificationManager.IMPORTANCE_LOW // Low importance to be less intrusive
            ).apply {
                 description = "Channel for the ongoing call audio service notification"
                 lockscreenVisibility = Notification.VISIBILITY_PRIVATE // Hide details on lock screen
                 setSound(null, null) // No sound for this channel
                 enableVibration(false) // No vibration
            }

            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(serviceChannel)
            Log.d(NativeCallHelperModule.NAME, "CallAudioService notification channel created.")
        }
    }
} 