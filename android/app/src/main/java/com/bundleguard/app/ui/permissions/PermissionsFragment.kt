package com.bundleguard.app.ui.permissions

import android.Manifest
import android.os.Build
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.bundleguard.app.R
import com.bundleguard.app.data.PreferencesManager
import com.bundleguard.app.databinding.FragmentPermissionsBinding
import com.bundleguard.app.util.PermissionHelper
import kotlinx.coroutines.launch

class PermissionsFragment : Fragment() {
    
    private var _binding: FragmentPermissionsBinding? = null
    private val binding get() = _binding!!
    
    private lateinit var preferencesManager: PreferencesManager
    
    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        updatePermissionStates()
    }
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPermissionsBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        preferencesManager = PreferencesManager(requireContext())
        
        setupClickListeners()
        updatePermissionStates()
    }
    
    override fun onResume() {
        super.onResume()
        updatePermissionStates()
    }
    
    private fun setupClickListeners() {
        binding.btnUsagePermission.setOnClickListener {
            PermissionHelper.openUsageAccessSettings(requireContext())
        }
        
        binding.btnNotificationPermission.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
        
        binding.btnContinue.setOnClickListener {
            lifecycleScope.launch {
                preferencesManager.setOnboardingComplete(true)
            }
            findNavController().navigate(R.id.action_permissions_to_pairing)
        }
        
        binding.btnSkip.setOnClickListener {
            lifecycleScope.launch {
                preferencesManager.setOnboardingComplete(true)
            }
            findNavController().navigate(R.id.action_permissions_to_pairing)
        }
    }
    
    private fun updatePermissionStates() {
        val hasUsageAccess = PermissionHelper.hasUsageAccessPermission(requireContext())
        val hasNotification = PermissionHelper.hasNotificationPermission(requireContext())
        
        // Update usage access state
        binding.iconUsageCheck.visibility = if (hasUsageAccess) View.VISIBLE else View.GONE
        binding.btnUsagePermission.text = if (hasUsageAccess) "Granted" else "Grant"
        binding.btnUsagePermission.isEnabled = !hasUsageAccess
        
        // Update notification state
        binding.iconNotificationCheck.visibility = if (hasNotification) View.VISIBLE else View.GONE
        binding.btnNotificationPermission.text = if (hasNotification) "Granted" else "Grant"
        binding.btnNotificationPermission.isEnabled = !hasNotification
        
        // Enable continue button only if usage access is granted
        binding.btnContinue.isEnabled = hasUsageAccess
        binding.btnContinue.alpha = if (hasUsageAccess) 1f else 0.5f
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
