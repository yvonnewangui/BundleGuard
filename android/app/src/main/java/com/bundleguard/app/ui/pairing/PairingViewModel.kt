package com.bundleguard.app.ui.pairing

import android.content.Context
import androidx.lifecycle.*
import com.bundleguard.app.data.PreferencesManager
import com.bundleguard.app.data.UsageRepository
import com.bundleguard.app.worker.UsageSyncWorker
import kotlinx.coroutines.launch

sealed class PairingState {
    object Idle : PairingState()
    object Loading : PairingState()
    object Success : PairingState()
    data class Error(val message: String) : PairingState()
}

class PairingViewModel(
    private val context: Context
) : ViewModel() {
    
    private val repository = UsageRepository(context)
    private val preferencesManager = PreferencesManager(context)
    
    private val _pairingState = MutableLiveData<PairingState>(PairingState.Idle)
    val pairingState: LiveData<PairingState> = _pairingState
    
    fun registerDevice(pairingCode: String) {
        viewModelScope.launch {
            _pairingState.value = PairingState.Loading
            
            val result = repository.registerDevice(pairingCode)
            
            if (result.isSuccess) {
                // Enable tracking and schedule sync
                preferencesManager.setTrackingEnabled(true)
                UsageSyncWorker.schedule(context, 15)
                
                _pairingState.value = PairingState.Success
            } else {
                _pairingState.value = PairingState.Error(
                    result.exceptionOrNull()?.message ?: "Connection failed"
                )
            }
        }
    }
    
    class Factory(private val context: Context) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(PairingViewModel::class.java)) {
                return PairingViewModel(context.applicationContext) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}
