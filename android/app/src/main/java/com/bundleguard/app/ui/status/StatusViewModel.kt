package com.bundleguard.app.ui.status

import android.content.Context
import androidx.lifecycle.*
import com.bundleguard.app.data.PreferencesManager
import com.bundleguard.app.data.UsageRepository
import com.bundleguard.app.worker.UsageSyncWorker
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class StatusViewModel(
    private val context: Context
) : ViewModel() {
    
    private val repository = UsageRepository(context)
    private val preferencesManager = PreferencesManager(context)
    
    private val _isTrackingEnabled = MutableLiveData<Boolean>()
    val isTrackingEnabled: LiveData<Boolean> = _isTrackingEnabled
    
    private val _lastSyncTime = MutableLiveData<Long>()
    val lastSyncTime: LiveData<Long> = _lastSyncTime
    
    private val _todayUsage = MutableLiveData<Pair<Long, Long>>()
    val todayUsage: LiveData<Pair<Long, Long>> = _todayUsage
    
    private val _isSyncing = MutableLiveData<Boolean>()
    val isSyncing: LiveData<Boolean> = _isSyncing
    
    private val _syncResult = MutableLiveData<Result<Unit>?>()
    val syncResult: LiveData<Result<Unit>?> = _syncResult
    
    private val _operatorName = MutableLiveData<String?>()
    val operatorName: LiveData<String?> = _operatorName
    
    fun loadStatus() {
        viewModelScope.launch {
            _isTrackingEnabled.value = preferencesManager.isTrackingEnabled.first()
            _lastSyncTime.value = preferencesManager.lastSyncTime.first()
            _todayUsage.value = repository.getTodayUsage()
            _operatorName.value = repository.getOperatorName()
        }
    }
    
    fun syncNow() {
        viewModelScope.launch {
            _isSyncing.value = true
            _syncResult.value = null
            
            val result = repository.syncUsageData()
            
            _isSyncing.value = false
            _syncResult.value = result
            
            if (result.isSuccess) {
                _lastSyncTime.value = System.currentTimeMillis()
                _todayUsage.value = repository.getTodayUsage()
            }
        }
    }
    
    fun toggleTracking() {
        viewModelScope.launch {
            val currentState = preferencesManager.isTrackingEnabled.first()
            val newState = !currentState
            
            preferencesManager.setTrackingEnabled(newState)
            _isTrackingEnabled.value = newState
            
            if (newState) {
                val syncInterval = preferencesManager.syncIntervalMinutes.first()
                UsageSyncWorker.schedule(context, syncInterval)
            } else {
                UsageSyncWorker.cancel(context)
            }
        }
    }
    
    class Factory(private val context: Context) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(StatusViewModel::class.java)) {
                return StatusViewModel(context.applicationContext) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}
