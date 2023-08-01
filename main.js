import './style.css'
import OBR from '@owlbear-rodeo/sdk'
import { setupContextMenu } from './contextMenu'

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Movement Tracker</h1>
  </div>
`

OBR.onReady(()=>{
  setupContextMenu();
})
