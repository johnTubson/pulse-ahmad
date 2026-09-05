import { Tabs } from 'expo-router';
import { ChartBarIcon } from 'phosphor-react-native/src/icons/ChartBar';
import { HouseIcon } from 'phosphor-react-native/src/icons/House';
import { UserCircleIcon } from 'phosphor-react-native/src/icons/UserCircle';

import { Icon } from '@/components/ui/Icon';
import { palette } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              icon={HouseIcon}
              color={String(color)}
              size={24}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Trends',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              icon={ChartBarIcon}
              color={String(color)}
              size={24}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="personality"
        options={{
          title: 'Personality',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              icon={UserCircleIcon}
              color={String(color)}
              size={24}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
