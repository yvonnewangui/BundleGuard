package com.bundleguard.app.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "bundleguard_prefs")

class PreferencesManager(private val context: Context) {
    
    companion object {
        private val KEY_DEVICE_TOKEN = stringPreferencesKey("device_token")
        private val KEY_DEVICE_ID = stringPreferencesKey("device_id")
        private val KEY_IS_PAIRED = booleanPreferencesKey("is_paired")
        private val KEY_TRACKING_ENABLED = booleanPreferencesKey("tracking_enabled")
        private val KEY_LAST_SYNC_TIME = longPreferencesKey("last_sync_time")
        private val KEY_SYNC_INTERVAL_MINUTES = intPreferencesKey("sync_interval_minutes")
        private val KEY_ONBOARDING_COMPLETE = booleanPreferencesKey("onboarding_complete")
        private val KEY_DASHBOARD_URL = stringPreferencesKey("dashboard_url")
        private val KEY_PENDING_BUNDLES = stringSetPreferencesKey("pending_bundles")
        private val KEY_LAST_SMS_SCAN_TIME = longPreferencesKey("last_sms_scan_time")
    }
    
    val deviceToken: Flow<String?> = context.dataStore.data.map { it[KEY_DEVICE_TOKEN] }
    val deviceId: Flow<String?> = context.dataStore.data.map { it[KEY_DEVICE_ID] }
    val isPaired: Flow<Boolean> = context.dataStore.data.map { it[KEY_IS_PAIRED] ?: false }
    val isTrackingEnabled: Flow<Boolean> = context.dataStore.data.map { it[KEY_TRACKING_ENABLED] ?: false }
    val lastSyncTime: Flow<Long> = context.dataStore.data.map { it[KEY_LAST_SYNC_TIME] ?: 0L }
    val syncIntervalMinutes: Flow<Int> = context.dataStore.data.map { it[KEY_SYNC_INTERVAL_MINUTES] ?: 15 }
    val onboardingComplete: Flow<Boolean> = context.dataStore.data.map { it[KEY_ONBOARDING_COMPLETE] ?: false }
    val dashboardUrl: Flow<String?> = context.dataStore.data.map { it[KEY_DASHBOARD_URL] }
    
    suspend fun setDeviceCredentials(deviceId: String, deviceToken: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_DEVICE_ID] = deviceId
            prefs[KEY_DEVICE_TOKEN] = deviceToken
            prefs[KEY_IS_PAIRED] = true
        }
    }
    
    suspend fun setTrackingEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[KEY_TRACKING_ENABLED] = enabled
        }
    }
    
    suspend fun setLastSyncTime(time: Long) {
        context.dataStore.edit { prefs ->
            prefs[KEY_LAST_SYNC_TIME] = time
        }
    }
    
    suspend fun setSyncInterval(minutes: Int) {
        context.dataStore.edit { prefs ->
            prefs[KEY_SYNC_INTERVAL_MINUTES] = minutes
        }
    }
    
    suspend fun setOnboardingComplete(complete: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ONBOARDING_COMPLETE] = complete
        }
    }
    
    suspend fun setDashboardUrl(url: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_DASHBOARD_URL] = url
        }
    }
    
    // Pending bundles management
    val pendingBundles: Flow<Set<String>> = context.dataStore.data.map { 
        it[KEY_PENDING_BUNDLES] ?: emptySet() 
    }
    
    val lastSmsScanTime: Flow<Long> = context.dataStore.data.map { 
        it[KEY_LAST_SMS_SCAN_TIME] ?: 0L 
    }
    
    suspend fun addPendingBundle(bundleJson: String) {
        context.dataStore.edit { prefs ->
            val current = prefs[KEY_PENDING_BUNDLES] ?: emptySet()
            prefs[KEY_PENDING_BUNDLES] = current + bundleJson
        }
    }
    
    suspend fun removePendingBundle(bundleJson: String) {
        context.dataStore.edit { prefs ->
            val current = prefs[KEY_PENDING_BUNDLES] ?: emptySet()
            prefs[KEY_PENDING_BUNDLES] = current - bundleJson
        }
    }
    
    suspend fun clearPendingBundles() {
        context.dataStore.edit { prefs ->
            prefs[KEY_PENDING_BUNDLES] = emptySet()
        }
    }
    
    suspend fun setLastSmsScanTime(time: Long) {
        context.dataStore.edit { prefs ->
            prefs[KEY_LAST_SMS_SCAN_TIME] = time
        }
    }
    
    suspend fun getLastSmsScanTimeOnce(): Long {
        return context.dataStore.data.first()[KEY_LAST_SMS_SCAN_TIME] ?: 0L
    }
    
    suspend fun clearAll() {
        context.dataStore.edit { it.clear() }
    }
}
