// Add / Edit Bottle. Handles both create and edit modes safely.
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Switch, Alert } from "react-native";
import { Screen, Button, Field } from "../components/ui";
import { useAppData } from "../context/AppDataContext";
import { colors, spacing, radius, font, bottleColors, bottleColorKeys } from "../theme";
import { MIN_VOLUME_ML, MAX_VOLUME_ML } from "../storage/defaults";

export default function AddEditBottleScreen({ navigation, route }) {
  const params = route?.params || {};
  const { appData, addBottle, updateBottle, deleteBottle } = useAppData();

  const bottles = appData.bottles || [];
  const existing = params.bottleId ? bottles.find((b) => b.id === params.bottleId) : null;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name || "");
  const [volume, setVolume] = useState(existing ? String(existing.volumeMl) : "");
  const [favorite, setFavorite] = useState(!!existing?.favorite);
  const [colorKey, setColorKey] = useState(existing?.colorKey || "aqua");
  const [nameErr, setNameErr] = useState("");
  const [volErr, setVolErr] = useState("");

  function validate() {
    let ok = true;
    setNameErr("");
    setVolErr("");
    if (!name.trim()) {
      setNameErr("Bottle name cannot be empty.");
      ok = false;
    }
    const v = Number(volume);
    if (!Number.isFinite(v) || v <= 0) {
      setVolErr("Enter a volume greater than 0 ml.");
      ok = false;
    } else if (v > MAX_VOLUME_ML) {
      setVolErr(`Volume must not exceed ${MAX_VOLUME_ML} ml.`);
      ok = false;
    }
    return ok;
  }

  function save() {
    if (!validate()) return;
    const fields = {
      name: name.trim(),
      volumeMl: Math.max(MIN_VOLUME_ML, Math.min(MAX_VOLUME_ML, Number(volume))),
      favorite,
      colorKey,
    };
    if (isEdit) {
      updateBottle(existing.id, fields);
    } else {
      addBottle(fields);
    }
    navigation.goBack();
  }

  function confirmDelete() {
    if (!existing) return;
    if (!existing.custom) {
      Alert.alert("Preset bottle", "Preset bottles can't be deleted. You can edit or reset them instead.");
      return;
    }
    Alert.alert("Delete bottle?", `Remove "${existing.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteBottle(existing.id);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <Screen>
      <Field
        label="Bottle name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Desk Bottle"
        maxLength={40}
        error={nameErr}
      />
      <Field
        label="Volume (ml)"
        value={volume}
        onChangeText={(t) => setVolume(t.replace(/[^0-9]/g, ""))}
        placeholder="e.g. 500"
        keyboardType="number-pad"
        maxLength={5}
        error={volErr}
      />

      <Text style={styles.label}>Bottle color</Text>
      <View style={styles.colorRow}>
        {bottleColorKeys.map((key) => (
          <Pressable
            key={key}
            onPress={() => setColorKey(key)}
            style={[
              styles.colorDot,
              { backgroundColor: bottleColors[key] },
              colorKey === key && styles.colorDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.favRow}>
        <Text style={styles.label}>Mark as favorite</Text>
        <Switch
          value={favorite}
          onValueChange={setFavorite}
          trackColor={{ true: colors.teal, false: colors.slateDark }}
          thumbColor={colors.white}
        />
      </View>

      <Button title="Save Bottle" onPress={save} />
      {isEdit && existing?.custom ? (
        <Button title="Delete Bottle" variant="danger" onPress={confirmDelete} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: font.small, color: colors.textSoft, marginTop: spacing.sm, marginBottom: spacing.sm },
  colorRow: { flexDirection: "row", flexWrap: "wrap" },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorDotActive: { borderColor: colors.text },
  favRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
