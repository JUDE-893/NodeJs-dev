import onPublishTrackListener from './onPublishTrackListener.js'
import getAccessToken from './getAccessToken.js'

export default function serverClient(roomName) {

  // call the the genrate JWT function
  getAccessToken(roomName,'Balena')
    .then( (resp) => {
      onPublishTrackListener(resp);
    })
    .catch((er) => {
      console.log('server err',er);
    });
}
