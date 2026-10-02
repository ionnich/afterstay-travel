import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { Camera, Compass, Home, Plane, Wallet } from 'lucide-react-native';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/constants/ThemeContext';

/* ---------- Tab bar visibility context ---------- */

interface TabBarVisibilityContextValue {
  visible: boolean;
  setVisible: (v: boolean) => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextValue>({
  visible: true,
  setVisible: () => {},
});

export function useTabBarVisibility(): TabBarVisibilityContextValue {
  return useContext(TabBarVisibilityContext);
}

const TAB_ICONS = {
  home: Home,
  moments: Camera,
  discover: Compass,
  budget: Wallet,
  trip: Plane,
} as const;

const TAB_LABELS: Record<string, string> = {
  home: 'Home',
  moments: 'Moments',
  discover: 'Discover',
  budget: 'Budget',
  trip: 'Our Trip',
};

function TabBarOverlay({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { visible } = useTabBarVisibility();
  const bottomOffset = Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 16;

  const visibleRoutes = state.routes.filter(
    (route) => (descriptors[route.key]?.options as Record<string, unknown>)?.href !== null
  );
  const tabCount = visibleRoutes.length;

  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = useSharedValue(state.index);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, { damping: 20, stiffness: 250 });
  }, [state.index, activeIndex]);

  const innerWidth = Math.max(0, containerWidth - 8 - 2 * (tabCount - 1));
  const tabWidth = tabCount > 0 ? innerWidth / tabCount : 0;
  const step = tabWidth + 2;
  const pillStyle = useAnimatedStyle(
    () => ({ transform: [{ translateX: activeIndex.value * step }] }),
    [step],
  );

  if (!visible) return null;

  const tabBar = (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: 10,
        right: 10,
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderRadius: 28,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
          },
          android: { elevation: 8 },
        }),
      }}
    >
      {tabWidth > 0 && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 6,
              bottom: 6,
              left: 4,
              width: tabWidth,
              borderRadius: 22,
              backgroundColor: colors.accentBg,
            },
            pillStyle,
          ]}
        />
      )}
      {visibleRoutes.map((route) => {
        const originalIndex = state.routes.indexOf(route);
        const focused = state.index === originalIndex;
        const Icon = TAB_ICONS[route.name as keyof typeof TAB_ICONS];
        if (!Icon) return null;

        const color = focused ? colors.accent : colors.text3;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={TAB_LABELS[route.name] ?? route.name}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 9,
              borderRadius: 18,
            }}
          >
            <Icon size={20} color={color} strokeWidth={1.8} />
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: '600',
                color,
                marginTop: 3,
                letterSpacing: -0.1,
              }}
            >
              {TAB_LABELS[route.name] ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return tabBar;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [tabBarVisible, setTabBarVisible] = useState(true);

  const visibilityValue = useMemo(
    () => ({ visible: tabBarVisible, setVisible: setTabBarVisible }),
    [tabBarVisible],
  );

  return (
    <TabBarVisibilityContext.Provider value={visibilityValue}>
      <Tabs
        tabBar={(props) => <TabBarOverlay {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTitleStyle: { color: colors.text, fontWeight: '600' },
          headerShown: false,
          headerShadowVisible: false,
          headerTintColor: colors.text,
        }}
      >
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="moments" options={{ title: 'Moments' }} />
        <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
        <Tabs.Screen name="budget" options={{ title: 'Budget' }} />
        <Tabs.Screen name="trip" options={{ title: 'Our Trip' }} />

        {/* Hidden tabs — accessible via gear icon */}
        <Tabs.Screen name="guide" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>
    </TabBarVisibilityContext.Provider>
  );
}
