package com.bundleguard.app.util

import java.text.DecimalFormat
import java.text.SimpleDateFormat
import java.util.*

object FormatUtils {
    
    private val byteFormat = DecimalFormat("#.##")
    
    /**
     * Format bytes to human readable string
     */
    fun formatBytes(bytes: Long): String {
        return when {
            bytes < 1024 -> "$bytes B"
            bytes < 1024 * 1024 -> "${byteFormat.format(bytes / 1024.0)} KB"
            bytes < 1024 * 1024 * 1024 -> "${byteFormat.format(bytes / (1024.0 * 1024.0))} MB"
            else -> "${byteFormat.format(bytes / (1024.0 * 1024.0 * 1024.0))} GB"
        }
    }
    
    /**
     * Format timestamp to relative time string
     */
    fun formatRelativeTime(timestamp: Long): String {
        val now = System.currentTimeMillis()
        val diff = now - timestamp
        
        return when {
            diff < 60_000 -> "Just now"
            diff < 3600_000 -> "${diff / 60_000}m ago"
            diff < 86400_000 -> "${diff / 3600_000}h ago"
            diff < 604800_000 -> "${diff / 86400_000}d ago"
            else -> SimpleDateFormat("MMM d", Locale.getDefault()).format(Date(timestamp))
        }
    }
    
    /**
     * Format timestamp to date time string
     */
    fun formatDateTime(timestamp: Long): String {
        return SimpleDateFormat("MMM d, h:mm a", Locale.getDefault()).format(Date(timestamp))
    }
    
    /**
     * Format timestamp to time string
     */
    fun formatTime(timestamp: Long): String {
        return SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date(timestamp))
    }
}
