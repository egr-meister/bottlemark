// Small reusable UI primitives for the "Bottle Fill Board" style.
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius, font } from "../theme";

// Screen wrapper with safe area + background.
export function Screen({ children, scroll = true, style }) {
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.plain, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {inner}
    </SafeAreaView>
  );
}

// A rounded white/panel card.
export function Card({ children, style, tone = "card" }) {
  const bg =
    tone === "panel" ? colors.panel : tone === "panelAlt" ? colors.panelAlt : colors.card;
  return <View style={[styles.card, { backgroundColor: bg }, style]}>{children}</View>;
}

// Pressable card (whole card acts as a button).
export function TouchCard({ children, onPress, style, tone = "card" }) {
  const bg =
    tone === "panel" ? colors.panel : tone === "panelAlt" ? colors.panelAlt : colors.card;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: bg, opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

export function Label({ children, style }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

// Primary / secondary / danger button.
export function Button({ title, onPress, variant = "primary", style, disabled }) {
  const palette = {
    primary: { bg: colors.teal, fg: colors.white },
    secondary: { bg: colors.slate, fg: colors.text },
    ghost: { bg: "transparent", fg: colors.teal },
    danger: { bg: colors.dangerBg, fg: colors.danger },
  }[variant] || { bg: colors.teal, fg: colors.white };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === "ghost" && styles.buttonGhost,
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: palette.fg }]}>{title}</Text>
    </Pressable>
  );
}

// Small pill chip.
export function Chip({ label, active, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        { opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

// Labeled text field with validation text.
export function Field({ label, value, onChangeText, placeholder, keyboardType, error, maxLength }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType || "default"}
        maxLength={maxLength}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// Simple header row with title + optional right action.
export function Header({ title, subtitle, right }) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

// A tiny icon-like round button using a text glyph (no image assets).
export function GlyphButton({ glyph, onPress, tone = "slate" }) {
  const bg = tone === "teal" ? colors.teal : colors.slate;
  const fg = tone === "teal" ? colors.white : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.glyphBtn, { backgroundColor: bg, opacity: pressed ? 0.8 : 1 }]}
    >
      <Text style={[styles.glyphText, { color: fg }]}>{glyph}</Text>
    </Pressable>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  plain: { flex: 1, padding: spacing.lg },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: font.h2,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  label: { fontSize: font.small, color: colors.textSoft },
  button: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  buttonGhost: { borderWidth: 1, borderColor: colors.teal },
  buttonText: { fontSize: font.body, fontWeight: "700" },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.slate,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActive: { backgroundColor: colors.teal },
  chipText: { color: colors.text, fontSize: font.small, fontWeight: "600" },
  chipTextActive: { color: colors.white },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: font.small, color: colors.textSoft, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: font.body,
    color: colors.text,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: font.small, marginTop: spacing.xs },
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  headerTitle: { fontSize: font.title, fontWeight: "800", color: colors.text },
  headerSubtitle: { fontSize: font.small, color: colors.textSoft, marginTop: 2 },
  glyphBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  glyphText: { fontSize: 18, fontWeight: "700" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
});
