package com.bundleguard.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.bundleguard.app.data.PreferencesManager
import com.bundleguard.app.worker.UsageSyncWorker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {
    
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val preferencesManager = PreferencesManager(context)
            
            CoroutineScope(Dispatchers.IO).launch {
                val isTrackingEnabled = preferencesManager.isTrackingEnabled.first()
                val isPaired = preferencesManager.isPaired.first()
                val syncInterval = preferencesManager.syncIntervalMinutes.first()
                
                if (isTrackingEnabled && isPaired) {
                    UsageSyncWorker.schedule(context, syncInterval)
                }
            }
        }
    }
}
