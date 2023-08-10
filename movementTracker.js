import OBR from "@owlbear-rodeo/sdk";

const ID = 'com.abarbre.movement_tracker'

let test = ()=>{}

const getRoomMetadata = async () => {
    const metadata = await OBR.room.getMetadata()
    return metadata[`${ID}/metadata`]
}

const getItemIndex = (roomData, itemData) => {
    return roomData.characters.findIndex((x)=> x.id == itemData.id)
}

const calculateFeet = async (oldPosition, newPosition) => {
    const newSnapPos = await OBR.scene.grid.snapPosition(newPosition, true, false)
    const oldSnapPos = await OBR.scene.grid.snapPosition(oldPosition, true, false)
    const yDiff = Math.abs(newSnapPos.y - oldSnapPos.y)
    const xDiff = Math.abs(newSnapPos.x - oldSnapPos.x)

    const direction = yDiff >= xDiff ? yDiff : xDiff

    const dpi = await OBR.scene.grid.getDpi()
    const scale = await OBR.scene.grid.getScale()

    return (direction/dpi)*scale.parsed.multiplier

}




export async function setupMovementTracker(element) {

    let fistRender = true

    const addInitialItemsToRoom = async (items) => {
        if(items.length == 0){
            return
        }
        fistRender = false
        if ((await OBR.player.getRole()) == "PLAYER"){
            return
        }
        const metadata = {
            "com.abarbre.movement_tracker/metadata":{
                state: false,
                characters: []
            }
        }
        console.log('Inital room setup')
        for(let item of items){
            if(item.metadata[`${ID}/metadata`] !== undefined){
                metadata[`${ID}/metadata`].characters.push(
                    {
                        id: item.id,
                        usedMovement: 0,
                        usedMovementBuffer: 0,
                        positionHistory: [item.position],
                        positionHistoryBuffer: [],
                        isUndo: false
                    }
                )
            }
        }
        console.log(metadata)
        await OBR.room.setMetadata(metadata)
        
    }

    const recordPosition = async (items) =>  {
        const metadata = await OBR.room.getMetadata()
        const roomMetadata = metadata[`${ID}/metadata`]
        if(!roomMetadata.state){
            return
        }
        for(let item of items){
            if(item.metadata[`${ID}/metadata`] !== undefined && item.layer == "CHARACTER"){
                const itemRoomIndex = getItemIndex(roomMetadata, item)
                const itemRoomData = roomMetadata.characters[itemRoomIndex]
                let undoPosition = ''
                console.log(`${item.name} has used ${itemRoomData.usedMovement}`)
                let lastPosition = itemRoomData.positionHistory[itemRoomData.positionHistory.length - 1]
                if(item.position.x != lastPosition.x || item.position.y != lastPosition.y){
                    const distance = await calculateFeet(lastPosition, item.position)
    
                    console.log(`${item.name}'s postion updated`)
                    
                    if(itemRoomData.usedMovement + distance > item.metadata[`${ID}/metadata`].speed){
                        OBR.notification.show(`You don't have enough movement for that, you have ${item.metadata[`${ID}/metadata`].speed - itemRoomData.usedMovement}ft. left`, "WARNING") 
                        console.log("Postion history on to long or undo")
                        console.log(itemRoomData.positionHistory)
                        await OBR.scene.items.updateItems((x)=>x.id == item.id, (items)=>{
                            for(let i of items){
                                i.position = lastPosition
                            }
                        })
                        return                     
                    }
                    itemRoomData.positionHistory.push(item.position)
                    itemRoomData.usedMovement += await calculateFeet(lastPosition, item.position)
                    metadata[`${ID}/metadata`].characters[itemRoomIndex] = itemRoomData
                    await OBR.room.setMetadata(metadata)
                    
                }
            }  
        }
    }

    test = async (items) => {
        let trackedItems = []
        let domElement = ''
        const roomMetadata = await getRoomMetadata()
        for(let item of items){
            if(item.metadata[`${ID}/metadata`] !== undefined){
                const itemRoomData = roomMetadata.characters.filter((x)=> x.id == item.id)[0]
                trackedItems.push({
                    id: item.id,
                    name: item.text.plainText == '' ? item.name : item.text.plainText,
                    speed: item.metadata[`${ID}/metadata`].speed,
                    usedMovement: itemRoomData.usedMovement,
                })
            }
        }
        let i = 0
        element.innerHTML = ''
        for(let trackedItem of trackedItems){
            
            element.innerHTML += `<div id='player'> 
                                <p>${trackedItem.name}</p>
                                <button class="tooltip" id="undo${i}">
                                    <span class="tooltiptext">
                                        <nobr>Undo Movements</nobr>
                                    </span>
                                    <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 9V15M4 15H10M4 15C6.32744 12.9114 8.48287 10.5468 11.7453 10.0878C13.6777 9.81593 15.6461 10.1794 17.3539 11.1234C19.0617 12.0675 20.4164 13.5409 21.2139 15.3218" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                                <button class="tooltip reset" id="reset${i}">
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
            const updateSpeed = async (e) => {
                await OBR.scene.items.updateItems((item) => item.id === trackedItem.id, (items)=>{
                    for(let item of items){
                        if(item.metadata[`${ID}/metadata`] !== undefined){
                            item.metadata[`${ID}/metadata`].speed = e.target.value
                        }
                    }   
                })
            }
            const resetMovement = async () => {
                const metadata = await OBR.room.getMetadata()
                const roomData = metadata[`${ID}/metadata`]
                const items = await OBR.scene.items.getItems((item) => item.id === trackedItem.id)
                for(let item of items){
                    if(item.metadata[`${ID}/metadata`] !== undefined){
                        const itemIndex = getItemIndex(roomData, item)
                        roomData.characters[itemIndex].usedMovement = 0
                        roomData.characters[itemIndex].positionHistory = [item.position]
                    }
                }
                metadata[`${ID}/metadata`] = roomData
                await OBR.room.setMetadata(metadata)
            }
    
            const undoMovement = async () => {
                
                const metadata = await OBR.room.getMetadata()
                const roomData = metadata[`${ID}/metadata`]
                const items = await OBR.scene.items.getItems((item) => item.id === trackedItem.id) 
                for(let item of items){
                    if(item.metadata[`${ID}/metadata`] !== undefined){
                        const itemIndex = getItemIndex(roomMetadata, item)
                        const roomCharacterData = roomData.characters[itemIndex]         
                        if(roomCharacterData.positionHistory.length <= 1){
                            return
                        } 
                        const undoPosition =  roomCharacterData.positionHistory.pop()
                        const newPosition = roomCharacterData.positionHistory[roomCharacterData.positionHistory.length - 1]
                        roomCharacterData.usedMovementBuffer = roomCharacterData.usedMovement - await calculateFeet(undoPosition, newPosition)
                        roomCharacterData.isUndo = true
                        roomCharacterData.positionHistoryBuffer = roomCharacterData.positionHistory
                        metadata[`${ID}/metadata`].characters[itemIndex] = roomCharacterData
                        await OBR.room.setMetadata(metadata).then(()=>{
                            OBR.scene.items.updateItems((x) => x.id == item.id, (items)=>{
                                for(let x of items){
                                    x.position = newPosition
                                }
                            })
                        })    
                    }
                }
                
            }
            element.querySelector(`#reset${n}`).addEventListener("click", resetMovement)
            element.querySelector(`#undo${n}`).addEventListener("click", undoMovement)
            element.querySelector(`#input${n}`).addEventListener("change", updateSpeed)
        }
        
    }

    OBR.scene.items.onChange(async (items) => {
        const metadata = await OBR.room.getMetadata()
        console.log(metadata[`${ID}/metadata`].characters.every((x) => x.isUndo == false))

        if(fistRender)
        {
            console.log('init load')
            addInitialItemsToRoom(items)
        }
        if(metadata[`${ID}/metadata`].characters.every((x) => x.isUndo == false)){
            await recordPosition(items);
        }else{
            metadata[`${ID}/metadata`].characters.filter(x => x.isUndo == true)[0].isUndo == false
        }
        
        test(items)
        
    })
}


