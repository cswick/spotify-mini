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
    requestOpts = Object.assign({json: true, rejectUnauthorized: false, simple: true, transform2xxOnly: true, timeout: 500}, requestOpts);
    requestOpts.headers = Object.assign({ 'Origin': 'https://open.spotify.com' }, requestOpts.headers);
    localOpts = Object.assign({ oauth: false, cfid: false, wait: false, port: null }, localOpts);
    requestOpts.url = `https://mini.spotilocal.com:${localOpts.port}${requestOpts.url}?service=remote&cors=&ref=https://open.spotify.com`;
    if (localOpts.oauth) requestOpts.url += `&oauth=${localOpts.oauth}`;
    if (localOpts.csrf) requestOpts.url += `&csrf=${localOpts.csrf}`;
    if (localOpts.wait) requestOpts.url += `&returnon=login,logout,play,pause,error,ap&returnafter=60`
    if (typeof localOpts.pause !== 'undefined') requestOpts.url += `&pause=${localOpts.pause}`;
    if (localOpts.uri) requestOpts.url += `&uri=${localOpts.uri}`;
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

  status: SpotifyStatus;
  _secrets = {};
  _ready = false;

  constructor(options?) {
    super();

    let _positionInterval = null;

    let trackPosition = () => {
      _positionInterval = setInterval(() => {
        this.status.playing_position += 0.25;
      }, 250);
    }

    let clearTrackPosition = () => {
      clearInterval(_positionInterval);
    }

    let status = (longPoll?: boolean) => {
      let getStatus = () => {
        let options = Object.assign({}, this._secrets, { wait: longPoll });
        return Internal.getLocal({ url: '/remote/status.json', timeout: 0 }, options);
      };
      return Internal.ifReady(this, getStatus);
    }

    Internal.init().then((info: any) => {
      if (info.err) {
        console.error(info.reason);
        console.error(info.err);
      } else {
        this._secrets = info;
        this._ready = true;
      }
    }).then(() => {
      return status();
    }).then((res) => {
      this.status = res;
      this.emit(ACTION_TYPES.READY, null);
      if (this.status.playing) trackPosition();
    }).then(() => {
      let pollStatus = () => {
        return status(true).then((res) => {
          Internal.compare(this, this.status, res);
          this.status = res;
          pollStatus();
        });
      };
      pollStatus();
    }).catch((err) => {
      console.error(err);
    });

    this.on(ACTION_TYPES.PAUSE, () => { clearTrackPosition(); });
    this.on(ACTION_TYPES.END, () => { clearTrackPosition(); });
    this.on(ACTION_TYPES.PLAY, () => { trackPosition(); });
    // ensure running
  }

  pause(unpause = false) {
    let pause = () => {
      let options = Object.assign({}, this._secrets, { pause: !unpause });
      return Internal.getLocal({ url: '/remote/pause.json', timeout: 0 }, options);
    };
    return Internal.ifReady(this, pause);
  }

  play(uri?: string) {
    if (!uri) return this.pause(true);
    let play = () => {
      let options = Object.assign({}, this._secrets, { uri: uri });
      return Internal.getLocal({ url: '/remote/play.json', timeout: 0 }, options);
    };
    return Internal.ifReady(this, play);
  }

  // it seems that this is broken/removed
  // seekTo(seconds: number) {
  //   let seekTo = () => {
  //     let position = Internal.formatPlayPosition(seconds);
  //     let curTrack = _.get(this._status, 'track.track_resource.uri');
  //     let options = Object.assign({}, this._secrets, { uri: `${curTrack}#${position}` });
  //     console.log(options.uri);
  //     return Internal.getLocal({ url: '/remote/play.json', timeout: 0 }, options);
  //   };
  //   return Internal.ifReady(this, seekTo);
  // }

  getPosition() {
    return Spotify.formatPlayPosition(this.status.playing_position);
  }

  static formatPlayPosition(timeInSeconds) {
    let minutes = Math.floor(timeInSeconds / 60);
    let seconds = (timeInSeconds % 60).toFixed(3);
    if (seconds.length === 1) seconds = `0${seconds}`;
    return `${minutes}:${seconds}`;
  }

}

export var SpotifyHelper = new Spotify();
export default SpotifyHelper;
