// Settings — shortcuts, app options, disclaimers, and destructive resets.
import React from "react";
import { View, Text, StyleSheet, Pressable, Switch, Alert } from "react-native";
import { Screen, Card, Button } from "../components/ui";
import { useAppData } from "../context/AppDataContext";
import { colors, spacing, radius, font } from "../theme";
import { todayStr } from "../utils/date";

function LinkRow({ label, description, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.linkRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.linkLabel}>{label}</Text>
        {description ? <Text style={styles.linkDesc}>{description}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function SettingsScreen({ navigation }) {
  const {
    appData,
    setCompactMode,
    showOnboardingAgain,
    resetDay,
    deleteAllEntries,
    resetAllData,
  } = useAppData();

  const compact = !!appData.settings?.compactMode;

  function confirmResetToday() {
    Alert.alert("Reset today?", "This will remove all bottle entries for today.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset today", style: "destructive", onPress: () => resetDay(todayStr()) },
    ]);
  }

  function confirmDeleteAllEntries() {
    Alert.alert(
      "Delete all bottle entries?",
      "This removes every water entry from all days. Bottles, goal, and reminders are kept.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete all", style: "destructive", onPress: () => deleteAllEntries() },
      ]
    );
  }

  function confirmResetAll() {
    Alert.alert(
      "Reset all local data?",
      "This removes bottles, entries, goal, reminders, and settings, then returns to the welcome screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset everything",
          style: "destructive",
          onPress: async () => {
            await resetAllData();
            navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
          },
        },
      ]
    );
  }

  function openOnboarding() {
    showOnboardingAgain();
    navigation.navigate("Onboarding");
  }

  return (
    <Screen>
      <Text style={styles.sectionTitle}>Shortcuts</Text>
      <Card style={styles.group}>
        <LinkRow label="Daily goal" description="Set your daily water goal" onPress={() => navigation.navigate("GoalSettings")} />
        <LinkRow label="Bottle settings" description="Choose and manage bottles" onPress={() => navigation.navigate("BottleSettings")} />
        <LinkRow label="Reminder settings" description="In-app reminder cards" onPress={() => navigation.navigate("ReminderSettings")} />
      </Card>

      <Text style={styles.sectionTitle}>App</Text>
      <Card style={styles.group}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.linkLabel}>Compact mode</Text>
            <Text style={styles.linkDesc}>Tighter spacing on cards</Text>
          </View>
          <Switch
            value={compact}
            onValueChange={setCompactMode}
            trackColor={{ true: colors.teal, false: colors.slateDark }}
            thumbColor={colors.white}
          />
        </View>
        <LinkRow label="Show onboarding again" description="Revisit the welcome screens" onPress={openOnboarding} />
      </Card>

      <Text style={styles.sectionTitle}>Data</Text>
      <Card style={styles.group}>
        <Button title="Reset today's entries" variant="secondary" onPress={confirmResetToday} />
        <Button title="Delete all bottle entries" variant="danger" onPress={confirmDeleteAllEntries} />
        <Button title="Reset all local data" variant="danger" onPress={confirmResetAll} />
      </Card>

      <Text style={styles.sectionTitle}>About BottleMark</Text>
      <Card tone="panel">
        <Text style={styles.aboutTitle}>Manual bottle tracking</Text>
        <Text style={styles.aboutText}>
          BottleMark is a manual bottle-based water tracker. It does not detect drinking
          automatically and does not connect to Health Connect, Google Fit, sensors, or
          wearable devices. It is not a medical or diagnostic app and makes no medical
          claims.
        </Text>
      </Card>
      <Card tone="panelAlt">
        <Text style={styles.aboutTitle}>Privacy</Text>
        <Text style={styles.aboutText}>
          BottleMark stores bottles, bottle entries, goals, reminders, and statistics only
          on this device. No account, no ads, no analytics, no internet connection, no
          sensors, no Google Fit, no Health Connect, and no notification permission.
        </Text>
      </Card>

      <Text style={styles.version}>BottleMark · Version 1.0.0 · Offline</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: font.h2,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  group: { paddingVertical: spacing.xs },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkLabel: { fontSize: font.body, fontWeight: "700", color: colors.text },
  linkDesc: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.textMuted, marginLeft: spacing.sm },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aboutTitle: { fontSize: font.body, fontWeight: "800", color: colors.text, marginBottom: spacing.xs },
  aboutText: { fontSize: font.small, color: colors.text, lineHeight: 19 },
  version: { fontSize: font.small, color: colors.textMuted, textAlign: "center", marginTop: spacing.lg },
});
