// Reminder Settings — in-app reminder cards only. No system notifications.
import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { Screen, Card } from "../components/ui";
import { useAppData } from "../context/AppDataContext";
import { colors, spacing, font } from "../theme";
import { defaultReminderSettings } from "../storage/defaults";

function Row({ label, description, value, onValueChange, disabled }) {
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={{ flex: 1, paddingRight: spacing.md }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDesc}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: colors.teal, false: colors.slateDark }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export default function ReminderSettingsScreen() {
  const { appData, setReminders } = useAppData();
  const r = { ...defaultReminderSettings(), ...(appData.settings?.reminders || {}) };

  return (
    <Screen>
      <Card tone="panel">
        <Text style={styles.info}>
          These are in-app reminder cards only. They appear on the Home screen while the
          app is open and do not send phone notifications.
        </Text>
      </Card>

      <Card>
        <Row
          label="Reminders enabled"
          description="Turn all in-app reminder cards on or off."
          value={!!r.enabled}
          onValueChange={(v) => setReminders({ enabled: v })}
        />
        <Row
          label="Morning reminder"
          description="If nothing is logged after 11:00."
          value={!!r.morningEnabled}
          onValueChange={(v) => setReminders({ morningEnabled: v })}
          disabled={!r.enabled}
        />
        <Row
          label="Afternoon reminder"
          description="If progress is below 50% after 16:00."
          value={!!r.afternoonEnabled}
          onValueChange={(v) => setReminders({ afternoonEnabled: v })}
          disabled={!r.enabled}
        />
        <Row
          label="Evening reminder"
          description="If the goal is not reached by evening."
          value={!!r.eveningEnabled}
          onValueChange={(v) => setReminders({ eveningEnabled: v })}
          disabled={!r.enabled}
        />
      </Card>

      <Text style={styles.footnote}>
        Reminders are calm and optional. BottleMark never uses alarms, background
        services, or notification permissions.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: { fontSize: font.small, color: colors.text, lineHeight: 19 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowDisabled: { opacity: 0.5 },
  rowLabel: { fontSize: font.body, fontWeight: "700", color: colors.text },
  rowDesc: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  footnote: { fontSize: font.small, color: colors.textMuted, marginTop: spacing.lg, lineHeight: 18 },
});
