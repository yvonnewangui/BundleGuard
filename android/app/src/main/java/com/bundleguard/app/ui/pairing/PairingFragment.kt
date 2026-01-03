package com.bundleguard.app.ui.pairing

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.bundleguard.app.R
import com.bundleguard.app.databinding.FragmentPairingBinding
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions

class PairingFragment : Fragment() {
    
    private var _binding: FragmentPairingBinding? = null
    private val binding get() = _binding!!
    
    private val viewModel: PairingViewModel by viewModels { 
        PairingViewModel.Factory(requireContext()) 
    }
    
    private val qrScannerLauncher = registerForActivityResult(ScanContract()) { result ->
        if (result.contents != null) {
            handleScanResult(result.contents)
        }
    }
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPairingBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // Check for deep-linked pairing code
        arguments?.getString("pairingCode")?.let { code ->
            binding.editPairingCode.setText(code)
            viewModel.registerDevice(code)
        }
        
        setupClickListeners()
        observeViewModel()
    }
    
    private fun setupClickListeners() {
        binding.btnScanQr.setOnClickListener {
            startQrScanner()
        }
        
        binding.btnConnect.setOnClickListener {
            val code = binding.editPairingCode.text.toString().trim()
            if (code.isNotEmpty()) {
                viewModel.registerDevice(code)
            } else {
                binding.inputLayoutPairingCode.error = "Please enter a pairing code"
            }
        }
    }
    
    private fun observeViewModel() {
        viewModel.pairingState.observe(viewLifecycleOwner) { state ->
            when (state) {
                is PairingState.Idle -> {
                    binding.progressBar.visibility = View.GONE
                    binding.btnConnect.isEnabled = true
                    binding.btnScanQr.isEnabled = true
                }
                is PairingState.Loading -> {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.btnConnect.isEnabled = false
                    binding.btnScanQr.isEnabled = false
                }
                is PairingState.Success -> {
                    binding.progressBar.visibility = View.GONE
                    Toast.makeText(requireContext(), R.string.pairing_success, Toast.LENGTH_SHORT).show()
                    findNavController().navigate(R.id.action_pairing_to_status)
                }
                is PairingState.Error -> {
                    binding.progressBar.visibility = View.GONE
                    binding.btnConnect.isEnabled = true
                    binding.btnScanQr.isEnabled = true
                    Toast.makeText(requireContext(), state.message, Toast.LENGTH_LONG).show()
                }
            }
        }
    }
    
    private fun startQrScanner() {
        val options = ScanOptions().apply {
            setDesiredBarcodeFormats(ScanOptions.QR_CODE)
            setPrompt("Scan the QR code from BundleGuard web app")
            setCameraId(0)
            setBeepEnabled(false)
            setBarcodeImageEnabled(false)
            setOrientationLocked(true)
        }
        qrScannerLauncher.launch(options)
    }
    
    private fun handleScanResult(contents: String) {
        // Parse QR content - could be URL or raw code
        val code = when {
            contents.startsWith("bundleguard://pair?code=") -> {
                contents.substringAfter("code=")
            }
            contents.startsWith("BG-") -> {
                contents
            }
            else -> {
                Toast.makeText(requireContext(), "Invalid QR code", Toast.LENGTH_SHORT).show()
                return
            }
        }
        
        binding.editPairingCode.setText(code)
        viewModel.registerDevice(code)
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
