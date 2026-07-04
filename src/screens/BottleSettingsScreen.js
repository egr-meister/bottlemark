// Bottle Settings — choose active bottle, manage bottles, favorites, reset.
import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Screen, Button, Card } from "../components/ui";
import { useAppData } from "../context/AppDataContext";
import { colors, spacing, radius, font, bottleColorFor } from "../theme";
import { formatMl } from "../utils/calc";

export default function BottleSettingsScreen({ navigation }) {
  const {
    appData,
    activeBottle,
    setActiveBottle,
    toggleFavoriteBottle,
    deleteBottle,
    resetBottlesToDefault,
  } = useAppData();

  const bottles = appData.bottles && appData.bottles.length ? appData.bottles : [];
  const activeId = activeBottle?.id;

  function confirmDelete(bottle) {
    Alert.alert(
      "Delete bottle?",
      `Remove "${bottle.name}"? Past history keeps its original bottle details.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteBottle(bottle.id) },
      ]
    );
  }

  function confirmReset() {
    Alert.alert(
      "Reset default bottles?",
      "This restores the four preset bottles. Custom bottles will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => resetBottlesToDefault() },
      ]
    );
  }

  const favorites = bottles.filter((b) => b.favorite);

  return (
    <Screen>
      <Card tone="panel">
        <Text style={styles.activeLabel}>Active bottle</Text>
        <View style={styles.activeRow}>
          <View style={[styles.dot, { backgroundColor: bottleColorFor(activeBottle?.colorKey) }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.activeName}>{activeBottle?.name || "Bottle"}</Text>
            <Text style={styles.activeVol}>{formatMl(activeBottle?.volumeMl)}</Text>
          </View>
        </View>
      </Card>

      {favorites.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>Favorites</Text>
          <View style={styles.favRow}>
            {favorites.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => setActiveBottle(b.id)}
                style={[styles.favChip, b.id === activeId && styles.favChipActive]}
              >
                <View style={[styles.smallDot, { backgroundColor: bottleColorFor(b.colorKey) }]} />
                <Text style={styles.favChipText}>{b.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>All bottles</Text>
      {bottles.map((b) => {
        const active = b.id === activeId;
        return (
          <Card key={b.id} style={[styles.bottleCard, active && styles.bottleCardActive]}>
            <View style={styles.bottleTop}>
              <View style={[styles.dot, { backgroundColor: bottleColorFor(b.colorKey) }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.bottleName}>{b.name}</Text>
                <Text style={styles.bottleVol}>
                  {formatMl(b.volumeMl)}
                  {b.custom ? " · Custom" : " · Preset"}
                  {active ? " · Active" : ""}
                </Text>
              </View>
              <Pressable onPress={() => toggleFavoriteBottle(b.id)} hitSlop={8}>
                <Text style={[styles.star, b.favorite && styles.starOn]}>
                  {b.favorite ? "★" : "☆"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.actionRow}>
              {!active ? (
                <Pressable style={styles.actionBtn} onPress={() => setActiveBottle(b.id)}>
                  <Text style={styles.actionText}>Set active</Text>
                </Pressable>
              ) : (
                <View style={[styles.actionBtn, styles.actionBtnActive]}>
                  <Text style={styles.actionTextActive}>Active</Text>
                </View>
              )}
              <Pressable
                style={styles.actionBtn}
                onPress={() => navigation.navigate("AddEditBottle", { bottleId: b.id })}
              >
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              {b.custom ? (
                <Pressable style={styles.actionBtn} onPress={() => confirmDelete(b)}>
                  <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
                </Pressable>
              ) : null}
            </View>
          </Card>
        );
      })}

      <Button title="＋ Add bottle" onPress={() => navigation.navigate("AddEditBottle", {})} />
      <Button title="Reset default bottles" variant="secondary" onPress={confirmReset} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  activeLabel: { fontSize: font.small, color: colors.textSoft, marginBottom: spacing.sm },
  activeRow: { flexDirection: "row", alignItems: "center" },
  dot: { width: 16, height: 16, borderRadius: 8, marginRight: spacing.md },
  smallDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  activeName: { fontSize: font.h1, fontWeight: "800", color: colors.text },
  activeVol: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  sectionTitle: {
    fontSize: font.h2,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  favRow: { flexDirection: "row", flexWrap: "wrap" },
  favChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  favChipActive: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.teal },
  favChipText: { fontSize: font.small, color: colors.text, fontWeight: "600" },
  bottleCard: { padding: spacing.md },
  bottleCardActive: { borderColor: colors.teal, backgroundColor: colors.panelAlt },
  bottleTop: { flexDirection: "row", alignItems: "center" },
  bottleName: { fontSize: font.body, fontWeight: "700", color: colors.text },
  bottleVol: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  star: { fontSize: 22, color: colors.textMuted },
  starOn: { color: "#E4B23C" },
  actionRow: { flexDirection: "row", marginTop: spacing.md },
  actionBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.slate,
    marginRight: spacing.sm,
  },
  actionBtnActive: { backgroundColor: colors.teal },
  actionText: { fontSize: font.small, fontWeight: "700", color: colors.text },
  actionTextActive: { fontSize: font.small, fontWeight: "700", color: colors.white },
});
