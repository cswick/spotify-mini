const async = require('async');
const request = require('request-promise');
const P = require('bluebird');

let _port = null;
let _oauth = null;
let _csrf = null;

request.debug = true;

function getAuth() {
 return request.get({ url: 'http://open.spotify.com/token', json: true }, function(err, res, body) {
   _oauth = body.t;
 }).promise();
}

function getLocal(requestOpts, localOpts, callback) {
  callback = callback || function () {};
  requestOpts = Object.assign({json: true, rejectUnauthorized: false}, requestOpts);
  requestOpts.headers = Object.assign({ 'Origin': 'https://open.spotify.com' }, requestOpts.headers);
  localOpts = Object.assign({ oauth: false, cfid: false, wait: false, port: null }, localOpts);
  localOpts.port = localOpts.port || _port;
  requestOpts.url = `https://mini.spotilocal.com:${localOpts.port}${requestOpts.url}?service=remote&cors=&ref=https://open.spotify.com`;
  if (localOpts.oauth) requestOpts.url += `&oauth=${_oauth}`;
  if (localOpts.csrf) requestOpts.url += `&csrf=${_csrf}`;
  if (localOpts.wait) requestOpts.url += '&returnon=login,logout,play,pause,error,ap&returnafter=60';
  return request(requestOpts, callback).promise();
}

function probePorts() {
  return new P((resolve, reject) => {
    let ports = [4370, 4371, 4372, 4373, 4374, 4375, 4376, 4377, 4378, 4379];
    let httpGet = function(port, cb) {
     return getLocal({ url: '/service/version.json' }, { port: port }, (err, res, body) => {
       if (!err && res.statusCode >= 200 && res.statusCode < 300) {
         _port = port;
         resolve();
       }
     }).catch(() => {});
    }
    async.map(ports, httpGet);
  });
}

function csrf() {
  return getLocal({ url: '/simplecsrf/token.json' }, null, (err, res, body) => {
    _csrf = body.token;
  });
}

P.join(getAuth(), probePorts(), () => {
  csrf().then(() => {
    console.log(`${_port}::${_oauth}::${_csrf}`);
    getLocal({ url: '/remote/status.json' }, { csrf: true, oauth: true, wait: true }, (err, res, body) => { console.log(body); });
  });
});
