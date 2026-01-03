package com.bundleguard.app.data.model

import com.google.gson.annotations.SerializedName

// Request models
data class DeviceRegistrationRequest(
    @SerializedName("pairingCode") val pairingCode: String,
    @SerializedName("device") val device: DeviceInfo
)

data class DeviceInfo(
    @SerializedName("platform") val platform: String = "android",
    @SerializedName("model") val model: String,
    @SerializedName("osVersion") val osVersion: String
)

data class UsageBatchRequest(
    @SerializedName("capturedAt") val capturedAt: String,
    @SerializedName("network") val network: String,
    @SerializedName("operator") val operator: String?,
    @SerializedName("apps") val apps: List<AppUsageData>
)

data class AppUsageData(
    @SerializedName("package") val packageName: String,
    @SerializedName("rxBytes") val rxBytes: Long,
    @SerializedName("txBytes") val txBytes: Long
)

// Response models
data class DeviceRegistrationResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("deviceToken") val deviceToken: String?,
    @SerializedName("deviceId") val deviceId: String?,
    @SerializedName("message") val message: String?,
    @SerializedName("error") val error: String?
)

data class UsageUploadResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("itemsProcessed") val itemsProcessed: Int?,
    @SerializedName("error") val error: String?
)

// Local models
data class AppUsageInfo(
    val packageName: String,
    val appName: String,
    val rxBytes: Long,
    val txBytes: Long,
    val networkType: NetworkType
) {
    val totalBytes: Long get() = rxBytes + txBytes
}

enum class NetworkType {
    MOBILE, WIFI
}
