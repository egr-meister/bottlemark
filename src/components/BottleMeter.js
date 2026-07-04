// Vertical "bottle fill" meter built entirely from Views (no SVG, no images).
// Shows a bottle shape with a water fill representing today's progress, plus
// 1/4, 1/2, 3/4 fraction marks along the side.
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, font } from "../theme";

export default function BottleMeter({ ratio = 0, percent = 0, fillColor, height = 180, width = 96 }) {
  const safeRatio = Math.max(0, Math.min(1, Number(ratio) || 0));
  const color = fillColor || colors.fill;
  const bodyHeight = height;
  const fillHeight = Math.round(bodyHeight * safeRatio);

  return (
    <View style={styles.wrap}>
      {/* Cap */}
      <View style={[styles.cap, { width: width * 0.4 }]} />
      {/* Neck */}
      <View style={[styles.neck, { width: width * 0.44 }]} />
      {/* Body */}
      <View style={[styles.body, { width, height: bodyHeight }]}>
        {/* Water fill grows from bottom */}
        <View
          style={[
            styles.fill,
            { height: fillHeight, backgroundColor: color },
          ]}
        />
        {/* Fraction marks */}
        <View style={[styles.mark, { bottom: bodyHeight * 0.25 }]} />
        <View style={[styles.markStrong, { bottom: bodyHeight * 0.5 }]} />
        <View style={[styles.mark, { bottom: bodyHeight * 0.75 }]} />
        {/* Percent label */}
        <View style={styles.percentWrap} pointerEvents="none">
          <Text style={styles.percentText}>{Math.max(0, Math.round(percent))}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "flex-end" },
  cap: {
    height: 12,
    backgroundColor: colors.slateDark,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  neck: {
    height: 16,
    backgroundColor: colors.panel,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: colors.teal,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  body: {
    borderWidth: 3,
    borderColor: colors.teal,
    borderRadius: radius.lg,
    backgroundColor: colors.panelAlt,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  fill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  mark: {
    position: "absolute",
    left: 0,
    width: 12,
    height: 2,
    backgroundColor: colors.teal,
    opacity: 0.5,
  },
  markStrong: {
    position: "absolute",
    left: 0,
    width: 18,
    height: 2,
    backgroundColor: colors.teal,
    opacity: 0.9,
  },
  percentWrap: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  percentText: {
    fontSize: font.h2,
    fontWeight: "800",
    color: colors.text,
  },
});
