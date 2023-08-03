import OBR from "@owlbear-rodeo/sdk";

const ID = 'com.abarbre.movement_tracker'

export async function setupMovementTracker(element) {

    const snapCharacterToGrid = async (items) => {
        for(let x of items){
            if(x.layer == 'CHARACTER'){
                const position = x.position
                const snapPosition = await OBR.scene.grid.snapPosition(position, true, false)
                if(position != snapPosition){
                    OBR.scene.items.updateItems((item)=> item.id == x.id, (items) => {
                        for(let item of items){
                            item.position = snapPosition
                        }
                    })
                }
            }
        }
    }

    const renderMovementTrackerList = async (items) => {
        let trackedItems = []
        let domElement = ''
        for(let item of items){
            if(item.metadata[`${ID}/metadata`] !== undefined){
                trackedItems.push({
                    id: item.id,
                    name: item.text.plainText == '' ? item.name : item.text.plainText,
                    speed: item.metadata[`${ID}/metadata`].speed,
                    usedMovement: item.metadata[`${ID}/metadata`].usedMovement,
                })
            }
        }
        let i = 0
        element.innerHTML = ''
        for(let trackedItem of trackedItems){
            
            element.innerHTML += `<div id='player'> 
                                <p>${trackedItem.name}</p>
                                <button class="tooltip">
                                    <span class="tooltiptext">
                                        <nobr>Undo Movements</nobr>
                                    </span>
                                    <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 9V15M4 15H10M4 15C6.32744 12.9114 8.48287 10.5468 11.7453 10.0878C13.6777 9.81593 15.6461 10.1794 17.3539 11.1234C19.0617 12.0675 20.4164 13.5409 21.2139 15.3218" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                                <button class="tooltip reset">
                                    <span class="tooltiptext">
                                        <nobr>Reset Movement</nobr>
                                    </span>
                                    <svg width="35px" height="35px" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">

                                        <g fill="none" fill-rule="evenodd" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" transform="translate(2 2)">
                                        
                                        <path d="m4.5 1.5c-2.4138473 1.37729434-4 4.02194088-4 7 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8"/>
                                        
                                        <path d="m4.5 5.5v-4h-4"/>
                                        
                                        </g>
                                        
                                    </svg>
                                </button>
                                <div class="movement tooltip">
                                    <p>${trackedItem.usedMovement} /</p>
                                    <div class="tooltip">
                                        <span class="tooltiptext">
                                        <nobr>Speed</nobr>
                                        </span>
                                        <input type="number" id="input${i}" class='movementInput' value='${trackedItem.speed}'>
                                    </div>
                                    ft.
                                </div>
                        </div>
                        <hr class="divider">
            `
            i++
        }

        for(let n = 0; n < trackedItems.length; n++){
            const trackedItem = trackedItems[n]
            const hello = async (e) => {
                await OBR.scene.items.updateItems((item) => item.id === trackedItem.id, (items)=>{
                    for(let item of items){
                        if(item.metadata[`${ID}/metadata`] !== undefined){
                            item.metadata[`${ID}/metadata`].speed = e.target.value
                        }
                    }   
                })
                console.log(e.target.value)
            }

        element.querySelector(`#input${n}`).addEventListener("change", hello)
        }
        
    }
    
    
    OBR.scene.items.onChange( async (items) => {
        renderMovementTrackerList(items)
    })
    renderMovementTrackerList(await OBR.scene.items.getItems())
}


export const setUpStateToggle = async (element) => {

    await OBR.room.setMetadata(
        {
            "com.abarbre.movement_tracker/metadata": {
                state: false,
            },
        }
    )

    const toggleState = async (callback) => {

        const playerRole = await OBR.player.getRole()
        if(playerRole == "GM"){
            await OBR.room.setMetadata(
                {
                    "com.abarbre.movement_tracker/metadata": {
                        state: callback.target.checked,
                    },
                })
        }
        else{
            console.log('gello')
            const metadata = await OBR.room.getMetadata()
            OBR.notification.show("You shall not touch, the GM's button", "WARNING")
            element.checked = metadata[`${ID}/metadata`].state
        }
    }

    const updateStateToggle = (data) =>{
        const metadata = data[`${ID}/metadata`]
        element.checked = metadata.state
        console.log(`The state is: ${metadata.state}`)
    }

    OBR.room.onMetadataChange(updateStateToggle)
    element.addEventListener("input", toggleState)
  }
  