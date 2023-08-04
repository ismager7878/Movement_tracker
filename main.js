import './style.css'
import OBR from '@owlbear-rodeo/sdk'
import { setupContextMenu } from './contextMenu'
import { setupMovementTracker, setUpStateToggle } from './movementTracker'

const hello = async (e) => {
  console.log('heej')
}


OBR.onReady(async ()=>{
  setUpStateToggle(document.querySelector('#toggle'))
  await setupContextMenu();
  setupMovementTracker(document.querySelector('#trackerlist'));
})


