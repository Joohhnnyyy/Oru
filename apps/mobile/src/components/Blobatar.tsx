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
    ${AVATAR_STANDALONE_BUNDLE}
  </script>
</head>
<body>
  <div id="avatar-root"></div>
  <script>
    var definition = ${JSON.stringify(definition)};
    var controller = null;

    function mount() {
      var root = document.getElementById('avatar-root');
      if (!window.AvatarWeb || !window.AvatarWeb.createAvatar) {
        setTimeout(mount, 30);
        return;
      }
      root.innerHTML = '';
      try {
        controller = window.AvatarWeb.createAvatar(root, {
          definition: definition,
          defaultAnimation: "${animation}",
          autoplay: true,
          size: "${size}px",
        });
      } catch (err) {
        console.error("Mount error:", err);
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
  }, [definition, size]);

  return (
    <TouchableOpacity
      activeOpacity={interactive ? 0.9 : 1}
      onPress={handleTap}
      disabled={!interactive}
      style={[styles.container, { width: size, height: size }, style]}
    >
      <RNWebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        pointerEvents={interactive ? 'none' : 'auto'}
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
