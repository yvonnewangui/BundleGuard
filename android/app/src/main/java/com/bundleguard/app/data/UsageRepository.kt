package com.bundleguard.app.data

import android.content.Context
import android.os.Build
import com.bundleguard.app.data.api.ApiClient
import com.bundleguard.app.data.model.*
import kotlinx.coroutines.flow.first
import java.text.SimpleDateFormat
import java.util.*

class UsageRepository(private val context: Context) {
    
    private val preferencesManager = PreferencesManager(context)
    private val usageCollector = UsageStatsCollector(context)
    private val api = ApiClient.api
    
    /**
     * Register device with backend
     */
    suspend fun registerDevice(pairingCode: String): Result<DeviceRegistrationResponse> {
        return try {
            val deviceInfo = DeviceInfo(
                platform = "android",
                model = Build.MODEL,
                osVersion = Build.VERSION.RELEASE
            )
            
            val request = DeviceRegistrationRequest(
                pairingCode = pairingCode,
                device = deviceInfo
            )
            
            val response = api.registerDevice(request)
            
            if (response.isSuccessful && response.body()?.success == true) {
                val body = response.body()!!
                body.deviceToken?.let { token ->
                    body.deviceId?.let { id ->
                        preferencesManager.setDeviceCredentials(id, token)
                    }
                }
                Result.success(body)
            } else {
                Result.failure(Exception(response.body()?.error ?: "Registration failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Sync usage data to backend
     */
    suspend fun syncUsageData(): Result<Unit> {
        return try {
            val deviceToken = preferencesManager.deviceToken.first()
                ?: return Result.failure(Exception("Not paired"))
            
            val lastSyncTime = preferencesManager.lastSyncTime.first()
            val (mobileUsage, wifiUsage) = usageCollector.getUsageSinceLastSync(lastSyncTime)
            val operator = usageCollector.getOperatorName()
            val capturedAt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX", Locale.US)
                .format(Date())
            
            // Upload mobile data usage
            if (mobileUsage.isNotEmpty()) {
                val mobileRequest = UsageBatchRequest(
                    capturedAt = capturedAt,
                    network = "mobile",
                    operator = operator,
                    apps = mobileUsage.map { 
                        AppUsageData(it.packageName, it.rxBytes, it.txBytes) 
                    }
                )
                
                val response = api.uploadUsageBatch("Bearer $deviceToken", mobileRequest)
                if (!response.isSuccessful) {
                    return Result.failure(Exception("Failed to upload mobile usage"))
                }
            }
            
            // Upload Wi-Fi usage
            if (wifiUsage.isNotEmpty()) {
                val wifiRequest = UsageBatchRequest(
                    capturedAt = capturedAt,
                    network = "wifi",
                    operator = null,
                    apps = wifiUsage.map { 
                        AppUsageData(it.packageName, it.rxBytes, it.txBytes) 
                    }
                )
                
                val response = api.uploadUsageBatch("Bearer $deviceToken", wifiRequest)
                if (!response.isSuccessful) {
                    return Result.failure(Exception("Failed to upload Wi-Fi usage"))
                }
            }
            
            // Update last sync time
            preferencesManager.setLastSyncTime(System.currentTimeMillis())
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get today's usage summary
     */
    fun getTodayUsage(): Pair<Long, Long> {
        return usageCollector.getTodayUsage()
    }
    
    /**
     * Get detailed usage stats
     */
    fun getDetailedUsage(startTime: Long, endTime: Long): Pair<List<AppUsageInfo>, List<AppUsageInfo>> {
        val mobileUsage = usageCollector.collectUsageStats(startTime, endTime, NetworkType.MOBILE)
        val wifiUsage = usageCollector.collectUsageStats(startTime, endTime, NetworkType.WIFI)
        return Pair(mobileUsage, wifiUsage)
    }
    
    /**
     * Get operator name
     */
    fun getOperatorName(): String? = usageCollector.getOperatorName()
}
