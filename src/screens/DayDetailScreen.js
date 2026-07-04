// Day Detail — entries for one date, with edit / delete / reset-day actions.
import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Screen, Card, Button } from "../components/ui";
import BottleMeter from "../components/BottleMeter";
import { useAppData } from "../context/AppDataContext";
import { colors, spacing, radius, font } from "../theme";
import { fractionLabel } from "../storage/defaults";
import { entriesForDate, sumMl, progress, formatMl } from "../utils/calc";
import { todayStr, prettyDate, isValidDateStr } from "../utils/date";

export default function DayDetailScreen({ navigation, route }) {
  const params = route?.params || {};
  const date = isValidDateStr(params.date) ? params.date : todayStr();
  const { appData, deleteEntry, resetDay } = useAppData();

  const goalMl = Math.max(1, Number(appData.settings?.dailyGoalMl) || 2000);
  const dayEntries = useMemo(
    () => entriesForDate(appData.entries || [], date).slice().sort((a, b) => (a.time > b.time ? 1 : -1)),
    [appData.entries, date]
  );
  const total = sumMl(dayEntries);
  const prog = progress(total, goalMl);

  function confirmDeleteEntry(entry) {
    Alert.alert("Delete entry?", "This bottle entry will be removed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteEntry(entry.id) },
    ]);
  }

  function confirmResetDay() {
    Alert.alert("Reset this day?", "This will remove all bottle entries for the selected day.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset day", style: "destructive", onPress: () => resetDay(date) },
    ]);
  }

  return (
    <Screen>
      <Card tone="panel" style={styles.summary}>
        <BottleMeter ratio={prog.ratio} percent={prog.percent} height={140} width={70} />
        <View style={styles.summaryRight}>
          <Text style={styles.dateBig}>{prettyDate(date)}</Text>
          <Text style={styles.dateSub}>{date}</Text>
          <Text style={styles.totalBig}>{formatMl(total)}</Text>
          <Text style={styles.goalText}>
            of {formatMl(goalMl)} · {prog.reached ? "Goal reached" : `${prog.percent}%`}
          </Text>
        </View>
      </Card>

      <View style={styles.head}>
        <Text style={styles.sectionTitle}>Bottle entries ({dayEntries.length})</Text>
      </View>

      {dayEntries.length === 0 ? (
        <Card tone="panelAlt">
          <Text style={styles.emptyTitle}>No bottle entries for this day.</Text>
          <Text style={styles.emptySub}>Add water from the Home screen for today.</Text>
        </Card>
      ) : (
        dayEntries.map((e) => (
          <Card key={e.id} style={styles.entryCard}>
            <View style={styles.entryTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.entryName}>{e.bottleNameSnapshot || "Bottle"}</Text>
                <Text style={styles.entryMeta}>
                  {fractionLabel(e.fraction)} · {e.time || "--:--"}
                </Text>
              </View>
              <Text style={styles.entryAmount}>{formatMl(e.amountMl)}</Text>
            </View>
            <View style={styles.entryActions}>
              <Pressable
                style={styles.smallBtn}
                onPress={() => navigation.navigate("AddEditEntry", { entryId: e.id })}
              >
                <Text style={styles.smallBtnText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.smallBtn} onPress={() => confirmDeleteEntry(e)}>
                <Text style={[styles.smallBtnText, { color: colors.danger }]}>Delete</Text>
              </Pressable>
            </View>
          </Card>
        ))
      )}

      {date === todayStr() ? (
        <Button title="＋ Add entry" onPress={() => navigation.navigate("AddEditEntry", { date })} />
      ) : null}
      <Button title="Reset this day" variant="danger" onPress={confirmResetDay} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", alignItems: "center" },
  summaryRight: { flex: 1, marginLeft: spacing.lg },
  dateBig: { fontSize: font.h1, fontWeight: "800", color: colors.text },
  dateSub: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  totalBig: { fontSize: 24, fontWeight: "800", color: colors.tealDark, marginTop: spacing.sm },
  goalText: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  head: { marginTop: spacing.md },
  sectionTitle: { fontSize: font.h2, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  emptyTitle: { fontSize: font.body, fontWeight: "700", color: colors.text },
  emptySub: { fontSize: font.small, color: colors.textSoft, marginTop: 4 },
  entryCard: { padding: spacing.md },
  entryTop: { flexDirection: "row", alignItems: "center" },
  entryName: { fontSize: font.body, fontWeight: "700", color: colors.text },
  entryMeta: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  entryAmount: { fontSize: font.h2, fontWeight: "800", color: colors.tealDark },
  entryActions: { flexDirection: "row", marginTop: spacing.sm },
  smallBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.slate,
    marginRight: spacing.sm,
  },
  smallBtnText: { fontSize: font.small, fontWeight: "700", color: colors.text },
});
