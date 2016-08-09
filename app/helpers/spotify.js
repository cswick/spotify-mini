const async = require('async');
const request = require('request');

// curl "https://zfvzhkzonj.spotilocal.com:4370/service/version.json?service=remote
// &cors=&ref=https"%"3A"%"2F"%"2Fopen.spotify.com"%"2Falbum"%"2F3WjDB3j2yZL4g0hBGHF04i"
// -H "Pragma: no-cache"
// -H "Origin: https://open.spotify.com"
// -H "Accept-Encoding: gzip, deflate, sdch, br"
// -H "Accept-Language: en-US,en;q=0.8"
// -H "Accept: */*"
// -H "Cache-Control: no-cache"
// -H "Referer: https://open.spotify.com/album/3WjDB3j2yZL4g0hBGHF04i"

let _port = null;
let _oauth = null;

function getAuth() {
  request.get('http://open.spotify.com/token', function(err, res, body) {
    _oauth = body.t;
  });
}

function getLocal(options) {
  //url, callback = null, oauth = false, cfid = null, wait = -1, port = null
  Object.assign({  }, {})
  let port = options.port || _port;
  let baseUrl = `https://mini.spotilocal.com:${port}${options.url}`;
  let opts = {
    url :  url,
    json : true,
    rejectUnauthorized: false
  };
  request(opts, options.callback);
}

function probePorts() {
  let ports = [4370, 4371, 4372, 4373, 4374, 4375, 4376, 4377, 4378, 4379];

  let httpGet = function(port, callback) {
    getLocal({
      url: '/service/version.json?service=remote&cors=&ref=https://open.spotify.com',
      port: port,
      callback: (err, res, body) => {
        console.log(`got it, port ${port}`);
      })
    });
  }

  async.map(ports, httpGet, (err, res, body) => {
    console.log('done polling ports');
  });
}

function csrf() {
  simplecsrf/token.json
}

getAuth();
probePorts();
