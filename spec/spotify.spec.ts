import { Spotify } from '../src/lib/Spotify';
import ActionTypes from '../src/lib/ActionTypes';
import { expect } from 'chai';
import * as nock from 'nock';

describe('Spotify', () => {

  afterEach(() => {
    nock.cleanAll();
  });

  it('should work', () => {
    expect(1).to.equal(1);
  });

  it('should emit error when spotify token cannot be retrieved', (done) => {
    nock('http://open.spotify.com')
      .get('/token')
      .reply(500);
    let s = new Spotify();
    s.once(ActionTypes.ERROR, (err) => {
      expect(err.code).to.equal(2);
      done();
    });
  })

  it('should emit error when spotify ports arent open', (done) => {
    nock('https://mini.spotilocal.com', {
        filteringScope: (scope) => { return /^https:\/\/mini.spotilocal.com:[4370-4379]/.test(scope); }
      })
      .get('/service/version.json')
      .reply(500);
    let s = new Spotify();
    s.once(ActionTypes.ERROR, (err) => {
      expect(err.code).to.equal(1);
      done();
    });
  })
});
