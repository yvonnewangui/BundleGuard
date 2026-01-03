package com.bundleguard.app.data.sms

import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.provider.Telephony
import java.text.SimpleDateFormat
import java.util.*
import java.util.regex.Pattern

/**
 * Parses SMS messages from Safaricom, Airtel, and Telkom Kenya
 * to automatically detect bundle purchases
 */
class BundleSmsParser(private val context: Context) {

    data class DetectedBundle(
        val operator: String,
        val bundleType: String,
        val dataAmount: Long, // in bytes
        val price: Double,
        val currency: String,
        val validityHours: Int,
        val purchaseTime: Date,
        val expiryTime: Date?,
        val rawMessage: String,
        val smsId: Long
    )

    companion object {
        // Safaricom sender IDs
        private val SAFARICOM_SENDERS = listOf("SAFARICOM", "MPESA", "Safaricom", "22141", "79079")
        
        // Airtel sender IDs
        private val AIRTEL_SENDERS = listOf("AIRTEL", "Airtel", "432")
        
        // Telkom sender IDs
        private val TELKOM_SENDERS = listOf("TELKOM", "Telkom", "T-Kash")

        // Data amount patterns
        private val DATA_AMOUNT_PATTERN = Pattern.compile(
            "(\\d+(?:\\.\\d+)?)\\s*(GB|MB|KB|G|M|K)",
            Pattern.CASE_INSENSITIVE
        )

        // Price patterns for KES
        private val PRICE_PATTERN = Pattern.compile(
            "(?:KES|Ksh|KSh|Kshs?)\\s*\\.?\\s*(\\d+(?:,\\d{3})*(?:\\.\\d{2})?)",
            Pattern.CASE_INSENSITIVE
        )

        // Validity patterns
        private val VALIDITY_PATTERNS = listOf(
            Pattern.compile("valid\\s+(?:for\\s+)?(\\d+)\\s*(hour|hr|day|week|month)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("expires?\\s+(?:in\\s+)?(\\d+)\\s*(hour|hr|day|week|month)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("(\\d+)\\s*(hour|hr|day|week|month)\\s+bundle", Pattern.CASE_INSENSITIVE),
            Pattern.compile("(daily|weekly|monthly)", Pattern.CASE_INSENSITIVE)
        )

        // Bundle type indicators
        private val BUNDLE_KEYWORDS = listOf(
            "bundle", "data", "internet", "mb", "gb", 
            "purchased", "activated", "subscribed", "bought"
        )

        // Safaricom specific patterns
        private val SAFARICOM_BUNDLE_PATTERN = Pattern.compile(
            "(?:successfully\\s+)?(?:purchased|bought|activated|subscribed).*?" +
            "(\\d+(?:\\.\\d+)?\\s*(?:GB|MB|G|M)).*?" +
            "(?:bundle|data|internet)?.*?" +
            "(?:KES|Ksh)\\s*(\\d+(?:,\\d{3})*(?:\\.\\d{2})?)?",
            Pattern.CASE_INSENSITIVE or Pattern.DOTALL
        )

        // Airtel specific patterns  
        private val AIRTEL_BUNDLE_PATTERN = Pattern.compile(
            "(?:You have|Dear Customer).*?" +
            "(\\d+(?:\\.\\d+)?\\s*(?:GB|MB|G|M)).*?" +
            "(?:bundle|data)?.*?" +
            "(?:KES|Ksh)\\s*(\\d+(?:,\\d{3})*(?:\\.\\d{2})?)?",
            Pattern.CASE_INSENSITIVE or Pattern.DOTALL
        )
    }

    /**
     * Read recent SMS messages and detect bundle purchases
     */
    fun detectBundlesFromSms(sinceTimestamp: Long = 0): List<DetectedBundle> {
        val bundles = mutableListOf<DetectedBundle>()
        
        try {
            val uri = Uri.parse("content://sms/inbox")
            val projection = arrayOf(
                Telephony.Sms._ID,
                Telephony.Sms.ADDRESS,
                Telephony.Sms.BODY,
                Telephony.Sms.DATE
            )
            
            val selection = if (sinceTimestamp > 0) {
                "${Telephony.Sms.DATE} > ?"
            } else null
            
            val selectionArgs = if (sinceTimestamp > 0) {
                arrayOf(sinceTimestamp.toString())
            } else null

            val cursor: Cursor? = context.contentResolver.query(
                uri,
                projection,
                selection,
                selectionArgs,
                "${Telephony.Sms.DATE} DESC"
            )

            cursor?.use {
                val idIndex = it.getColumnIndexOrThrow(Telephony.Sms._ID)
                val addressIndex = it.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)
                val bodyIndex = it.getColumnIndexOrThrow(Telephony.Sms.BODY)
                val dateIndex = it.getColumnIndexOrThrow(Telephony.Sms.DATE)

                while (it.moveToNext()) {
                    val smsId = it.getLong(idIndex)
                    val sender = it.getString(addressIndex) ?: continue
                    val body = it.getString(bodyIndex) ?: continue
                    val date = it.getLong(dateIndex)

                    val bundle = parseSmsForBundle(smsId, sender, body, Date(date))
                    if (bundle != null) {
                        bundles.add(bundle)
                    }
                }
            }
        } catch (e: SecurityException) {
            // SMS permission not granted
            e.printStackTrace()
        } catch (e: Exception) {
            e.printStackTrace()
        }

        return bundles
    }

