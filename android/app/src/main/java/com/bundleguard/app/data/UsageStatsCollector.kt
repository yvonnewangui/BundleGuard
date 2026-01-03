package com.bundleguard.app.data

import android.app.usage.NetworkStats
import android.app.usage.NetworkStatsManager
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.os.Build
import android.telephony.TelephonyManager
import com.bundleguard.app.data.model.AppUsageInfo
import com.bundleguard.app.data.model.NetworkType
import java.util.*

class UsageStatsCollector(private val context: Context) {
    
    private val networkStatsManager: NetworkStatsManager by lazy {
        context.getSystemService(Context.NETWORK_STATS_SERVICE) as NetworkStatsManager
    }
    
    private val packageManager: PackageManager by lazy {
        context.packageManager
    }
    
    private val telephonyManager: TelephonyManager by lazy {
        context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    }
    
    /**
     * Get the current network operator name
     */
    fun getOperatorName(): String? {
        return try {
            telephonyManager.networkOperatorName?.takeIf { it.isNotBlank() }
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Collect per-app data usage for a time period
     */
    fun collectUsageStats(
        startTime: Long,
        endTime: Long,
        networkType: NetworkType
    ): List<AppUsageInfo> {
        val usageMap = mutableMapOf<Int, AppUsageInfo>()
        
        try {
            val networkTypeInt = when (networkType) {
                NetworkType.MOBILE -> ConnectivityManager.TYPE_MOBILE
                NetworkType.WIFI -> ConnectivityManager.TYPE_WIFI
            }
            
            val bucket = NetworkStats.Bucket()
            val networkStats = networkStatsManager.querySummary(
                networkTypeInt,
                getSubscriberId(networkType),
                startTime,
                endTime
            )
            
            while (networkStats.hasNextBucket()) {
                networkStats.getNextBucket(bucket)
                val uid = bucket.uid
                
                // Skip system UIDs
                if (uid < 10000) continue
                
                val packageName = getPackageNameForUid(uid) ?: continue
                val appName = getAppName(packageName)
                
                val existing = usageMap[uid]
                if (existing != null) {
                    usageMap[uid] = existing.copy(
                        rxBytes = existing.rxBytes + bucket.rxBytes,
                        txBytes = existing.txBytes + bucket.txBytes
                    )
                } else {
                    usageMap[uid] = AppUsageInfo(
                        packageName = packageName,
                        appName = appName,
                        rxBytes = bucket.rxBytes,
                        txBytes = bucket.txBytes,
                        networkType = networkType
                    )
                }
            }
            
            networkStats.close()
            
        } catch (e: SecurityException) {
            // Permission not granted
            e.printStackTrace()
        } catch (e: Exception) {
            e.printStackTrace()
        }
        
        return usageMap.values
            .filter { it.totalBytes > 0 }
            .sortedByDescending { it.totalBytes }
    }
    
    /**
     * Get today's total usage
     */
    fun getTodayUsage(): Pair<Long, Long> {
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val startOfDay = calendar.timeInMillis
        val now = System.currentTimeMillis()
        
        val mobileUsage = collectUsageStats(startOfDay, now, NetworkType.MOBILE)
            .sumOf { it.totalBytes }
        val wifiUsage = collectUsageStats(startOfDay, now, NetworkType.WIFI)
            .sumOf { it.totalBytes }
        
        return Pair(mobileUsage, wifiUsage)
    }
    
    /**
     * Get usage since last sync
     */
    fun getUsageSinceLastSync(lastSyncTime: Long): Pair<List<AppUsageInfo>, List<AppUsageInfo>> {
        val now = System.currentTimeMillis()
        val startTime = if (lastSyncTime > 0) lastSyncTime else {
            // Default to start of today if never synced
            Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }.timeInMillis
        }
        
        val mobileUsage = collectUsageStats(startTime, now, NetworkType.MOBILE)
        val wifiUsage = collectUsageStats(startTime, now, NetworkType.WIFI)
        
        return Pair(mobileUsage, wifiUsage)
    }
    
    private fun getSubscriberId(networkType: NetworkType): String? {
        return try {
            if (networkType == NetworkType.MOBILE && Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                telephonyManager.subscriberId
            } else {
                null
            }
        } catch (e: SecurityException) {
            null
        }
    }
    
    private fun getPackageNameForUid(uid: Int): String? {
        return try {
            packageManager.getPackagesForUid(uid)?.firstOrNull()
        } catch (e: Exception) {
            null
        }
    }
    
    private fun getAppName(packageName: String): String {
        return try {
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (e: PackageManager.NameNotFoundException) {
            packageName.split(".").lastOrNull() ?: packageName
        }
    }
    
    /**
     * Check if an app is a system app
     */
    private fun isSystemApp(packageName: String): Boolean {
        return try {
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }
}
