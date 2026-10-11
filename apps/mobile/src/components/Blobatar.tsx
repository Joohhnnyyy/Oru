import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import {
  AVATAR_PRESETS,
  AVATAR_STANDALONE_BUNDLE,
  AvatarPresetKey,
  AvatarAnimationKey,
} from '../avatar/avatarRuntimeSource';

const RNWebView = WebView as any;

interface BlobatarProps {
  preset?: AvatarPresetKey;
  animation?: AvatarAnimationKey;
  size?: number;
  bodyColor?: string;
  eyeColor?: string;
  interactive?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const PLAYFUL_CYCLE: AvatarAnimationKey[] = [
  'playful',
  'excited',
  'happy',
  'celebrate',
  'proud',
  'laughing',
  'curious',
  'idle',
];

export const Blobatar: React.FC<BlobatarProps> = ({
  preset = 'safari-mint',
  animation = 'idle',
  size = 120,
  bodyColor,
  eyeColor,
  interactive = true,
  onPress,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [playfulIndex, setPlayfulIndex] = useState(0);

  // Compute avatar definition with optional dynamic color overrides
  const definition = useMemo(() => {
    const base = AVATAR_PRESETS[preset] || AVATAR_PRESETS['safari-mint'] || AVATAR_PRESETS['strobi'];
    const clone = JSON.parse(JSON.stringify(base));
    if (bodyColor) clone.colors.body = bodyColor;
    if (eyeColor) clone.colors.eyes = eyeColor;
    if (clone.colors?.body) clone.colors.body = clone.colors.body.toLowerCase();
    if (clone.colors?.eyes) clone.colors.eyes = clone.colors.eyes.toLowerCase();
    if (clone.expressions) {
      Object.keys(clone.expressions).forEach((k) => {
        const exp = clone.expressions[k];
        if (exp.colors?.body) exp.colors.body = exp.colors.body.toLowerCase();
        if (exp.colors?.eyes) exp.colors.eyes = exp.colors.eyes.toLowerCase();
      });
    }
    return clone;
  }, [preset, bodyColor, eyeColor]);

  // Sync animation updates into WebView
  useEffect(() => {
    const jsCode = `
      if (window.playAnimation) {
        window.playAnimation("${animation}");
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(jsCode);
  }, [animation]);

  const handleTap = () => {
    if (!interactive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const nextAnim = PLAYFUL_CYCLE[(playfulIndex + 1) % PLAYFUL_CYCLE.length];
    setPlayfulIndex((prev) => (prev + 1) % PLAYFUL_CYCLE.length);

    const jsCode = `
      if (window.playAnimation) {
        window.playAnimation("${nextAnim}");
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(jsCode);

    if (onPress) {
      onPress();
    }
  };

  const htmlContent = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-tap-highlight-color: transparent;
    }
    #avatar-root {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bs-avatar {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      height: 100% !important;
    }
    svg {
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      display: block;
    }
  </style>
  <script>
    window.onerror = function(msg, url, line) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage("JS Error: " + msg + " at " + line);
      }
    };
    try {
      ${AVATAR_STANDALONE_BUNDLE}
      if (typeof AvatarWeb !== 'undefined') {
        window.AvatarWeb = AvatarWeb;
      }
    } catch (e) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage("Bundle eval error: " + e.message);
      }
    }
  </script>
</head>
<body>
  <div id="avatar-root"></div>
  <script>
    var definition = ${JSON.stringify(definition)};
    var controller = null;

    function mount() {
      var root = document.getElementById('avatar-root');
      var lib = window.AvatarWeb || (typeof AvatarWeb !== 'undefined' ? AvatarWeb : null);
      if (!lib || !lib.createAvatar) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage("Waiting for AvatarWeb... type=" + (typeof AvatarWeb));
        }
        setTimeout(mount, 50);
        return;
      }
      root.innerHTML = '';
      try {
        controller = lib.createAvatar(root, {
          definition: definition,
          defaultAnimation: "${animation}",
          autoplay: true,
          size: "${size}px",
        });
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage("Avatar mounted! HTML: " + root.innerHTML.slice(0, 300));
        }
      } catch (err) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage("Mount error: " + (err ? (err.message || err.toString()) : "unknown"));
        }
      }
    }

    mount();

    window.playAnimation = function(name) {
      if (controller && controller.play) {
        controller.play(name);
      }
    };
  </script>
</body>
</html>
    `;
  }, [definition, size, animation, preset]);

  return (
    <TouchableOpacity
      activeOpacity={interactive ? 0.9 : 1}
      onPress={handleTap}
      disabled={!interactive}
      style={[styles.container, { width: size, height: size }, style]}
      accessibilityRole={interactive ? 'button' : undefined}
      accessibilityLabel={interactive ? 'Avatar, tap to react' : undefined}
    >
      <RNWebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={{ width: size, height: size, backgroundColor: 'transparent' }}
        containerStyle={{ width: size, height: size, backgroundColor: 'transparent' }}
        androidLayerType="hardware"
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        pointerEvents={interactive ? 'none' : 'auto'}
        onMessage={(event: any) => {
          console.log('[Blobatar WebView Log]', event.nativeEvent.data);
        }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  webView: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
});
