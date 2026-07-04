// BottleMark — offline, manual, bottle-based water tracker.
// Navigation root + data provider.
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";

import { AppDataProvider, useAppData } from "./src/context/AppDataContext";
import { colors } from "./src/theme";

import OnboardingScreen from "./src/screens/OnboardingScreen";
import HomeScreen from "./src/screens/HomeScreen";
import BottleSettingsScreen from "./src/screens/BottleSettingsScreen";
import AddEditBottleScreen from "./src/screens/AddEditBottleScreen";
import AddEditEntryScreen from "./src/screens/AddEditEntryScreen";
import DayDetailScreen from "./src/screens/DayDetailScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import StatisticsScreen from "./src/screens/StatisticsScreen";
import ReminderSettingsScreen from "./src/screens/ReminderSettingsScreen";
import GoalSettingsScreen from "./src/screens/GoalSettingsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

// Keep the splash visible until data has loaded.
SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();

// Navigation theme extended from DefaultTheme so theme.fonts is always defined.
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    primary: colors.teal,
    border: colors.border,
  },
  fonts: DefaultTheme.fonts,
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: "800", color: colors.text },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

function RootNavigator() {
  const { loading, appData } = useAppData();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  const onboarded = !!(appData && appData.settings && appData.settings.onboardingCompleted);

  return (
    <Stack.Navigator
      initialRouteName={onboarded ? "Home" : "Onboarding"}
      screenOptions={screenOptions}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="BottleSettings" component={BottleSettingsScreen} options={{ title: "Bottle Settings" }} />
      <Stack.Screen name="AddEditBottle" component={AddEditBottleScreen} options={{ title: "Bottle" }} />
      <Stack.Screen name="AddEditEntry" component={AddEditEntryScreen} options={{ title: "Water Entry" }} />
      <Stack.Screen name="DayDetail" component={DayDetailScreen} options={{ title: "Day Detail" }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: "History" }} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ title: "Statistics" }} />
      <Stack.Screen name="ReminderSettings" component={ReminderSettingsScreen} options={{ title: "Reminders" }} />
      <Stack.Screen name="GoalSettings" component={GoalSettingsScreen} options={{ title: "Daily Goal" }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
});
