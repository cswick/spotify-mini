import * as async from 'async';
import * as request from 'request-promise';
import * as P from 'bluebird';
var ERR_NO_PORTS = 1;
var ERR_AUTH_TOKEN = 2;
var ERR_CSRF_TOKEN = 3;
var Internal = (function () {
    function Internal() {
    }
    Internal.init = function () {
        return P.join(Internal.getAuth(), Internal.probePorts(), function (auth, port) {
            return Internal.csrf(port).then(function (csrf) {
                return { port: port, oauth: auth, csrf: csrf };
                //Internal.getLocal({ url: '/remote/status.json' }, { csrf: true, oauth: true, wait: true }, (err, res, body) => { console.log(body); });
            }).catch(function (err) {
                return { reason: 'csrf error', err: err };
            });
        }).catch(function (err) {
            switch (err.code) {
                case ERR_NO_PORTS:
                    return { reason: 'no ports', err: err };
                case ERR_AUTH_TOKEN:
                    return { reason: 'bad token', err: err };
                default:
                    return { reason: 'uh', err: err };
            }
        });
    };
    Internal.getAuth = function () {
        return request({
            url: 'http://open.spotify.com/token',
            json: true,
            simple: true,
            transform2xxOnly: true,
            transform: function (body, res, resolveWithFullResponse) {
                return body.t;
            }
        }).catch(function (err) {
            throw { code: ERR_AUTH_TOKEN, err: err };
        });
    };
    Internal.getLocal = function (requestOpts, localOpts) {
        requestOpts = Object.assign({ json: true, rejectUnauthorized: false, simple: true, transform2xxOnly: true, timeout: 500 }, requestOpts);
        requestOpts.headers = Object.assign({ 'Origin': 'https://open.spotify.com' }, requestOpts.headers);
        localOpts = Object.assign({ oauth: false, cfid: false, wait: false, port: null }, localOpts);
        requestOpts.url = "https://mini.spotilocal.com:" + localOpts.port + requestOpts.url + "?service=remote&cors=&ref=https://open.spotify.com";
        if (localOpts.oauth)
            requestOpts.url += "&oauth=" + localOpts.oauth;
        if (localOpts.csrf)
            requestOpts.url += "&csrf=" + localOpts.csrf;
        if (localOpts.wait)
            requestOpts.url += '&returnon=login,logout,play,pause,error,ap&returnafter=60';
        return request(requestOpts);
    };
    Internal.probePorts = function () {
        return new P(function (resolve, reject) {
            var errCount = 0;
            var ports = [4370, 4371, 4372, 4373, 4374, 4375, 4376, 4377, 4378, 4379];
            var httpGet = function (port, cb) {
                return Internal.getLocal({ url: '/service/version.json' }, { port: port }).then(function (res) {
                    console.warn("suc " + port);
                    resolve(port);
                    return;
                }).catch(function (err) {
                    errCount++;
                    if (errCount === ports.length) {
                        reject({ code: ERR_NO_PORTS, err: '' });
                    }
                    return;
                });
            };
            async.map(ports, httpGet, function () {
                var agrs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    agrs[_i - 0] = arguments[_i];
                }
                console.warn(agrs);
            });
        });
    };
    Internal.csrf = function (port) {
        var options = {
            url: '/simplecsrf/token.json',
            transform: function (body, res, resolveWithFullResponse) {
                return body.token;
            }
        };
        return Internal.getLocal(options, { port: port }).catch(function (err) {
            if (err)
                throw { code: ERR_CSRF_TOKEN, err: err };
        });
    };
    return Internal;
}());
var Spotify = (function () {
    function Spotify() {
        var _this = this;
        var x = Internal.init().then(function (info) {
            if (info.err) {
                console.error(info.reason);
                console.error(info.err);
            }
            else {
                _this._port = info.port;
                _this._oauth = info.oauth;
                _this._csrf = info.csrf;
            }
        }).catch(function (err) {
            console.error(err);
        });
        // ensure running
    }
    Spotify.prototype.pause = function () { };
    Spotify.prototype.play = function () { };
    Spotify.prototype.seekTo = function () { };
    Spotify.prototype.status = function () { };
    return Spotify;
}());
export var SpotifyHelper = new Spotify();
export default SpotifyHelper;
//# sourceMappingURL=spotify.js.map