import * as async from 'async';
import * as request from 'request-promise';
import * as P from 'bluebird';
import * as EventEmitter from 'events';

const ERR_NO_PORTS = 1;
const ERR_AUTH_TOKEN = 2;
const ERR_CSRF_TOKEN = 3;

class Internal {
  static init() {
    return P.join(Internal.getAuth(), Internal.probePorts(), (auth, port) => {
      return Internal.csrf(port).then((csrf) => {
        return { port: port, oauth: auth, csrf: csrf };
        //Internal.getLocal({ url: '/remote/status.json' }, { csrf: true, oauth: true, wait: true }, (err, res, body) => { console.log(body); });
      }).catch((err) => {
        return { reason: 'csrf error', err: err };
      });
    }).catch((err) => {
      switch(err.code) {
        case ERR_NO_PORTS:
          return { reason: 'no ports', err: err };
        case ERR_AUTH_TOKEN:
          return { reason: 'bad token', err: err };
        default:
          return { reason: 'uh', err: err };
      }
    });
  }

  static getAuth() {
   return request({
     url: 'http://open.spotify.com/token',
     json: true,
     simple: true,
     transform2xxOnly: true,
     transform: (body, res, resolveWithFullResponse) => {
       return body.t;
     }
   }).catch((err) => {
     throw { code: ERR_AUTH_TOKEN, err: err };
   });
  }

  static getLocal(requestOpts, localOpts) {
    requestOpts = Object.assign({json: true, rejectUnauthorized: false, simple: true, transform2xxOnly: true, timeout: 500}, requestOpts);
    requestOpts.headers = Object.assign({ 'Origin': 'https://open.spotify.com' }, requestOpts.headers);
    localOpts = Object.assign({ oauth: false, cfid: false, wait: false, port: null }, localOpts);
    requestOpts.url = `https://mini.spotilocal.com:${localOpts.port}${requestOpts.url}?service=remote&cors=&ref=https://open.spotify.com`;
    if (localOpts.oauth) requestOpts.url += `&oauth=${localOpts.oauth}`;
    if (localOpts.csrf) requestOpts.url += `&csrf=${localOpts.csrf}`;
    if (localOpts.wait) requestOpts.url += '&returnon=login,logout,play,pause,error,ap&returnafter=60';
    return request(requestOpts);
  }

  static probePorts() {
    return new P((resolve, reject) => {
      let errCount = 0;
      let ports = [4370, 4371, 4372, 4373, 4374, 4375, 4376, 4377, 4378, 4379];
      let httpGet = function(port, cb) {
       return Internal.getLocal({ url: '/service/version.json' }, { port: port }).then((res) => {
         console.warn(`suc ${port}`);
         resolve(port);
         return;
       }).catch((err) => {
         errCount++;
         if (errCount === ports.length) {
           reject({ code: ERR_NO_PORTS, err: '' });
           //throw { code: ERR_NO_PORTS, err: '' };
         }
         return;
       })
      }
      async.map(ports, httpGet, (...agrs) => { console.warn(agrs); });
    });
  }

  static csrf(port) {
    let options = {
      url: '/simplecsrf/token.json',
      transform: (body, res, resolveWithFullResponse) => {
        return body.token;
      }
    };
    return Internal.getLocal(options, { port: port }).catch((err) => {
      if (err) throw { code: ERR_CSRF_TOKEN, err: err };
    });
  }

}

class Spotify {

  _port;
  _oauth;
  _csrf;

  constructor() {
    let x = Internal.init().then((info: any) => {
      if (info.err) {
        console.error(info.reason);
        console.error(info.err);
      } else {
        this._port = info.port;
        this._oauth = info.oauth;
        this._csrf = info.csrf;
      }
    }).catch((err) => {
      console.error(err);
    });
    // ensure running
  }

  pause() {}
  play() {}
  seekTo() {}
  status() {}

  // error
  // ready
  // end
  // play
  // pause
  // track-change

}

export var SpotifyHelper = new Spotify();
export default SpotifyHelper;
