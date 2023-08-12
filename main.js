import './style.css'
import OBR from '@owlbear-rodeo/sdk'
import { setupContextMenu } from './contextMenu'
import { setupMovementTracker, setUpStateToggle, setupGmReset } from './movementTracker'
import { setupGmContextMenu } from './gmContextMenu'

const hello = async (e) => {
  console.log('heej')
}


OBR.onReady(()=>{
  setUpStateToggle(document.querySelector('#toggle'))
  setupContextMenu();
  setupGmContextMenu();
  setupGmReset(document.querySelector('#gmReset'))
  setupMovementTracker(document.querySelector('#trackerlist'));
})


