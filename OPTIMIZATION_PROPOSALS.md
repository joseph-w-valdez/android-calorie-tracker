# Code Optimizations & UI/QoL Improvement Proposals

## 🚀 Performance Optimizations

### 1. **Replace ScrollView with FlatList for Entry Lists**
**Location:** `src/screens/TodayScreen.tsx`
**Issue:** Using `ScrollView` with `.map()` for entry lists - not optimized for long lists
**Proposal:** Replace with `FlatList` for better performance and memory usage
**Impact:** Better performance with many entries, automatic virtualization
**Priority:** Medium

### 2. **Memoize EntryRow Component**
**Location:** `src/components/EntryRow.tsx`
**Issue:** Component re-renders unnecessarily when parent updates
**Proposal:** Wrap with `React.memo()` to prevent unnecessary re-renders
**Impact:** Fewer re-renders, better performance
**Priority:** Low-Medium

### 3. **Memoize Entry Filtering**
**Location:** `src/screens/TodayScreen.tsx` (lines 34-35)
**Issue:** `foodEntries` and `exerciseEntries` recalculated on every render
**Proposal:** Use `useMemo` to memoize filtered arrays
**Impact:** Prevents unnecessary recalculations
**Priority:** Low

### 4. **Apply useRefreshKeys Hook**
**Location:** All screen files (HomeScreen, CaloriesScreen, WeightScreen)
**Issue:** Manual refresh key management instead of using the `useRefreshKeys` hook we created
**Proposal:** Replace manual refresh key state with `useRefreshKeys()` hook
**Impact:** Cleaner code, consistent refresh behavior
**Priority:** Medium

### 5. **Debounce Weight Input Updates**
**Location:** `src/screens/HomeScreen.tsx`, `src/screens/WeightScreen.tsx`, `src/screens/TodayScreen.tsx`
**Issue:** Weight updates trigger database writes on every keystroke
**Proposal:** Debounce weight input updates (e.g., 500ms delay)
**Impact:** Fewer database writes, better performance
**Priority:** Medium

---

## 🎨 UI/UX Improvements

### 6. **Add Haptic Feedback to Actions**
**Location:** Multiple screens
**Issue:** No tactile feedback for important actions
**Proposal:** Add haptic feedback using `expo-haptics` for:
- Adding/editing/deleting entries
- Saving BMR/target weight
- Button presses
**Impact:** Better user experience, more polished feel
**Priority:** Medium

### 7. **Add Loading States**
**Location:** All hooks that fetch data (`useTrend`, `useWeightTrend`, `useMonthData`, etc.)
**Issue:** No loading indicators while data is being fetched
**Proposal:** Add `isLoading` state to hooks and show loading indicators in UI
**Impact:** Better UX, users know when data is loading
**Priority:** Medium

### 8. **Calendar Navigation (Previous/Next Month)**
**Location:** `src/components/Calendar.tsx`, `src/components/WeightCalendar.tsx`
**Issue:** Can only view current month, no way to navigate
**Proposal:** Add previous/next month buttons or swipe gestures
**Impact:** Users can view historical data easily
**Priority:** High

### 9. **Pull-to-Refresh**
**Location:** All screen ScrollViews
**Issue:** No way to manually refresh data
**Proposal:** Add `RefreshControl` to ScrollViews
**Impact:** Users can manually refresh data
**Priority:** Medium

### 10. **Better Empty States**
**Location:** Multiple components
**Issue:** Generic "No data" messages
**Proposal:** Add helpful empty states with:
- Illustrations or icons
- Actionable suggestions (e.g., "Tap + to add your first entry")
- Contextual help
**Impact:** Better onboarding, clearer guidance
**Priority:** Low-Medium

### 11. **Swipe Gestures for Entry Actions**
**Location:** `src/components/EntryRow.tsx`
**Issue:** Only long-press and delete button for actions
**Proposal:** Add swipe-to-delete or swipe-to-edit gestures
**Impact:** More intuitive, modern mobile UX
**Priority:** Low

### 12. **Input Validation Feedback**
**Location:** All modals with TextInput
**Issue:** Only shows Alert on error, no inline validation
**Proposal:** Add real-time validation with inline error messages
**Impact:** Better UX, users see errors before submitting
**Priority:** Medium

### 13. **Success Feedback**
**Location:** All save/update actions
**Issue:** No confirmation when actions succeed
**Proposal:** Add subtle success feedback (toast, haptic, or brief visual indicator)
**Impact:** Users know their actions were successful
**Priority:** Low-Medium

---

## 🔧 Code Quality Improvements

### 14. **Remove Duplicate formatDate Functions**
**Location:** `src/screens/CaloriesScreen.tsx`, `src/screens/WeightScreen.tsx`, `src/screens/TodayScreen.tsx`
**Issue:** Duplicate `formatDate` functions instead of using `formatDateFull` utility
**Proposal:** Replace with `formatDateFull` from `src/utils/dateFormatters.ts`
**Impact:** Less code duplication, consistent formatting
**Priority:** Low

