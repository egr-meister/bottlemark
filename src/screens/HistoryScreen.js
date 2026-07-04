// History — daily summaries in reverse chronological order (past bottle marks).
import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Screen, Card } from "../components/ui";
import { useAppData } from "../context/AppDataContext";
import { colors, spacing, radius, font } from "../theme";
import { safeNum, formatMl } from "../utils/calc";
import { prettyDate } from "../utils/date";

function buildSummaries(entries, goalMl) {
  const goal = Math.max(1, safeNum(goalMl, 2000));
  const byDate = {};
  (Array.isArray(entries) ? entries : []).forEach((e) => {
    if (!e || !e.date) return;
    if (!byDate[e.date]) byDate[e.date] = { date: e.date, total: 0, count: 0, bottles: {} };
    const d = byDate[e.date];
    d.total += Math.max(0, safeNum(e.amountMl, 0));
    d.count += 1;
    const name = e.bottleNameSnapshot || "Bottle";
    d.bottles[name] = (d.bottles[name] || 0) + 1;
  });
  return Object.values(byDate)
    .map((d) => {
      let topName = null;
      let topCount = -1;
      Object.keys(d.bottles).forEach((n) => {
        if (d.bottles[n] > topCount) {
          topCount = d.bottles[n];
          topName = n;
        }
      });
      return { ...d, mostUsed: topName, reached: d.total >= goal };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export default function HistoryScreen({ navigation }) {
  const { appData } = useAppData();
  const goalMl = appData.settings?.dailyGoalMl;
  const summaries = useMemo(
    () => buildSummaries(appData.entries || [], goalMl),
    [appData.entries, goalMl]
  );

  if (summaries.length === 0) {
    return (
      <Screen>
        <Card tone="panelAlt">
          <Text style={styles.emptyTitle}>No bottle history yet.</Text>
          <Text style={styles.emptySub}>Your logged days will appear here.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      {summaries.map((d) => (
        <Pressable key={d.date} onPress={() => navigation.navigate("DayDetail", { date: d.date })}>
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.date}>{prettyDate(d.date)}</Text>
                <Text style={styles.sub}>{d.date}</Text>
              </View>
              <View style={styles.rightCol}>
                <Text style={styles.total}>{formatMl(d.total)}</Text>
                <View style={[styles.badge, d.reached ? styles.badgeOn : styles.badgeOff]}>
                  <Text style={[styles.badgeText, d.reached ? styles.badgeTextOn : styles.badgeTextOff]}>
                    {d.reached ? "Goal reached" : "Below goal"}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.meta}>
              {d.count} bottle {d.count === 1 ? "entry" : "entries"}
              {d.mostUsed ? ` · Most used: ${d.mostUsed}` : ""}
            </Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md },
  row: { flexDirection: "row", alignItems: "center" },
  date: { fontSize: font.body, fontWeight: "800", color: colors.text },
  sub: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  rightCol: { alignItems: "flex-end" },
  total: { fontSize: font.h2, fontWeight: "800", color: colors.tealDark },
  badge: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  badgeOn: { backgroundColor: colors.panel },
  badgeOff: { backgroundColor: colors.slate },
  badgeText: { fontSize: font.tiny, fontWeight: "700" },
  badgeTextOn: { color: colors.tealDark },
  badgeTextOff: { color: colors.textSoft },
  meta: { fontSize: font.small, color: colors.textSoft, marginTop: spacing.sm },
  emptyTitle: { fontSize: font.body, fontWeight: "700", color: colors.text },
  emptySub: { fontSize: font.small, color: colors.textSoft, marginTop: 4 },
});
