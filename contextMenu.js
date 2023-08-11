import OBR from "@owlbear-rodeo/sdk";


const ID = 'com.abarbre.movement_tracker'

export function setupContextMenu() {
    OBR.contextMenu.create({
        id: `${ID}/context-menu`,
        icons: [
            {
                icon: '/assets/contextMenu_add_icon.svg',
                label: 'Track Movement',
                filter: {
                    every: [
                        {key:'layer', value:'CHARACTER'},
                        {key: ["metadata", `${ID}/metadata`], value: undefined}
                    ]
                },
            },    
            {
                icon: '/assets/contextMenu_remove_icon.svg',
                label: 'Stop Movement Tracking',
                filter: {
                    every: [
                        {key:'layer', value:'CHARACTER'}
                    ]
                }
            },      
        ],
        async onClick(context) {
            const roomMetadata = await OBR.room.getMetadata()
            const addMovementTracker = context.items.every(x => x.metadata[`${ID}/metadata`] === undefined)
            if(addMovementTracker){
                for(let item of context.items){
                    
                    roomMetadata[`${ID}/metadata`].characters.push({
                        id: item.id,
                        usedMovement: 0,
                        usedMovementBuffer: 0,
                        positionHistory: [item.position],
                        positionHistoryBuffer: [],
                        isUndo: false,
                        reset: false
                    })
                    
                }
                await OBR.room.setMetadata(roomMetadata);
                OBR.scene.items.updateItems(context.items, (items) => {
                    for (let item of items){
                        item.metadata[`${ID}/metadata`] = {
                            speed: 30,
                        }
                    }
                })
                
            }else{
                const items = context.items
                OBR.scene.items.updateItems(context.items, (items) =>{
                    for (let item of items){
                        const characterIndex = roomMetadata[`${ID}/metadata`].characters.findIndex((character) => character.id == item.id)
                        roomMetadata[`${ID}/metadata`].characters.splice(characterIndex, 1)
                        delete item.metadata[`${ID}/metadata`]
                        OBR.room.setMetadata(roomMetadata);
                    }
                })  
            }
            console.log('Character added')
        }
    })
}
