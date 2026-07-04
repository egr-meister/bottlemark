// Welcome / Onboarding — shown on first launch. Introduces bottle-based,
// manual, offline tracking and lets the user pick a starting bottle.
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Screen, Button, Card } from "../components/ui";
import BottleMeter from "../components/BottleMeter";
import { useAppData } from "../context/AppDataContext";
import { colors, spacing, radius, font } from "../theme";
import { bottleColorFor } from "../theme";
import { formatMl } from "../utils/calc";

export default function OnboardingScreen({ navigation }) {
  const { appData, completeOnboarding } = useAppData();
  const bottles = appData.bottles && appData.bottles.length ? appData.bottles : [];
  const defaultActive = appData.settings?.activeBottleId || (bottles[0] && bottles[0].id) || null;
  const [selectedId, setSelectedId] = useState(defaultActive);

  function finish(bottleId) {
    completeOnboarding(bottleId);
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <BottleMeter ratio={0.5} percent={50} height={150} width={82} />
        <Text style={styles.title}>BottleMark</Text>
        <Text style={styles.subtitle}>Track water through the bottles you actually use.</Text>
      </View>

      <Card tone="panel">
        <Text style={styles.point}>• Log 1/4, 1/2, 3/4, or a full bottle with a tap.</Text>
        <Text style={styles.point}>• Choose or create bottles with your own volumes.</Text>
        <Text style={styles.point}>• Water entries are added manually.</Text>
        <Text style={styles.point}>• No sensors. No Health Connect. No account. Works offline.</Text>
      </Card>

      <Text style={styles.chooseLabel}>Choose your starting bottle</Text>
      <View style={styles.grid}>
        {bottles.map((b) => {
          const active = b.id === selectedId;
          return (
            <Pressable
              key={b.id}
              onPress={() => setSelectedId(b.id)}
              style={[styles.bottleCard, active && styles.bottleCardActive]}
            >
              <View style={[styles.dot, { backgroundColor: bottleColorFor(b.colorKey) }]} />
              <Text style={styles.bottleName}>{b.name}</Text>
              <Text style={styles.bottleVol}>{formatMl(b.volumeMl)}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button title="Choose Bottle" onPress={() => finish(selectedId)} />
      <Button
        title="Use Default Bottle"
        variant="secondary"
        onPress={() => finish(defaultActive)}
      />

      <Text style={styles.disclaimer}>
        BottleMark is a manual bottle-based water tracker. It does not detect drinking
        automatically and does not connect to Health Connect, Google Fit, sensors, or
        wearable devices.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", marginTop: spacing.lg, marginBottom: spacing.lg },
  title: { fontSize: 30, fontWeight: "800", color: colors.text, marginTop: spacing.md },
  subtitle: {
    fontSize: font.body,
    color: colors.textSoft,
    textAlign: "center",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  point: { fontSize: font.body, color: colors.text, marginBottom: spacing.sm, lineHeight: 21 },
  chooseLabel: {
    fontSize: font.h2,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  bottleCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bottleCardActive: { borderColor: colors.teal, backgroundColor: colors.panelAlt },
  dot: { width: 16, height: 16, borderRadius: 8, marginBottom: spacing.sm },
  bottleName: { fontSize: font.body, fontWeight: "700", color: colors.text },
  bottleVol: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  disclaimer: {
    fontSize: font.small,
    color: colors.textMuted,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
