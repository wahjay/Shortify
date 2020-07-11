import React, { Component } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

import Slider from '@react-native-community/slider';

// helper func to display time elasped and time left for the song
function pad(n, width, z=0) {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// func (secs) => [mins, secs]
const minutesAndSeconds = (position) => ([
  pad(Math.floor(position / 60), 2),
  pad(position % 60, 2),
]);

export default function SeekBar({trackLength, currentPosition, onSeek, onSlidingStart}) {
  const elapsed = minutesAndSeconds(currentPosition);
  const remaining = minutesAndSeconds(trackLength - currentPosition);
  const maxVal = Math.max(trackLength, 1, currentPosition + 1);

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.text}>
          {!isNaN(elapsed[0]) && !isNaN(elapsed[1]) && elapsed[0] + ":" + elapsed[1]}
        </Text>
        <View style={{flex: 1}} />
        <Text style={[styles.text, {width: 40}]}>
          {trackLength > 1 && "-" + remaining[0] + ":" + remaining[1]}
        </Text>
      </View>
      <Slider
        maximumValue={ maxVal ? maxVal : 1}
        value={currentPosition ? currentPosition : 0}
        onSlidingStart={onSlidingStart}
        onSlidingComplete={onSeek}
        style={styles.slider}
        minimumTrackTintColor='#fff'
        maximumTrackTintColor='rgba(255, 255, 255, 0.14)'
        thumbImage={require('../img/white_dot.png')}
        trackStyle={styles.track}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slider: {
    marginTop: -10,
  },
  container: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
  },
  track: {
    height: 2,
    borderRadius: 1,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
    textAlign:'center',
  }
});
