// BottleMark Home — the "Bottle Fill Board".
// Active bottle is the main object; partial controls (1/4, 1/2, 3/4, Full)
// are the core interaction. Not a circle tracker, drop grid, or dashboard.
import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Screen, Card, GlyphButton } from "../components/ui";
import BottleMeter from "../components/BottleMeter";
import { useAppData } from "../context/AppDataContext";
import { colors, spacing, radius, font, bottleColorFor } from "../theme";
import { FRACTIONS, fractionLabel } from "../storage/defaults";
import {
  amountForFraction,
  totalForDate,
  entriesForDate,
  progress,
  formatMl,
  remainingMessage,
  bottleVolume,
} from "../utils/calc";
import { todayStr, prettyDate, currentHour } from "../utils/date";
import { getReminder } from "../utils/reminders";

export default function HomeScreen({ navigation }) {
  const { appData, activeBottle, addFractionEntry } = useAppData();

  const today = todayStr();
  const entries = appData.entries || [];
  const goalMl = Math.max(1, Number(appData.settings?.dailyGoalMl) || 2000);
  const reminders = appData.settings?.reminders;

  const todayEntries = useMemo(() => entriesForDate(entries, today), [entries, today]);
  const totalMl = useMemo(() => totalForDate(entries, today), [entries, today]);
  const prog = progress(totalMl, goalMl);
  const fillColor = bottleColorFor(activeBottle?.colorKey);

  const reminder = getReminder({
    totalMl,
    goalMl,
    reminders,
    hour: currentHour(),
  });

  function logFraction(key) {
    addFractionEntry(key);
  }

  return (
    <Screen>
      {/* Compact top header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appTitle}>BottleMark</Text>
          <Text style={styles.dateText}>{prettyDate(today)}</Text>
        </View>
        <GlyphButton glyph="⚙" onPress={() => navigation.navigate("Settings")} />
      </View>

      <Text style={styles.modeLine}>Manual bottle tracking</Text>

      {/* Bottle fill panel */}
      <Card tone="panel" style={styles.fillPanel}>
        <BottleMeter ratio={prog.ratio} percent={prog.percent} fillColor={fillColor} height={190} width={92} />
        <View style={styles.panelRight}>
          <View style={styles.bottleTag}>
            <View style={[styles.dot, { backgroundColor: fillColor }]} />
            <Text style={styles.bottleName} numberOfLines={1}>
              {activeBottle?.name || "Bottle"}
            </Text>
          </View>
          <Text style={styles.bottleVol}>{formatMl(bottleVolume(activeBottle))} per bottle</Text>

          <View style={styles.totalRow}>
            <Text style={styles.totalBig}>{formatMl(totalMl)}</Text>
            <Text style={styles.goalSmall}>of {formatMl(goalMl)}</Text>
          </View>
          <Text style={styles.remaining}>
            {prog.reached ? "Goal reached" : remainingMessage(prog.remaining, activeBottle)}
          </Text>

          <Pressable style={styles.changeBottle} onPress={() => navigation.navigate("BottleSettings")}>
            <Text style={styles.changeBottleText}>Change bottle</Text>
          </Pressable>
        </View>
      </Card>

      {/* Partial controls */}
      <Text style={styles.helper}>Choose how much of your bottle you drank</Text>
      <View style={styles.fractionRow}>
        {FRACTIONS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => logFraction(f.key)}
            style={({ pressed }) => [styles.fractionBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.fractionLabel}>{f.label}</Text>
            <Text style={styles.fractionAmount}>{formatMl(amountForFraction(activeBottle, f.key))}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => logFraction("full")}
        style={({ pressed }) => [styles.fullBtn, { opacity: pressed ? 0.85 : 1 }]}
      >
        <Text style={styles.fullBtnText}>＋  Drank full bottle</Text>
        <Text style={styles.fullBtnSub}>{formatMl(bottleVolume(activeBottle))} · {activeBottle?.name || "Bottle"}</Text>
      </Pressable>

      {/* In-app reminder card */}
      {reminder ? (
        <Card tone="card" style={styles.reminderCard}>
          <Text style={styles.reminderTitle}>{reminder.title}</Text>
          <Text style={styles.reminderMsg}>{reminder.message}</Text>
        </Card>
      ) : null}

      {/* Today's bottle marks */}
      <View style={styles.entriesHead}>
        <Text style={styles.sectionTitle}>Today's bottle marks</Text>
        {todayEntries.length > 0 ? (
          <Pressable onPress={() => navigation.navigate("DayDetail", { date: today })}>
            <Text style={styles.linkText}>Open day</Text>
          </Pressable>
        ) : null}
      </View>

      {todayEntries.length === 0 ? (
        <Card tone="panelAlt">
          <Text style={styles.emptyTitle}>No bottle entries today.</Text>
          <Text style={styles.emptySub}>Tap 1/4, 1/2, 3/4, or Full to start.</Text>
        </Card>
      ) : (
        <View>
          {todayEntries.slice(0, 5).map((e) => (
            <Pressable
              key={e.id}
              onPress={() => navigation.navigate("AddEditEntry", { entryId: e.id })}
              style={styles.markRow}
            >
              <View style={[styles.markDot, { backgroundColor: bottleColorFor(activeBottle?.colorKey) }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.markName}>{e.bottleNameSnapshot || "Bottle"}</Text>
                <Text style={styles.markMeta}>
                  {fractionLabel(e.fraction)} · {e.time || "--:--"}
                </Text>
              </View>
              <Text style={styles.markAmount}>{formatMl(e.amountMl)}</Text>
            </Pressable>
          ))}
          {todayEntries.length > 5 ? (
            <Text style={styles.moreText}>+{todayEntries.length - 5} more today</Text>
          ) : null}
        </View>
      )}

      {/* Shortcuts as distinct small cards */}
      <View style={styles.shortcutRow}>
        <Pressable style={styles.shortcut} onPress={() => navigation.navigate("History")}>
          <Text style={styles.shortcutGlyph}>▤</Text>
          <Text style={styles.shortcutTitle}>History</Text>
          <Text style={styles.shortcutSub}>Past bottle marks</Text>
        </Pressable>
        <Pressable style={styles.shortcut} onPress={() => navigation.navigate("Statistics")}>
          <Text style={styles.shortcutGlyph}>▦</Text>
          <Text style={styles.shortcutTitle}>Statistics</Text>
          <Text style={styles.shortcutSub}>Bottle report</Text>
        </Pressable>
        <Pressable style={styles.shortcut} onPress={() => navigation.navigate("BottleSettings")}>
          <Text style={styles.shortcutGlyph}>⌾</Text>
          <Text style={styles.shortcutTitle}>Bottles</Text>
          <Text style={styles.shortcutSub}>Manage bottles</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  appTitle: { fontSize: font.title, fontWeight: "800", color: colors.text },
  dateText: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  modeLine: { fontSize: font.small, color: colors.teal, fontWeight: "700", marginTop: spacing.sm },

  fillPanel: { flexDirection: "row", alignItems: "center", marginTop: spacing.md },
  panelRight: { flex: 1, marginLeft: spacing.lg },
  bottleTag: { flexDirection: "row", alignItems: "center" },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: spacing.sm },
  bottleName: { fontSize: font.h1, fontWeight: "800", color: colors.text, flexShrink: 1 },
  bottleVol: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  totalRow: { flexDirection: "row", alignItems: "flex-end", marginTop: spacing.md },
  totalBig: { fontSize: 26, fontWeight: "800", color: colors.tealDark },
  goalSmall: { fontSize: font.small, color: colors.textSoft, marginLeft: spacing.sm, marginBottom: 4 },
  remaining: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  changeBottle: { marginTop: spacing.md, alignSelf: "flex-start" },
  changeBottleText: { color: colors.teal, fontWeight: "700", fontSize: font.small },

  helper: { fontSize: font.small, color: colors.textSoft, marginTop: spacing.lg, marginBottom: spacing.sm },
  fractionRow: { flexDirection: "row", justifyContent: "space-between" },
  fractionBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    marginHorizontal: 3,
    alignItems: "center",
  },
  fractionLabel: { fontSize: font.h2, fontWeight: "800", color: colors.tealDark },
  fractionAmount: { fontSize: font.tiny, color: colors.textSoft, marginTop: 4 },

  fullBtn: {
    backgroundColor: colors.teal,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginTop: spacing.md,
  },
  fullBtnText: { color: colors.white, fontSize: font.h1, fontWeight: "800" },
  fullBtnSub: { color: colors.fillSoft, fontSize: font.small, marginTop: 2 },

  reminderCard: { marginTop: spacing.lg, borderColor: colors.slateDark, backgroundColor: colors.sand },
  reminderTitle: { fontSize: font.body, fontWeight: "800", color: colors.sandText },
  reminderMsg: { fontSize: font.small, color: colors.text, marginTop: 4 },

  entriesHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  sectionTitle: { fontSize: font.h2, fontWeight: "700", color: colors.text },
  linkText: { color: colors.teal, fontWeight: "700", fontSize: font.small },
  emptyTitle: { fontSize: font.body, fontWeight: "700", color: colors.text },
  emptySub: { fontSize: font.small, color: colors.textSoft, marginTop: 4 },

  markRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  markDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.md },
  markName: { fontSize: font.body, fontWeight: "700", color: colors.text },
  markMeta: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  markAmount: { fontSize: font.body, fontWeight: "800", color: colors.tealDark },
  moreText: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },

  shortcutRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.lg },
  shortcut: {
    flex: 1,
    backgroundColor: colors.panelAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: 3,
    alignItems: "center",
  },
  shortcutGlyph: { fontSize: 22, color: colors.teal },
  shortcutTitle: { fontSize: font.small, fontWeight: "800", color: colors.text, marginTop: 4 },
  shortcutSub: { fontSize: font.tiny, color: colors.textSoft, marginTop: 2, textAlign: "center" },
});
