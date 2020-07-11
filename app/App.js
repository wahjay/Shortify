import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Animated } from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel'

import { Buffer } from 'buffer';
import Player from './Player';
import Search from './Search';

const client_id = '{client_id}'; // Your spotify client id
const client_secret = '{secret}'; // Your spotify secret

/* encode request body objects */
const searchParams = (params) => Object.keys(params).map((key) => {
  return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
}).join('&');

const {height} = Dimensions.get('window');

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      av: new Animated.Value(height),
      token: '',
      left: 18,    //top left corner radius for the panel
      right: 18,   //top right corner radius for the panel
    }

    this.onEnd= this.onEnd.bind(this);
    this.onShow = this.onShow.bind(this);
  }

  componentDidMount() {
    let form = searchParams({grant_type: 'client_credentials'})

    // get authorization first
    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: form,
    })
    .then(res => res.json())
    .then(data => {
      this.setState({
        token: data.access_token
      });
    });

    // since the access token expires in 3600s or 1 hour, we re-retrieve the access token every 1 hour
    setInterval(() => {
      fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: form,
      })
      .then(res => res.json())
      .then(data => {
        this.setState({
          token: data.access_token
        });
      });
    }, 3600 * 1000);
  }

  // go to the top or bottom depending on the current position of the panel
  onEnd() {
    if(this.state.av.__getValue() > Math.floor(3*height/4)) {
      this._panel.show({toValue: height});
      // corner radius goes back to normal
      this.setState({
        left: 18,
        right: 18,
      });
    }
    else {
      this._panel.hide();
    }
  }

  onShow() {
    this._panel.show();
    this.setState({
      left:18,
      right:18,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Search token={this.state.token}/>
        <SlidingUpPanel
          ref={c => (this._panel = c)}
          draggableRange={{top: height, bottom: 72}}
          animatedValue={this.state.av}
          friction={0.3}
          allowMomentum={false}
          onDragEnd={this.onEnd}
          onBottomReached={() => this.setState({left:0, right:0})}
          showBackdrop={false}>
          <Player
            onHide={() => this._panel.hide()}
            onShow={this.onShow }
            left={this.state.left}
            right={this.state.right}
            token={this.state.token}
          />
        </SlidingUpPanel>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'rgb(4,4,4)',
    alignItems: 'center',
    justifyContent: 'center'
  }
}