    /**
     * Parse a single SMS message for bundle information
     */
    fun parseSmsForBundle(smsId: Long, sender: String, body: String, date: Date): DetectedBundle? {
        // Check if sender is a known operator
        val operator = when {
            SAFARICOM_SENDERS.any { sender.contains(it, ignoreCase = true) } -> "Safaricom"
            AIRTEL_SENDERS.any { sender.contains(it, ignoreCase = true) } -> "Airtel"
            TELKOM_SENDERS.any { sender.contains(it, ignoreCase = true) } -> "Telkom"
            else -> return null
        }

        // Check if message contains bundle-related keywords
        val lowerBody = body.lowercase()
        val hasBundleKeyword = BUNDLE_KEYWORDS.any { lowerBody.contains(it) }
        if (!hasBundleKeyword) return null

        // Extract data amount
        val dataAmount = extractDataAmount(body) ?: return null
        
        // Extract price
        val price = extractPrice(body)
        
        // Extract validity
        val (validityHours, bundleType) = extractValidity(body)
        
        // Calculate expiry
        val expiryTime = if (validityHours > 0) {
            Calendar.getInstance().apply {
                time = date
                add(Calendar.HOUR, validityHours)
            }.time
        } else null

        return DetectedBundle(
            operator = operator,
            bundleType = bundleType,
            dataAmount = dataAmount,
            price = price,
            currency = "KES",
            validityHours = validityHours,
            purchaseTime = date,
            expiryTime = expiryTime,
            rawMessage = body,
            smsId = smsId
        )
    }

    /**
     * Extract data amount in bytes from message
     */
    private fun extractDataAmount(body: String): Long? {
        val matcher = DATA_AMOUNT_PATTERN.matcher(body)
        if (matcher.find()) {
            val amount = matcher.group(1)?.toDoubleOrNull() ?: return null
            val unit = matcher.group(2)?.uppercase() ?: return null
            
            return when {
                unit.startsWith("G") -> (amount * 1024 * 1024 * 1024).toLong()
                unit.startsWith("M") -> (amount * 1024 * 1024).toLong()
                unit.startsWith("K") -> (amount * 1024).toLong()
                else -> null
            }
        }
        return null
    }

    /**
     * Extract price from message
     */
    private fun extractPrice(body: String): Double {
        val matcher = PRICE_PATTERN.matcher(body)
        if (matcher.find()) {
            val priceStr = matcher.group(1)?.replace(",", "") ?: return 0.0
            return priceStr.toDoubleOrNull() ?: 0.0
        }
        return 0.0
    }

    /**
     * Extract validity period and determine bundle type
     */
    private fun extractValidity(body: String): Pair<Int, String> {
        val lowerBody = body.lowercase()
        
        // Check for explicit validity patterns
        for (pattern in VALIDITY_PATTERNS) {
            val matcher = pattern.matcher(body)
            if (matcher.find()) {
                val groups = matcher.groupCount()
                
                // Handle "daily/weekly/monthly" pattern
                if (groups == 1) {
                    val type = matcher.group(1)?.lowercase() ?: continue
                    return when (type) {
                        "daily" -> Pair(24, "Daily")
                        "weekly" -> Pair(24 * 7, "Weekly")
                        "monthly" -> Pair(24 * 30, "Monthly")
                        else -> continue
                    }
                }
                
                // Handle numeric patterns
                if (groups >= 2) {
                    val amount = matcher.group(1)?.toIntOrNull() ?: continue
                    val unit = matcher.group(2)?.lowercase() ?: continue
                    
                    val hours = when {
                        unit.startsWith("hour") || unit.startsWith("hr") -> amount
                        unit.startsWith("day") -> amount * 24
                        unit.startsWith("week") -> amount * 24 * 7
                        unit.startsWith("month") -> amount * 24 * 30
                        else -> continue
                    }
                    
                    val type = when {
                        hours <= 24 -> "Daily"
                        hours <= 24 * 7 -> "Weekly"
                        else -> "Monthly"
                    }
                    
                    return Pair(hours, type)
                }
            }
        }

        // Infer from keywords
        return when {
            lowerBody.contains("daily") || lowerBody.contains("24 hour") -> Pair(24, "Daily")
            lowerBody.contains("weekly") || lowerBody.contains("7 day") -> Pair(24 * 7, "Weekly")
            lowerBody.contains("monthly") || lowerBody.contains("30 day") -> Pair(24 * 30, "Monthly")
            lowerBody.contains("midnight") || lowerBody.contains("till midnight") -> Pair(24, "Daily")
            else -> Pair(24, "Unknown") // Default to daily if unclear
        }
    }

    /**
     * Format data amount for display
     */
    fun formatDataAmount(bytes: Long): String {
        return when {
            bytes >= 1024 * 1024 * 1024 -> String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0))
            bytes >= 1024 * 1024 -> String.format("%.0f MB", bytes / (1024.0 * 1024.0))
            bytes >= 1024 -> String.format("%.0f KB", bytes / 1024.0)
            else -> "$bytes B"
        }
    }
}
