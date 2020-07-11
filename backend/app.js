/**
 * This is an example of a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 */

var request = require('request'); // "Request" library

var client_id = '570e62863f2845079d42d663030e4b52'; // Your client id
var client_secret = '7c6683f9c59d47f187e1fa0b0de88ca8'; // Your secret

// your application requests authorization
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

request.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {

    // use the access token to access the Spotify Web API
    var token = body.access_token;
    var options = {
      url: 'https://api.spotify.com/v1/playlists/2fJ9ky4JZd6p4WIkKBFTXv/tracks',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: true
    };

    request.get(options, (err, res, body) => {
      body.items.map(obj => console.log(obj.track.preview_url));
    });
  }
})
