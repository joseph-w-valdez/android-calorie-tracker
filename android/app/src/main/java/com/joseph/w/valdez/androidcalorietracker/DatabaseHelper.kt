package com.joseph.w.valdez.androidcalorietracker

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

data class TodayData(
    val netCalories: Int,
    val caloriesIn: Int,
    val caloriesOut: Int,
    val weight: Double?
)

class DatabaseHelper(context: Context) {
    private val dbPath: String = File(context.applicationInfo.dataDir, "databases/tracker.db").absolutePath
    
    fun getTodayData(): TodayData {
        val dbFile = File(dbPath)
        if (!dbFile.exists()) {
            // Database doesn't exist yet, return empty data
            return TodayData(0, 0, 0, null)
        }
        
        val db = SQLiteDatabase.openDatabase(dbPath, null, SQLiteDatabase.OPEN_READONLY)
        
        try {
            // Get today's date in YYYY-MM-DD format
            val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
            
            // Find today's day record
            var dayId: String? = null
            var weight: Double? = null
            
            val dayCursor = db.rawQuery(
                "SELECT id, weight FROM days WHERE date = ?",
                arrayOf(today)
            )
            
            if (dayCursor.moveToFirst()) {
                dayId = dayCursor.getString(0)
                val weightIndex = dayCursor.getColumnIndex("weight")
                if (!dayCursor.isNull(weightIndex)) {
                    weight = dayCursor.getDouble(weightIndex)
                }
            }
            dayCursor.close()
            
            // Calculate calories
            var caloriesIn = 0
            var caloriesOut = 0
            
            if (dayId != null) {
                val entriesCursor = db.rawQuery(
                    "SELECT type, calories FROM entries WHERE dayId = ?",
                    arrayOf(dayId)
                )
                
                while (entriesCursor.moveToNext()) {
                    val type = entriesCursor.getString(0)
                    val calories = entriesCursor.getInt(1)
                    
                    if (type == "food") {
                        caloriesIn += calories
                    } else if (type == "exercise") {
                        caloriesOut += calories
                    }
                }
                entriesCursor.close()
            }
            
            val netCalories = caloriesIn - caloriesOut
            
            return TodayData(netCalories, caloriesIn, caloriesOut, weight)
            
        } catch (e: Exception) {
            // If there's any error, return empty data
            return TodayData(0, 0, 0, null)
        } finally {
            db.close()
        }
    }
}

