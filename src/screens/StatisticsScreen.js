// Statistics — a calm "bottle usage report". Simple views only, no chart lib.
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Screen, Card } from "../components/ui";
import { useAppData } from "../context/AppDataContext";
import { colors, spacing, radius, font } from "../theme";
import { computeStats } from "../utils/stats";
import { formatMl } from "../utils/calc";
import { prettyDate } from "../utils/date";
import { fractionLabel, FRACTIONS } from "../storage/defaults";

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function StatisticsScreen() {
  const { appData } = useAppData();
  const goalMl = appData.settings?.dailyGoalMl;
  const stats = useMemo(
    () => computeStats(appData.entries || [], goalMl),
    [appData.entries, goalMl]
  );

  const weekMax = Math.max(1, ...stats.week.map((d) => d.total));
  const maxByBottle = Math.max(1, ...stats.amountByBottle.map((b) => b.amountMl));
  const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Screen>
      <View style={styles.grid}>
        <StatBox label="Today" value={formatMl(stats.todayTotal)} />
        <StatBox label="Last 7 days" value={formatMl(stats.total7)} />
        <StatBox label="Last 30 days" value={formatMl(stats.total30)} />
        <StatBox label="7-day average" value={formatMl(stats.avg7)} />
        <StatBox
          label="Best day"
          value={stats.bestDate ? formatMl(stats.bestTotal) : "—"}
        />
        <StatBox label="Bottles logged" value={String(stats.totalBottlesLogged)} />
      </View>

      {stats.bestDate ? (
        <Text style={styles.note}>Best day so far: {prettyDate(stats.bestDate)}</Text>
      ) : null}

      {/* Weekly mini chart */}
      <Text style={styles.sectionTitle}>Last 7 days</Text>
      <Card>
        <View style={styles.chart}>
          {stats.week.map((d) => {
            const h = Math.round((d.total / weekMax) * 90);
            const dow = (() => {
              const parts = (d.date || "").split("-").map(Number);
              const dt = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
              return weekdayShort[dt.getDay()] || "";
            })();
            return (
              <View key={d.date} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { height: Math.max(3, h) }]} />
                </View>
                <Text style={styles.barLabel}>{dow}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Goal days */}
      <Text style={styles.sectionTitle}>Goal days</Text>
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.rowLabel}>Last 7 days</Text>
          <Text style={styles.rowValue}>{stats.goalDays7} of 7</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.rowLabel}>Last 30 days</Text>
          <Text style={styles.rowValue}>{stats.goalDays30} of 30</Text>
        </View>
      </Card>

      {/* Bottle usage */}
      <Text style={styles.sectionTitle}>Bottle usage</Text>
      <Card>
        <Text style={styles.usageLine}>Most used bottle: {stats.mostUsedBottle}</Text>
        <Text style={styles.usageLine}>Most used amount: {stats.mostUsedFraction}</Text>
        <View style={styles.fractionChips}>
          {FRACTIONS.map((f) => (
            <View key={f.key} style={styles.fChip}>
              <Text style={styles.fChipLabel}>{f.label}</Text>
              <Text style={styles.fChipCount}>{stats.fractionCounts[f.key] || 0}</Text>
            </View>
          ))}
          <View style={styles.fChip}>
            <Text style={styles.fChipLabel}>Custom</Text>
            <Text style={styles.fChipCount}>{stats.fractionCounts.custom || 0}</Text>
          </View>
        </View>
      </Card>

      {/* Amount by bottle */}
      <Text style={styles.sectionTitle}>Amount by bottle</Text>
      {stats.amountByBottle.length === 0 ? (
        <Card tone="panelAlt">
          <Text style={styles.emptySub}>No bottle entries yet.</Text>
        </Card>
      ) : (
        <Card>
          {stats.amountByBottle.map((b) => (
            <View key={b.name} style={styles.usageRow}>
              <View style={styles.usageHead}>
                <Text style={styles.usageName}>{b.name}</Text>
                <Text style={styles.usageAmount}>{formatMl(b.amountMl)}</Text>
              </View>
              <View style={styles.usageTrack}>
                <View
                  style={[styles.usageFill, { width: `${Math.round((b.amountMl / maxByBottle) * 100)}%` }]}
                />
              </View>
              <Text style={styles.usageCount}>{b.count} {b.count === 1 ? "entry" : "entries"}</Text>
            </View>
          ))}
        </Card>
      )}

      <Text style={styles.disclaimer}>
        These numbers reflect the bottle entries you added manually. BottleMark makes no
        medical or performance claims.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statBox: {
    width: "31%",
    backgroundColor: colors.panelAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  statValue: { fontSize: font.body, fontWeight: "800", color: colors.tealDark, textAlign: "center" },
  statLabel: { fontSize: font.tiny, color: colors.textSoft, marginTop: 4, textAlign: "center" },
  note: { fontSize: font.small, color: colors.textSoft, marginBottom: spacing.sm },
  sectionTitle: {
    fontSize: font.h2,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chart: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 118 },
  barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  barTrack: { height: 92, justifyContent: "flex-end" },
  bar: { width: 16, backgroundColor: colors.fill, borderRadius: 4 },
  barLabel: { fontSize: font.tiny, color: colors.textSoft, marginTop: 6 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm },
  rowLabel: { fontSize: font.body, color: colors.text },
  rowValue: { fontSize: font.body, fontWeight: "800", color: colors.tealDark },
  usageLine: { fontSize: font.body, color: colors.text, marginBottom: spacing.sm },
  fractionChips: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.xs },
  fChip: {
    backgroundColor: colors.slate,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: "center",
  },
  fChipLabel: { fontSize: font.small, fontWeight: "700", color: colors.text },
  fChipCount: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  usageRow: { marginBottom: spacing.md },
  usageHead: { flexDirection: "row", justifyContent: "space-between" },
  usageName: { fontSize: font.body, fontWeight: "700", color: colors.text },
  usageAmount: { fontSize: font.body, fontWeight: "800", color: colors.tealDark },
  usageTrack: {
    height: 10,
    backgroundColor: colors.slate,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  usageFill: { height: 10, backgroundColor: colors.teal, borderRadius: radius.pill },
  usageCount: { fontSize: font.tiny, color: colors.textSoft, marginTop: 4 },
  emptySub: { fontSize: font.small, color: colors.textSoft },
  disclaimer: { fontSize: font.small, color: colors.textMuted, marginTop: spacing.lg, lineHeight: 18 },
});
