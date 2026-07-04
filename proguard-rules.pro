# BottleMark ProGuard/R8 rules
# Standard, conservative rules. Enable minify only AFTER verifying a
# non-minified release launches cleanly (see README).
#
# After `expo prebuild`, copy this file to android/app/proguard-rules.pro
# (the CI workflow does this automatically).

# --- React Native core ---
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
    void set*(***);
    *** get*();
}
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }

# --- Hermes ---
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# --- Expo modules ---
-keep class expo.modules.** { *; }
-keep class com.reactnativecommunity.** { *; }

# --- AsyncStorage ---
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep annotations & generic signatures
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod
