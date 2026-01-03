package com.bundleguard.app.worker

import android.content.Context
import android.util.Log
import androidx.work.*
import com.bundleguard.app.data.PreferencesManager
import com.bundleguard.app.data.UsageRepository
import kotlinx.coroutines.flow.first
import java.util.concurrent.TimeUnit

class UsageSyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    companion object {
        private const val TAG = "UsageSyncWorker"
        private const val WORK_NAME = "usage_sync_work"
        
        fun schedule(context: Context, intervalMinutes: Int = 15) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
            
            val syncRequest = PeriodicWorkRequestBuilder<UsageSyncWorker>(
                intervalMinutes.toLong(),
                TimeUnit.MINUTES
            )
                .setConstraints(constraints)
                .setBackoffCriteria(
                    BackoffPolicy.EXPONENTIAL,
                    1,
                    TimeUnit.MINUTES
                )
                .build()
            
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.UPDATE,
                syncRequest
            )
            
            Log.d(TAG, "Scheduled sync every $intervalMinutes minutes")
        }
        
        fun scheduleOneTime(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
            
            val syncRequest = OneTimeWorkRequestBuilder<UsageSyncWorker>()
                .setConstraints(constraints)
                .build()
            
            WorkManager.getInstance(context).enqueue(syncRequest)
            Log.d(TAG, "Scheduled one-time sync")
        }
        
        fun cancel(context: Context) {
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
            Log.d(TAG, "Cancelled scheduled sync")
        }
    }
    
    private val repository = UsageRepository(applicationContext)
    private val preferencesManager = PreferencesManager(applicationContext)
    
    override suspend fun doWork(): Result {
        Log.d(TAG, "Starting usage sync...")
        
        // Check if tracking is enabled
        val isTrackingEnabled = preferencesManager.isTrackingEnabled.first()
        if (!isTrackingEnabled) {
            Log.d(TAG, "Tracking disabled, skipping sync")
            return Result.success()
        }
        
        // Check if paired
        val isPaired = preferencesManager.isPaired.first()
        if (!isPaired) {
            Log.d(TAG, "Not paired, skipping sync")
            return Result.success()
        }
        
        return try {
            val result = repository.syncUsageData()
            
            if (result.isSuccess) {
                Log.d(TAG, "Sync completed successfully")
                Result.success()
            } else {
                Log.e(TAG, "Sync failed: ${result.exceptionOrNull()?.message}")
                Result.retry()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Sync error: ${e.message}", e)
            Result.retry()
        }
    }
}
