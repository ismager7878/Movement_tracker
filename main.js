import './style.css'
import OBR from '@owlbear-rodeo/sdk'
import { setupContextMenu } from './contextMenu'
import { setupMovementTracker } from './movementTracker'


OBR.onReady(()=>{
  setupContextMenu();
  setupMovementTracker('33');
})
