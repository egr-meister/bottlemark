/**
 * Config plugin: add a release signing config to the generated
 * android/app/build.gradle so CI can produce a signed APK and AAB.
 *
 * Credentials are read from environment variables at build time (never stored
 * in the repo):
 *   BOTTLEMARK_UPLOAD_STORE_FILE      absolute path to the PKCS12 keystore
 *   BOTTLEMARK_UPLOAD_STORE_PASSWORD  keystore password
 *   BOTTLEMARK_UPLOAD_KEY_ALIAS       key alias
 *   BOTTLEMARK_UPLOAD_KEY_PASSWORD    key password (same as store password)
 *
 * If the env vars are absent (e.g. local debug builds), the release config
 * simply has no keystore and Gradle falls back to the debug keystore, so
 * `expo run:android` still works during development.
 */
const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let src = cfg.modResults.contents;

    // 1) Insert a `release` signing config inside signingConfigs { ... }.
    if (!src.includes("signingConfigs.release") && /signingConfigs\s*\{/.test(src)) {
      src = src.replace(
        /signingConfigs\s*\{/,
        `signingConfigs {
        release {
            if (System.getenv('BOTTLEMARK_UPLOAD_STORE_FILE')) {
                storeFile file(System.getenv('BOTTLEMARK_UPLOAD_STORE_FILE'))
                storePassword System.getenv('BOTTLEMARK_UPLOAD_STORE_PASSWORD')
                keyAlias System.getenv('BOTTLEMARK_UPLOAD_KEY_ALIAS')
                keyPassword System.getenv('BOTTLEMARK_UPLOAD_KEY_PASSWORD')
            }
        }`
      );
    }

    // 2) Point the release build type at the release signing config.
    src = src.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
      "$1signingConfig signingConfigs.release"
    );

    cfg.modResults.contents = src;
    return cfg;
  });
};
