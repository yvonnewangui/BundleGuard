package com.bundleguard.app.worker

import android.content.Context
import android.util.Log
import androidx.work.*
import com.bundleguard.app.data.PreferencesManager
import com.bundleguard.app.data.sms.BundleSmsParser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.TimeUnit

/**
 * Worker that scans SMS inbox for bundle purchase messages
 * Runs periodically and on-demand to detect bundles the user may have purchased
 */
class BundleScanWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    companion object {
        private const val TAG = "BundleScanWorker"
        private const val WORK_NAME = "bundle_scan_work"
        
        // Scan SMS from the last 30 days on first run
        private const val INITIAL_SCAN_DAYS = 30
        
        /**
         * Schedule periodic bundle scanning
         */
        fun schedule(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
                .build()
            
            val request = PeriodicWorkRequestBuilder<BundleScanWorker>(
                6, TimeUnit.HOURS // Scan every 6 hours
            )
                .setConstraints(constraints)
                .setBackoffCriteria(
                    BackoffPolicy.EXPONENTIAL,
                    WorkRequest.MIN_BACKOFF_MILLIS,
                    TimeUnit.MILLISECONDS
                )
                .build()
            
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request
            )
            
            Log.i(TAG, "Bundle scan scheduled")
        }
        
        /**
         * Run immediate scan
         */
        fun runNow(context: Context) {
            val request = OneTimeWorkRequestBuilder<BundleScanWorker>()
                .build()
            
            WorkManager.getInstance(context).enqueue(request)
            Log.i(TAG, "Immediate bundle scan triggered")
        }
        
        /**
         * Cancel scheduled scans
         */
        fun cancel(context: Context) {
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
        }
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            Log.i(TAG, "Starting bundle SMS scan")
            
            val prefsManager = PreferencesManager(applicationContext)
            val parser = BundleSmsParser(applicationContext)
            
            // Get last scan time
            val lastScanTime = prefsManager.getLastSmsScanTimeOnce()
            
            // If first scan, look back 30 days
            val scanSince = if (lastScanTime == 0L) {
                System.currentTimeMillis() - (INITIAL_SCAN_DAYS * 24 * 60 * 60 * 1000L)
            } else {
                lastScanTime
            }
            
            Log.d(TAG, "Scanning SMS since: $scanSince")
            
            // Scan for bundles
            val detectedBundles = parser.detectBundlesFromSms(scanSince)
            
            Log.i(TAG, "Found ${detectedBundles.size} bundle(s) in SMS")
            
            // Store detected bundles
            for (bundle in detectedBundles) {
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
                        "confirmed": false,
                        "smsId": ${bundle.smsId}
                    }
                """.trimIndent()
                
                prefsManager.addPendingBundle(bundleJson)
                
                Log.d(TAG, "Added pending bundle: ${parser.formatDataAmount(bundle.dataAmount)} from ${bundle.operator}")
            }
            
            // Update last scan time
            prefsManager.setLastSmsScanTime(System.currentTimeMillis())
            
            Result.success()
        } catch (e: SecurityException) {
            Log.w(TAG, "SMS permission not granted", e)
            Result.failure()
        } catch (e: Exception) {
            Log.e(TAG, "Error scanning SMS for bundles", e)
            Result.retry()
        }
    }
}
