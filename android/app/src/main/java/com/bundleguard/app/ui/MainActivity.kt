package com.bundleguard.app.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import com.bundleguard.app.R
import com.bundleguard.app.data.PreferencesManager
import com.bundleguard.app.databinding.ActivityMainBinding
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController
    private lateinit var preferencesManager: PreferencesManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        preferencesManager = PreferencesManager(this)
        
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController
        
        // Check onboarding status and navigate accordingly
        lifecycleScope.launch {
            val onboardingComplete = preferencesManager.onboardingComplete.first()
            val isPaired = preferencesManager.isPaired.first()
            
            if (!onboardingComplete) {
                navController.navigate(R.id.welcomeFragment)
            } else if (!isPaired) {
                navController.navigate(R.id.pairingFragment)
            } else {
                navController.navigate(R.id.statusFragment)
            }
        }
        
        // Handle deep link for pairing
        handleDeepLink()
    }
    
    private fun handleDeepLink() {
        intent?.data?.let { uri ->
            if (uri.scheme == "bundleguard" && uri.host == "pair") {
                val pairingCode = uri.getQueryParameter("code")
                if (!pairingCode.isNullOrBlank()) {
                    // Navigate to pairing with the code
                    val bundle = Bundle().apply {
                        putString("pairingCode", pairingCode)
                    }
                    navController.navigate(R.id.pairingFragment, bundle)
                }
            }
        }
    }
}
