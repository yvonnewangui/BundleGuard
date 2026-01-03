package com.bundleguard.app.ui.status

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.bundleguard.app.R
import com.bundleguard.app.databinding.FragmentStatusBinding
import com.bundleguard.app.util.FormatUtils

class StatusFragment : Fragment() {
    
    private var _binding: FragmentStatusBinding? = null
    private val binding get() = _binding!!
    
    private val viewModel: StatusViewModel by viewModels {
        StatusViewModel.Factory(requireContext())
    }
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentStatusBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupClickListeners()
        observeViewModel()
        
        viewModel.loadStatus()
    }
    
    private fun setupClickListeners() {
        binding.btnSyncNow.setOnClickListener {
            viewModel.syncNow()
        }
        
        binding.btnToggleTracking.setOnClickListener {
            viewModel.toggleTracking()
        }
        
        binding.btnOpenDashboard.setOnClickListener {
            openDashboard()
        }
        
        binding.cardTodayUsage.setOnClickListener {
            // Could navigate to detailed view
        }
    }
    
    private fun observeViewModel() {
        viewModel.isTrackingEnabled.observe(viewLifecycleOwner) { enabled ->
            updateTrackingStatus(enabled)
        }
        
        viewModel.lastSyncTime.observe(viewLifecycleOwner) { time ->
            binding.textLastSync.text = if (time > 0) {
                getString(R.string.last_sync, FormatUtils.formatRelativeTime(time))
            } else {
                getString(R.string.never_synced)
            }
        }
        
        viewModel.todayUsage.observe(viewLifecycleOwner) { (mobile, wifi) ->
            binding.textMobileUsage.text = FormatUtils.formatBytes(mobile)
            binding.textWifiUsage.text = FormatUtils.formatBytes(wifi)
            binding.textTotalUsage.text = FormatUtils.formatBytes(mobile + wifi)
        }
        
        viewModel.isSyncing.observe(viewLifecycleOwner) { syncing ->
            binding.btnSyncNow.isEnabled = !syncing
            binding.progressSync.visibility = if (syncing) View.VISIBLE else View.GONE
        }
        
        viewModel.syncResult.observe(viewLifecycleOwner) { result ->
            result?.let {
                val message = if (it.isSuccess) {
                    "Sync complete"
                } else {
                    "Sync failed: ${it.exceptionOrNull()?.message}"
                }
                Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show()
            }
        }
        
        viewModel.operatorName.observe(viewLifecycleOwner) { operator ->
            binding.textOperator.text = operator ?: "Unknown"
            binding.textOperator.visibility = if (operator != null) View.VISIBLE else View.GONE
        }
    }
    
    private fun updateTrackingStatus(enabled: Boolean) {
        if (enabled) {
            binding.textTrackingStatus.text = getString(R.string.tracking_on)
            binding.textTrackingStatus.setTextColor(resources.getColor(R.color.status_on, null))
            binding.indicatorStatus.setBackgroundResource(R.drawable.status_indicator_on)
            binding.btnToggleTracking.text = getString(R.string.btn_stop_tracking)
        } else {
            binding.textTrackingStatus.text = getString(R.string.tracking_off)
            binding.textTrackingStatus.setTextColor(resources.getColor(R.color.status_off, null))
            binding.indicatorStatus.setBackgroundResource(R.drawable.status_indicator_off)
            binding.btnToggleTracking.text = getString(R.string.btn_start_tracking)
        }
    }
    
    private fun openDashboard() {
        val dashboardUrl = "https://bundleguard.vercel.app" // Update with actual URL
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(dashboardUrl))
        startActivity(intent)
    }
    
    override fun onResume() {
        super.onResume()
        viewModel.loadStatus()
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
