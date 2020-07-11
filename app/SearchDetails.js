import React, { Component, useState, useRef, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import Video from 'react-native-video';
const Item = ({ item, onSelect, on1 }) => {
  return (
    <TouchableOpacity onPress={() => onSelect(item.title[3])}>
      <View style={styles.item}>
        <Image source={{ width: 64, height: 64, uri: item.title[0]}}/>
        <View style={styles.names}>
          <Text style={styles.songname}>{item.title[1]}</Text>
          <Text style={styles.artist}>{ item.title[2].map(artist => artist.name).join(', ')}</Text>
        </View>
        {!item.title[3] ? <Image source={require('../img/trip.png')}/> : null}
      </View>
    </TouchableOpacity>
  );
};

export default function SearchDetails(props) {
  const [url, setUrl] = useState(null);
  const [paused, setPause] = useState(true);
  const [curPos, setCurPos] = useState(0);
  const [length, setLength] = useState(1);
  const audioEl = useRef(null);

  const setDuration = (data) => {
    setLength(Math.floor(data.duration));
  }

  const setTime = (data) => {
    setCurPos(Math.floor(data.currentTime));
  }

  const seek = (time) => {
    time = Math.round(time);
    audioEl.current && audioEl.current.seek(time);
    setCurPos(time);
    setPause(false);
  }

  const onPlay = (preview_url) => {
    //pressing first time to play the song
    if(paused) {
      setUrl(preview_url);
      setPause(false);
    }
    //switch to another song and play it
    else if (preview_url !== url) {
      setUrl(preview_url);
      setPause(false);
    }
    // pressing second time the same song to pause it
    else {
      setPause(true);
    }
  }

  const reset = () => {
    setUrl(null);
    setPause(true);
    setCurPos(0);
  }

  return props.result && props.result.length > 0 ? (
    <View>
      <FlatList
        data={props.result}
        keyExtractor={item => item.title[0]+item.title[1]}
        renderItem={({ item }) => <Item item={item} onSelect={(preview_url) => onPlay(preview_url)}/>}
      />
      { url ?
          <Video source={{uri: url}} // Can be a URL or a local file.
            ref={audioEl}
            paused={paused}              // Pauses playback entirely.
            resizeMode="cover"           // Fill the whole screen at aspect ratio.
            repeat={false}                // Repeat forever.
            onLoadStart={() => {}}       // Callback when video starts to load
            onLoad={setDuration}         // Callback when video loads
            onEnd={reset}
            onProgress={setTime}         // Callback every ~250ms with currentTime
            onError={() => {}}           // Callback when video cannot be loaded
          />
        : null
      }
    </View>
  )
  : null;
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 2,
    alignItems: 'center',
  },
  names: {
    flex: 1,
    flexDirection: 'column',
  },
  songname: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    left: 12,
  },
  artist: {
    fontSize: 13,
    color: 'grey',
    fontWeight: 'bold',
    left: 12,
    marginVertical: 5,
  },
  slider: {
    marginTop: -10,
  },
  track: {
    height: 2,
    borderRadius: 1,
  },
});
