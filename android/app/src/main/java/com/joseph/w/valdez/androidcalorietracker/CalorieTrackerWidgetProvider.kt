package com.joseph.w.valdez.androidcalorietracker

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.os.Build
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.*

class CalorieTrackerWidgetProvider : AppWidgetProvider() {
    
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Update all widgets
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        
        // Update widget when data changes
        if (intent.action == AppWidgetManager.ACTION_APPWIDGET_UPDATE) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(
                android.content.ComponentName(context, CalorieTrackerWidgetProvider::class.java)
            )
            onUpdate(context, appWidgetManager, appWidgetIds)
        }
    }

    private fun isDarkMode(context: Context): Boolean {
        val nightModeFlags = context.resources.configuration.uiMode and
                Configuration.UI_MODE_NIGHT_MASK
        return nightModeFlags == Configuration.UI_MODE_NIGHT_YES
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val dbHelper = DatabaseHelper(context)
        val todayData = dbHelper.getTodayData()
        
        // Determine which layout to use based on system theme
        val isDark = isDarkMode(context)
        val layoutId = if (isDark) {
            R.layout.widget_calorie_tracker_dark
        } else {
            R.layout.widget_calorie_tracker_light
        }
        
        val views = RemoteViews(context.packageName, layoutId)
        
        // Update text views
        views.setTextViewText(R.id.widget_net_calories, todayData.netCalories.toString())
        views.setTextViewText(R.id.widget_calories_in, todayData.caloriesIn.toString())
        views.setTextViewText(R.id.widget_calories_out, todayData.caloriesOut.toString())
        views.setTextViewText(
            R.id.widget_weight,
            if (todayData.weight != null) "${todayData.weight} lbs" else "—"
        )
        
        // Set color for net calories (green if negative/deficit, red if positive)
        val netColor = if (todayData.netCalories < 0) {
            if (isDark) {
                0xFF4CAF50.toInt() // Green for dark mode
            } else {
                context.getColor(android.R.color.holo_green_dark)
            }
        } else {
            if (isDark) {
                0xFFFF4444.toInt() // Red for dark mode
            } else {
                context.getColor(android.R.color.holo_red_dark)
            }
        }
        views.setTextColor(R.id.widget_net_calories, netColor)
        
        // Set up click intent to open app
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = android.app.PendingIntent.getActivity(
            context,
            0,
            intent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)
        
        // Set up "Add Entry" button to open app with deep link
        val addEntryIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            data = android.net.Uri.parse("androidcalorietracker://add-entry")
        }
        val addEntryPendingIntent = android.app.PendingIntent.getActivity(
            context,
            1,
            addEntryIntent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_add_button, addEntryPendingIntent)
        
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}

