import React from 'react';
import { Image, StyleSheet, View, StyleProp, ViewStyle, ImageStyle } from 'react-native';

const ICON_MAP = {
  truck: require('../../assets/icons3d/truck.jpg'),
  recycle: require('../../assets/icons3d/recycle.jpg'),
  bin: require('../../assets/icons3d/bin.jpg'),
  camera: require('../../assets/icons3d/camera.jpg'),
  home: require('../../assets/icons3d/home.jpg'),
  map: require('../../assets/icons3d/map.jpg'),
  tasks: require('../../assets/icons3d/tasks.jpg'),
  profile: require('../../assets/icons3d/profile.jpg'),
  scan: require('../../assets/icons3d/scan.jpg'),
  credit: require('../../assets/icons3d/credit.jpg'),
  flame: require('../../assets/icons3d/flame.jpg'),
  shield: require('../../assets/icons3d/shield.jpg'),
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
  const source = ICON_MAP[name];

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={source}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size * 0.28 },
          imageStyle,
        ]}
        resizeMode="cover"
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
