// Add / Edit Water Entry. Works even if the original bottle was deleted.
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Screen, Button, Field, Chip } from "../components/ui";
import { useAppData } from "../context/AppDataContext";
import { colors, spacing, font } from "../theme";
import { FRACTIONS, fractionLabel } from "../storage/defaults";
import { amountForFraction, formatMl } from "../utils/calc";
import { todayStr, nowTimeStr, isValidDateStr, isValidTimeStr } from "../utils/date";

export default function AddEditEntryScreen({ navigation, route }) {
  const params = route?.params || {};
  const { appData, activeBottle, addCustomEntry, addFractionEntry, updateEntry, deleteEntry } = useAppData();

  const entries = appData.entries || [];
  const existing = params.entryId ? entries.find((e) => e.id === params.entryId) : null;
  const isEdit = !!existing;

  const [date, setDate] = useState(existing?.date || params.date || todayStr());
  const [time, setTime] = useState(existing?.time || nowTimeStr());
  const [amount, setAmount] = useState(existing ? String(existing.amountMl) : "");
  const [label, setLabel] = useState(existing?.label || existing?.bottleNameSnapshot || activeBottle?.name || "");
  const [fraction, setFraction] = useState(existing?.fraction || "custom");

  const [dateErr, setDateErr] = useState("");
  const [timeErr, setTimeErr] = useState("");
  const [amountErr, setAmountErr] = useState("");

  function applyFraction(key) {
    setFraction(key);
    setAmount(String(amountForFraction(activeBottle, key)));
    if (!label) setLabel(activeBottle?.name || "Bottle");
  }

  function validate() {
    let ok = true;
    setDateErr("");
    setTimeErr("");
    setAmountErr("");
    if (!isValidDateStr(date)) {
      setDateErr("Use a valid date as YYYY-MM-DD.");
      ok = false;
    }
    if (!isValidTimeStr(time)) {
      setTimeErr("Use a valid time as HH:mm.");
      ok = false;
    }
    const a = Number(amount);
    if (!Number.isFinite(a) || a <= 0) {
      setAmountErr("Enter an amount greater than 0 ml.");
      ok = false;
    }
    return ok;
  }

  function save() {
    if (!validate()) return;
    const amt = Math.max(0, Number(amount));
    if (isEdit) {
      updateEntry(existing.id, {
        date,
        time,
        amountMl: amt,
        label: label.trim(),
        bottleNameSnapshot: label.trim() || existing.bottleNameSnapshot || "Bottle",
        fraction: fraction || "custom",
      });
    } else if (fraction && fraction !== "custom" && date === todayStr()) {
      // Fast path: a fraction of the active bottle logged for today.
      addFractionEntry(fraction, { date, time });
    } else {
      addCustomEntry({ date, time, amountMl: amt, label: label.trim() });
    }
    navigation.goBack();
  }

  function confirmDelete() {
    if (!existing) return;
    Alert.alert("Delete entry?", "This bottle entry will be removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteEntry(existing.id);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <Screen>
      <Text style={styles.helper}>
        Water entries are added manually. Pick a bottle amount or type any ml value.
      </Text>

      <Text style={styles.label}>Quick fraction of {activeBottle?.name || "bottle"}</Text>
      <View style={styles.chipRow}>
        {FRACTIONS.map((f) => (
          <Chip
            key={f.key}
            label={`${f.label} · ${formatMl(amountForFraction(activeBottle, f.key))}`}
            active={fraction === f.key}
            onPress={() => applyFraction(f.key)}
          />
        ))}
      </View>

      <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-01-01" error={dateErr} maxLength={10} />
      <Field label="Time (HH:mm)" value={time} onChangeText={setTime} placeholder="08:30" error={timeErr} maxLength={5} />
      <Field
        label="Amount (ml)"
        value={amount}
        onChangeText={(t) => {
          setAmount(t.replace(/[^0-9]/g, ""));
          setFraction("custom");
        }}
        placeholder="e.g. 250"
        keyboardType="number-pad"
        maxLength={5}
        error={amountErr}
      />
      <Field label="Bottle label" value={label} onChangeText={setLabel} placeholder="Bottle name" maxLength={40} />

      <Button title="Save Entry" onPress={save} />
      {isEdit ? <Button title="Delete Entry" variant="danger" onPress={confirmDelete} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  helper: { fontSize: font.small, color: colors.textSoft, marginBottom: spacing.md, lineHeight: 19 },
  label: { fontSize: font.small, color: colors.textSoft, marginBottom: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.sm },
});
