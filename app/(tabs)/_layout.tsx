import RouteGuard from "@/components/RouteGuard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, useColorScheme } from "react-native";
import { useTheme } from "react-native-paper";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  return (
    <RouteGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.outline,
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            borderTopWidth: 0,
            elevation: 0,
            height: Platform.OS === "ios" ? 94 : 70,
            paddingVertical: 8,
            backgroundColor:
              colorScheme === "dark"
                ? theme.colors.elevation.level2
                : Platform.OS === "ios"
                ? "rgba(255, 255, 255, 0.9)"
                : theme.colors.elevation.level1,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: -4,
                },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              },
              android: {
                elevation: 8,
                borderTopWidth: 1,
                borderColor:
                  colorScheme === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.05)",
              },
            }),
          },
          tabBarItemStyle: {
            height: Platform.OS === "ios" ? 50 : 45,
            paddingBottom: Platform.OS === "ios" ? 0 : 4,
          },
          tabBarLabelStyle: {
            fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "home-variant" : "home-variant-outline"}
                size={size + 4}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="save"
          options={{
            title: "Save",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "bookmark-plus" : "bookmark-plus-outline"}
                size={size + 4}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "account" : "account-outline"}
                size={size + 4}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </RouteGuard>
  );
}