### 15. **Use BMRModal Component in CaloriesScreen**
**Location:** `src/screens/CaloriesScreen.tsx` (lines 152-189)
**Issue:** Duplicate BMR modal code instead of using `BMRModal` component
**Proposal:** Replace with `<BMRModal>` component
**Impact:** Less code, consistent modal behavior
**Priority:** Medium

### 16. **Use TargetWeightModal in WeightScreen**
**Location:** `src/screens/WeightScreen.tsx` (lines 215-260)
**Issue:** Duplicate target weight modal code instead of using `TargetWeightModal` component
**Proposal:** Replace with `<TargetWeightModal>` component
**Impact:** Less code, consistent modal behavior
**Priority:** Medium

### 17. **Consolidate EntryRow Delete Logic**
**Location:** `src/components/EntryRow.tsx`
**Issue:** `handleLongPress` and `handleDelete` both show delete confirmation
**Proposal:** Consolidate into single delete handler
**Impact:** Cleaner code, less duplication
**Priority:** Low

### 18. **Error Handling UI**
**Location:** All hooks with try/catch blocks
**Issue:** Errors only logged to console, no user-facing error messages
**Proposal:** Add error state to hooks and show user-friendly error messages
**Impact:** Better error handling, users know when something goes wrong
**Priority:** Medium

### 19. **Refactor Settings Hooks to use useSetting**
**Location:** `src/hooks/useBMR.ts`, `src/hooks/useTargetWeight.ts`
**Issue:** Duplicate patterns for settings management
**Proposal:** Refactor to use the generic `useSetting` hook we created
**Impact:** ~100 lines of code reduction, consistent pattern
**Priority:** Medium

### 20. **Add Date Picker for Target Date**
**Location:** `src/components/ui/TargetWeightModal.tsx`
**Issue:** Manual date input (YYYY-MM-DD format) is error-prone
**Proposal:** Add native date picker component
**Impact:** Better UX, prevents date format errors
**Priority:** Medium

---

## 📱 Mobile-Specific Improvements

### 21. **Keyboard Avoidance**
**Location:** All screens with TextInput
**Issue:** Keyboard may cover input fields
**Proposal:** Use `KeyboardAvoidingView` or adjust layout when keyboard appears
**Impact:** Better UX on mobile devices
**Priority:** Medium

### 22. **Safe Area Handling**
**Location:** All screens
**Issue:** Content may overlap with notches/system UI
**Proposal:** Use `SafeAreaView` or `useSafeAreaInsets` consistently
**Impact:** Better display on devices with notches
**Priority:** Low-Medium

### 23. **Optimize for Large Lists**
**Location:** `src/screens/TodayScreen.tsx`
**Issue:** If user has many entries, performance may degrade
**Proposal:** Use `FlatList` with pagination or virtualization
**Impact:** Better performance with large datasets
**Priority:** Low (unless users have many entries)

---

## 🎯 Quick Wins (Easy, High Impact)

1. **Remove duplicate formatDate functions** - Use existing utility
2. **Use BMRModal in CaloriesScreen** - Replace duplicate code
3. **Use TargetWeightModal in WeightScreen** - Replace duplicate code
4. **Add haptic feedback** - Quick to implement, big UX improvement
5. **Add pull-to-refresh** - Easy, improves UX

---

## 📊 Priority Summary

### High Priority:
- Calendar navigation (prev/next month)
- Use existing modal components (BMRModal, TargetWeightModal)
- Apply useRefreshKeys hook

### Medium Priority:
- Replace ScrollView with FlatList for entries
- Add haptic feedback
- Add loading states
- Debounce weight input
- Error handling UI
- Pull-to-refresh
- Input validation feedback

### Low Priority:
- Memoize components
- Better empty states
- Swipe gestures
- Keyboard avoidance
- Safe area handling

---

## 💡 Additional Ideas

### 24. **Export Data Feature**
**Proposal:** Allow users to export their data (CSV/JSON)
**Impact:** Data portability, backup capability

### 25. **Statistics Dashboard**
**Proposal:** Add summary statistics (total calories, average weight, streaks, etc.)
**Impact:** Better insights for users

### 26. **Dark/Light Theme Toggle**
**Proposal:** Add theme switching (currently only dark mode)
**Impact:** User preference support

### 27. **Search/Filter Entries**
**Proposal:** Add search functionality for entries
**Impact:** Easier to find specific entries

### 28. **Quick Add Common Foods**
**Proposal:** Add frequently used foods/exercises for quick entry
**Impact:** Faster data entry

---

## 📝 Notes

- All proposals are suggestions - implement based on your priorities
- Some improvements may require additional dependencies
- Consider user feedback to prioritize features
- Test performance improvements with real data volumes

