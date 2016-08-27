import * as async from 'async';
import * as request from 'request-promise';
import * as P from 'bluebird';
import { EventEmitter2 } from 'eventemitter2';
// todo: modular lodash
import * as _ from 'lodash';

const ERR_NO_PORTS = 1;
const ERR_AUTH_TOKEN = 2;
const ERR_CSRF_TOKEN = 3;
const ACTION_TYPES = {
  READY: 'READY',
  TRACK_CHANGE: 'TRACK_CHANGE',
  PLAY: 'PLAY',
  END: 'END',
  PAUSE: 'PAUSE',
  ERROR: 'ERROR'
}

class Internal {
  // todo: add retry logic
  static init() {
    return P.join(Internal.getAuth(), Internal.probePorts(), (auth, port) => {
      return Internal.csrf(port).then((csrf) => {
        return { port: port, oauth: auth, csrf: csrf };
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
    if (!localOpts.port) console.trace();
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
         resolve(port);
         return;
       }).catch((err) => {
         errCount++;
         if (errCount === ports.length) {
           reject({ code: ERR_NO_PORTS, err: '' });
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

  static ifReady(context, callback) {
    if (!context._ready) {
      return new P((resolve, reject) => {
        context.on(ACTION_TYPES.READY, () => {
          resolve(callback());
        });
      });
    }
    return callback();
  }

  static compare(context: EventEmitter2, prevStatus: SpotifyStatus, curStatus: SpotifyStatus) {
    let path = 'track.track_resource.uri'
    if (_.get(prevStatus, path) !== _.get(curStatus, path)) context.emit(ACTION_TYPES.TRACK_CHANGE, curStatus);
    if (prevStatus.playing !== curStatus.playing) {
      if (curStatus.playing) {
        context.emit(ACTION_TYPES.PLAY, curStatus);
        // update current time loop
      } else {
        if (Math.abs(curStatus.playing_position - curStatus.track.length) <= 1) {
          context.emit(ACTION_TYPES.END, curStatus);
        }
        context.emit(ACTION_TYPES.PAUSE, curStatus);
        // stop current time loop
      }
    }
  }

}

class Spotify extends EventEmitter2 {

  _status: SpotifyStatus;
  _secrets: any = {};
  _ready: boolean;

  constructor(options?) {
    super();
    Internal.init().then((info: any) => {
      if (info.err) {
        console.error(info.reason);
        console.error(info.err);
      } else {
        this._secrets = info;
        this._ready = true;
      }
    }).then(() => {
      return this.status();
    }).then((res) => {
      console.log('set status');
      this._status = res;
      this.emit(ACTION_TYPES.READY, null);
    }).then(() => {
      console.log('poll status');
      let pollStatus = () => {
        return this.status(true).then((res) => {
          Internal.compare(this, this._status, res);
          this._status = res;
          pollStatus();
        });
      };
      pollStatus();
    }).catch((err) => {
      console.error(err);
    });
    // ensure running
  }

  pause() {}
  play() {}
  seekTo() {}
  status(longPoll?) {
    let getStatus = () => {
      let options = Object.assign({}, this._secrets, { wait: longPoll });
      return Internal.getLocal({ url: '/remote/status.json', timeout: 0 }, options).then((res) => {
        return res;
      });
    };
    return Internal.ifReady(this, getStatus);
  }



}

export var SpotifyHelper = new Spotify();
export default SpotifyHelper;
