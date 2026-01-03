package com.bundleguard.app.data.api

import com.bundleguard.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface BundleGuardApi {
    
    @POST("api/devices/register")
    suspend fun registerDevice(
        @Body request: DeviceRegistrationRequest
    ): Response<DeviceRegistrationResponse>
    
    @POST("api/usage/batches")
    suspend fun uploadUsageBatch(
        @Header("Authorization") authorization: String,
        @Body request: UsageBatchRequest
    ): Response<UsageUploadResponse>
}
