package com.bundleguard.app.data.sms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Date

/**
 * Broadcast receiver for incoming SMS messages
 * Automatically detects bundle purchase notifications in real-time
 */
class BundleSmsReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "BundleSmsReceiver"
        
        // Callback for when a bundle is detected
        private var bundleDetectedCallback: ((BundleSmsParser.DetectedBundle) -> Unit)? = null
        
        fun setBundleDetectedCallback(callback: (BundleSmsParser.DetectedBundle) -> Unit) {
            bundleDetectedCallback = callback
        }
        
        fun clearCallback() {
            bundleDetectedCallback = null
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            return
        }

        try {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            if (messages.isNullOrEmpty()) return

            val parser = BundleSmsParser(context)
            
            for (sms in messages) {
                val sender = sms.originatingAddress ?: continue
                val body = sms.messageBody ?: continue
                val timestamp = sms.timestampMillis

                Log.d(TAG, "Received SMS from: $sender")

                // Try to parse as bundle SMS
                val bundle = parser.parseSmsForBundle(
                    smsId = timestamp, // Use timestamp as temporary ID
                    sender = sender,
                    body = body,
                    date = Date(timestamp)
                )

                if (bundle != null) {
                    Log.i(TAG, "Bundle detected: ${parser.formatDataAmount(bundle.dataAmount)} from ${bundle.operator}")
                    
                    // Notify via callback
                    bundleDetectedCallback?.invoke(bundle)
                    
                    // Store and sync the bundle
                    CoroutineScope(Dispatchers.IO).launch {
                        storeBundleAndSync(context, bundle)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing SMS", e)
        }
    }

    private suspend fun storeBundleAndSync(context: Context, bundle: BundleSmsParser.DetectedBundle) {
        try {
            // Get the repository and save the bundle
            val prefsManager = com.bundleguard.app.data.PreferencesManager(context)
            
            // Store as pending bundle until user confirms
            val bundleJson = """
                {
                    "operator": "${bundle.operator}",
                    "bundleType": "${bundle.bundleType}",
                    "dataAmount": ${bundle.dataAmount},
                    "price": ${bundle.price},
                    "currency": "${bundle.currency}",
                    "validityHours": ${bundle.validityHours},
                    "purchaseTime": ${bundle.purchaseTime.time},
                    "expiryTime": ${bundle.expiryTime?.time ?: 0},
                    "confirmed": false
                }
            """.trimIndent()
            
            prefsManager.addPendingBundle(bundleJson)
            
            Log.i(TAG, "Bundle stored for confirmation")
        } catch (e: Exception) {
            Log.e(TAG, "Error storing bundle", e)
        }
    }
}