export const setUpStateToggle = async (element) => {
    let meta = await OBR.room.getMetadata()
    console.log(meta)
    if(meta[`${ID}/metadata`] === undefined){
        meta = {
            "com.abarbre.movement_tracker/metadata":{
                state: false,
                characters: []           
            }
        }
    }
    await OBR.room .setMetadata(meta)
    console.log(meta[`${ID}/metadata`].characters)

    const toggleState = async (callback) => {
        const metadata = await OBR.room.getMetadata()

        const playerRole = await OBR.player.getRole()
        if(playerRole == "GM"){
            if(metadata[`${ID}/metadata`].state == false && element.checked == true){
                const items = await OBR.scene.items.getItems((item) => item.metadata[`${ID}/metadata`] !== undefined)
                for(let item of items){
                    const itemIndex = getItemIndex(metadata[`${ID}/metadata`], item)
                    metadata[`${ID}/metadata`].characters[itemIndex].positionHistory = [item.position]
                }
            }
            metadata[`${ID}/metadata`].state = callback.target.checked
        }
        else{
            OBR.notification.show("You shall not touch, the GM's button", "WARNING")
            element.checked = metadata[`${ID}/metadata`].state
        }

        await OBR.room.setMetadata(metadata)
    }

    const updateStateToggle = async (data) =>{
        console.log(data)
        const metadata = data[`${ID}/metadata`]
        element.checked = metadata.state
        console.log('metadata update')
        if(!metadata.characters.every(x=>x.isUndo == false)){
            const undoCharacter = metadata.characters.filter(x => x.isUndo == true)[0]
            console.log(undoCharacter)
            const undoCharacterIndex = getItemIndex(metadata, undoCharacter)
            undoCharacter.isUndo = false
            undoCharacter.positionHistory = undoCharacter.positionHistoryBuffer
            undoCharacter.usedMovement = undoCharacter.usedMovementBuffer
            console.log(data[''])
            const fullMetadata = data
            fullMetadata[`${ID}/metadata`].characters[undoCharacterIndex] = undoCharacter
            console.log(fullMetadata)
            await OBR.room.setMetadata(fullMetadata)
            test(await OBR.scene.items.getItems(item => item.metadata[`${ID}/metadata`] !== undefined))
        }
        console.log(await OBR.room.getMetadata())
    }

    OBR.room.onMetadataChange(updateStateToggle)
    element.addEventListener("input", toggleState)
  }
  