import React, { Component, useState, useEffect, useRef } from 'react';
import {
  View,
  SafeAreaView,
  Text,
  StatusBar,
} from 'react-native';

import Header from './Header';
import AlbumArt from './AlbumArt';
import TrackDetails from './TrackDetails';
import SeekBar from './SeekBar';
import Controls from './Controls';
import Video from 'react-native-video';

const tempAlbum = "http://36.media.tumblr.com/14e9a12cd4dca7a3c3c4fe178b607d27/tumblr_nlott6SmIh1ta3rfmo1_1280.jpg";
const tempAudio= "https://p.scdn.co/mp3-preview/8d3df1c64907cb183bff5a127b1525b530992afb?cid=570e62863f2845079d42d663030e4b52";

export default function Player(props) {
  const [paused, setPause] = useState(true);
  const [totalLength, setLength] = useState(1);
  const [curPosition, setCurPos] = useState(0);
  const [curTrack, setTrack] = useState(0);       // current playing track
  const [repeatOn, setRepeat] = useState(false);
  const [shuffleOn, setShuffle] = useState(false);
  const [isChanging, setChange] = useState(false);
  const [tracks, setTracks] = useState(null);     // playlist
  const audioEl = useRef(null);

  useEffect(() => {
    const get_playlistUrl = 'https://api.spotify.com/v1/playlists/2fJ9ky4JZd6p4WIkKBFTXv/tracks';
    fetch(get_playlistUrl, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + props.token }
    })
    .then(result => result.json())
    .then(body => {
      const items = body.items;
      //fetch another 100 tracks
      fetch(get_playlistUrl + '?offset=100', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + props.token }
      })
      .then(resm => resm.json())
      .then(datam => {
        items && items.length > 0 && setTracks(items.concat(datam.items));
      })
    });
  }, [props.token]);

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

  // some tracks don't have preview of the song
  const onBack = () => {
    if (curPosition < 10 && curTrack > 0) {
      let cur = curTrack;
      while(cur > 0 && !tracks[cur-1].track.preview_url) {
        cur--;
      }

      audioEl.current && audioEl.current.seek(0);
      setChange(true);
      setTimeout(() => {
        setCurPos(0);
        setPause(false);
        setLength(1);
        setChange(false);
        setTrack(cur - 1);
      }, 0);
    } else {
      audioEl.current.seek(0);
      setCurPos(0);
    }
  }

  const onForward = () => {
    if (curTrack < tracks.length - 1) {
      let cur = curTrack;
      while(!tracks[cur+1].track.preview_url) {
        cur++;
      }

      if(cur+1 >= tracks.length - 1) {
        return;
      }

      audioEl.current && audioEl.current.seek(0);
      setChange(true);
      setTimeout(() => {
        setCurPos(0);
        setPause(false);
        setLength(1);
        setChange(false);
        setTrack(cur + 1);
      }, 0);
    }
  }

  const onNext = () => {
    //the next song does not have available audio, skip to next
    if(!tracks[curTrack+1].track.preview_url) {
      let cur = curTrack;
      while(!tracks[cur+1].track.preview_url) {
        cur++;
      }
      setTrack(cur+1);
    }

    //if loop button is on, dont increment the current track
    if(!repeatOn) {
      setTrack(track => track + 1);
    }

    //if shuffle button is on, get a random track, and play it.
    //if the repeat button is also on, dont shuffle to next song.
    if(!repeatOn && shuffleOn) {
      let randNum = Math.floor(Math.random()*tracks.length);
      while(!tracks[randNum].track.preview_url) {
        randNum = Math.floor(Math.random()*tracks.length);
      }

      setTrack(randNum);
    }
  }

  const getAudio = tracks && tracks[curTrack] && tracks[curTrack].track.preview_url ?
    tracks[curTrack].track.preview_url : tempAudio;

  return (
    <SafeAreaView style={[styles.container, {borderTopLeftRadius: props.left, borderTopRightRadius: props.right}]}>
      {tracks ?
        (<View>
          <StatusBar hidden={true} />
          <Header
            message="Playing From Charts"
            onDownPress={props.onHide}
            onMessagePress={props.onShow}
          />
          <AlbumArt url={tracks ? tracks[curTrack].track.album.images[0].url : tempAlbum} />
          <TrackDetails
            title={tracks && tracks[curTrack].track.album.name}
            artist={tracks && tracks[curTrack].track.album.artists[0].name}
          />
          <SeekBar
            onSeek={seek}
            trackLength={totalLength}
            onSlidingStart={() => setPause(true)}
            currentPosition={curPosition} />
          <Controls
            onPressRepeat={() => setRepeat(repeatOn => !repeatOn)}
            repeatOn={repeatOn}
            shuffleOn={shuffleOn}
            forwardDisabled={tracks && curTrack === tracks.length - 1}
            onPressShuffle={() => setShuffle(shuffleOn => !shuffleOn)}
            onPressPlay={() => setPause(false)}
            onPressPause={() => setPause(true)}
            onBack={onBack}
            onForward={onForward}
            paused={paused}/>
          {
            isChanging ? null : (
            <Video source={{uri: getAudio}} // Can be a URL or a local file.
              ref={audioEl}
              paused={paused}              // Pauses playback entirely.
              resizeMode="cover"           // Fill the whole screen at aspect ratio.
              repeat={true}                // Repeat forever.
              onLoadStart={() => {}}       // Callback when video starts to load
              onLoad={setDuration}         // Callback when video loads
              onProgress={setTime}         // Callback every ~250ms with currentTime
              onEnd={onNext}               // Callback when playback finishes
              onError={() => {}}           // Callback when video cannot be loaded
            />)
          }
        </View>) : null
      }
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'rgb(4,4,4)',
  },
  /*
  audioElement: {
    //height: 0,
    //width: 0,
  }
  */
};
