import './style.css'
import OBR from '@owlbear-rodeo/sdk'
import { setupContextMenu } from './contextMenu'
import { setupMovementTracker, setUpStateToggle, setupRoomMetadata } from './movementTracker'

const hello = async (e) => {
  console.log('heej')
}


OBR.onReady(()=>{
  setUpStateToggle(document.querySelector('#toggle'))
  setupContextMenu();
  setupMovementTracker(document.querySelector('#trackerlist'));
})


