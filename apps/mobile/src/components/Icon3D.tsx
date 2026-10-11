import React from 'react';
import { Image, StyleSheet, View, StyleProp, ViewStyle, ImageStyle } from 'react-native';

const ICON_MAP = {
  truck: require('../../assets/icons3d/truck.png'),
  recycle: require('../../assets/icons3d/recycle.png'),
  bin: require('../../assets/icons3d/bin.png'),
  camera: require('../../assets/icons3d/camera.png'),
  home: require('../../assets/icons3d/home.png'),
  map: require('../../assets/icons3d/map.png'),
  tasks: require('../../assets/icons3d/tasks.png'),
  profile: require('../../assets/icons3d/profile.png'),
  scan: require('../../assets/icons3d/QR.png'),
  qr: require('../../assets/icons3d/QR.png'),
  credit: require('../../assets/icons3d/credit.png'),
  flame: require('../../assets/icons3d/flame.png'),
  shield: require('../../assets/icons3d/shield.png'),
  bins_dual: require('../../assets/icons3d/bins_dual.png'),
  dump_spot: require('../../assets/icons3d/dump_spot.png'),
};

export type Icon3DName = keyof typeof ICON_MAP;

interface Icon3DProps {
  name: Icon3DName;
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export const Icon3D: React.FC<Icon3DProps> = ({
  name,
  size = 40,
  style,
  imageStyle,
}) => {
  const source = ICON_MAP[name] || ICON_MAP.bin;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={source}
        style={[
          styles.image,
          { width: size, height: size },
          imageStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    overflow: 'hidden',
  },
});
