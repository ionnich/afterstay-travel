import { useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

interface MapSliderProps {
  value: number;
  max: number;
  onValueChange: (v: number) => void;
  accentColor: string;
  trackColor: string;
}

export function MapSlider({ value, max, onValueChange, accentColor, trackColor }: MapSliderProps) {
  const trackWidth = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / trackWidth.current));
        onValueChange(Math.round(ratio * max));
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / trackWidth.current));
        onValueChange(Math.round(ratio * max));
      },
    }),
  ).current;

  const fraction = max > 0 ? value / max : 0;

  return (
    <View
      onLayout={(e) => {
        trackWidth.current = e.nativeEvent.layout.width;
      }}
      style={[styles.sliderTrack, { backgroundColor: trackColor }]}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.sliderFill,
          { width: `${fraction * 100}%` as unknown as number, backgroundColor: accentColor },
        ]}
      />
      <View
        style={[
          styles.sliderThumb,
          {
            left: `${fraction * 100}%` as unknown as number,
            backgroundColor: accentColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sliderTrack: {
    height: 3,
    borderRadius: 1.5,
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 1.5,
  },
  sliderThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
    marginTop: -4.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
});
