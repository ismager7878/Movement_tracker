import './style.css'
import OBR from '@owlbear-rodeo/sdk'
import { setupContextMenu } from './contextMenu'
import { setupMovementTracker } from './movementTracker'


const buttons = document.querySelectorAll('button')

for(let button of buttons){
  console.log(button)
}

OBR.onReady(()=>{
  setupContextMenu();
  setupMovementTracker('33');
})


