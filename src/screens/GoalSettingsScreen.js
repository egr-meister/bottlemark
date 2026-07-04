// Goal Settings — edit the daily water goal with validation.
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Screen, Card, Button, Field, Chip } from "../components/ui";
import { useAppData } from "../context/AppDataContext";
import { colors, spacing, font } from "../theme";
import { DEFAULT_GOAL_ML, MAX_GOAL_ML } from "../storage/defaults";
import { formatMl } from "../utils/calc";

const PRESETS = [1500, 2000, 2500, 3000];

export default function GoalSettingsScreen({ navigation }) {
  const { appData, setDailyGoal, resetGoal } = useAppData();
  const current = Math.max(1, Number(appData.settings?.dailyGoalMl) || DEFAULT_GOAL_ML);
  const [goal, setGoal] = useState(String(current));
  const [err, setErr] = useState("");

  function save() {
    setErr("");
    const g = Number(goal);
    if (!Number.isFinite(g) || g <= 0) {
      setErr("Goal must be greater than 0 ml.");
      return;
    }
    if (g > MAX_GOAL_ML) {
      setErr(`Goal should not exceed ${MAX_GOAL_ML} ml.`);
      return;
    }
    setDailyGoal(g);
    navigation.goBack();
  }

  return (
    <Screen>
      <Card tone="panel">
        <Text style={styles.currentLabel}>Current daily goal</Text>
        <Text style={styles.currentValue}>{formatMl(current)}</Text>
      </Card>

      <Text style={styles.label}>Quick presets</Text>
      <View style={styles.chipRow}>
        {PRESETS.map((p) => (
          <Chip
            key={p}
            label={formatMl(p)}
            active={String(p) === goal}
            onPress={() => setGoal(String(p))}
          />
        ))}
      </View>

      <Field
        label="Daily goal (ml)"
        value={goal}
        onChangeText={(t) => setGoal(t.replace(/[^0-9]/g, ""))}
        keyboardType="number-pad"
        placeholder="e.g. 2000"
        maxLength={5}
        error={err}
      />

      <Button title="Save Goal" onPress={save} />
      <Button
        title="Reset to default (2,000 ml)"
        variant="secondary"
        onPress={() => {
          resetGoal();
          setGoal(String(DEFAULT_GOAL_ML));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  currentLabel: { fontSize: font.small, color: colors.textSoft },
  currentValue: { fontSize: 26, fontWeight: "800", color: colors.tealDark, marginTop: 4 },
  label: { fontSize: font.small, color: colors.textSoft, marginTop: spacing.md, marginBottom: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
});
