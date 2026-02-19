import { usePathname, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

interface SwipeableTabWrapperProps {
  children: React.ReactNode;
}

// Define tab order
const TAB_ORDER = ['index', 'calories', 'weight', 'settings'];

export function SwipeableTabWrapper({ children }: SwipeableTabWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigateToTab = useCallback((direction: 'left' | 'right') => {
    // Get current tab name from pathname
    let currentTab = 'index';
    if (pathname.includes('/calories')) {
      currentTab = 'calories';
    } else if (pathname.includes('/weight')) {
      currentTab = 'weight';
    } else if (pathname.includes('/settings')) {
      currentTab = 'settings';
    } else if (pathname.includes('/edit')) {
      // Don't allow swiping from edit screen
      return;
    }
    
    const currentIndex = TAB_ORDER.indexOf(currentTab);
    if (currentIndex === -1) return; // Tab not found in order

    let nextIndex: number;
    if (direction === 'right') {
      // Swipe right = go to previous tab (left)
      nextIndex = currentIndex > 0 ? currentIndex - 1 : TAB_ORDER.length - 1;
    } else {
      // Swipe left = go to next tab (right)
      nextIndex = currentIndex < TAB_ORDER.length - 1 ? currentIndex + 1 : 0;
    }

    const nextTab = TAB_ORDER[nextIndex];
    if (nextTab === 'index') {
      router.push('/(tabs)/');
    } else {
      router.push(`/(tabs)/${nextTab}`);
    }
  }, [router, pathname]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only activate if horizontal movement is significant
    .failOffsetY([-5, 5]) // Fail if vertical movement is too much
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      
      // Determine swipe direction based on translation and velocity
      if (Math.abs(translationX) > 50 || Math.abs(velocityX) > 500) {
        if (translationX > 0 || velocityX > 0) {
          // Swipe right = go to previous tab
          runOnJS(navigateToTab)('right');
        } else {
          // Swipe left = go to next tab
          runOnJS(navigateToTab)('left');
        }
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </GestureDetector>
  );
}

