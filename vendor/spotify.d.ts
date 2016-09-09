interface SpotifyOpenGraphState {
  private_session: boolean;
  posting_disabled: boolean;
}

interface SpotifyLocation {
  og: string;
}

interface SpotifyResource {
  name: string;
  uri: string;
  location: SpotifyLocation;
}

interface SpotifyTrack {
  length: number;
  track_type: string;
  track_resource: SpotifyResource;
  artist_resource: SpotifyResource;
  album_resource: SpotifyResource;
}

interface SpotifyStatus {
   version: number;
   client_version: string;
   playing: boolean;
   shuffle: boolean;
   repeat: boolean;
   play_enabled: boolean;
   prev_enabled: boolean;
   next_enabled: boolean;
   track: SpotifyTrack;
   context: any;
   playing_position: number;
   server_time: number;
   volume: number;
   online: boolean;
   open_graph_state: SpotifyOpenGraphState;
   running: boolean;
}
