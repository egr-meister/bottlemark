/**
 * Config plugin: strip the INTERNET permission (and related network permissions)
 * that React Native adds to the generated AndroidManifest by default.
 *
 * BottleMark is fully offline and must NOT request internet access. This plugin
 * removes any <uses-permission> entries for network access and inserts an
 * explicit tools:node="remove" marker so the merged manifest never re-adds them.
 */
const { withAndroidManifest, AndroidConfig } = require("@expo/config-plugins");

const REMOVE = [
  "android.permission.INTERNET",
  "android.permission.ACCESS_NETWORK_STATE",
  "android.permission.ACCESS_WIFI_STATE",
];

module.exports = function withRemoveInternetPermission(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    // Ensure the tools namespace exists so tools:node works.
    manifest.$ = manifest.$ || {};
    manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

    // Drop any permission we don't want.
    if (Array.isArray(manifest["uses-permission"])) {
      manifest["uses-permission"] = manifest["uses-permission"].filter(
        (perm) => !REMOVE.includes(perm?.$?.["android:name"])
      );
    }

    // Add explicit remove markers so manifest-merger keeps them out.
    manifest["uses-permission"] = manifest["uses-permission"] || [];
    REMOVE.forEach((name) => {
      manifest["uses-permission"].push({
        $: {
          "android:name": name,
          "tools:node": "remove",
        },
      });
    });

    return cfg;
  });
};
