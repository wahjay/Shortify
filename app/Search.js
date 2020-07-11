/*
Search Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
*/

import React, { Component, useState, useEffect } from 'react';

import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Image
} from 'react-native';

import { TextInput } from 'react-native';
import { Buffer } from 'buffer';
import SearchDetails from './SearchDetails';

const {width} = Dimensions.get('window');


export default function Search(props) {
  const [text, setText] = useState('');
  const [searches, setSearches] = useState([]);
  const [token, setToken] = useState('');

  useEffect(() => {
    setToken(props.token);
  }, [props.token]);

  const onChange = (text) => {
    setText(text);
    if(text.length <= 0) {
      setSearches([]);
      return;
    }

    let searchUrl = 'https://api.spotify.com/v1/search?q=';
    searchUrl += encodeURI(text) + '&type=track';
    fetch(searchUrl, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
      let result = [];
      //array of objects: [thumbnail of the track, song name, [artists name], song prview url]
      data.tracks.items.map(obj => result.push({title: [obj.album.images[2].url, obj.name, obj.artists, obj.preview_url]}));
      setSearches(result);
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <View style={styles.searchbar}>
        <Image style={styles.searchicon} source={require('../img/search.png')} />
        <TextInput
          style={styles.search}
          placeholder="Artists or songs"
          placeholderTextColor="black"
          onChangeText={text => onChange(text)}
          value={text}
          selectionColor={'green'}
          autoCorrect={true}
        />
        {text.length > 0 ?
          <TouchableWithoutFeedback onPress={() => {setText(''); setSearches([]);}}>
            <Image style={styles.clear} source={require('../img/close.png')}/>
          </TouchableWithoutFeedback> :
          <Text style={styles.clear}></Text>
        }
      </View>
      <SearchDetails result={searches} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  searchbar: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  searchicon: {
    top: 7,
    left: 5
  },
  search: {
    height: 40,
    padding: 10,
    width: width - 80,
  },
  clear: {
    top: 5,
    right: 5,
    width: 30,
    height: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    padding: 5
  }
});
