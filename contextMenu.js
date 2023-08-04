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
                OBR.scene.items.updateItems(context.items, (items) => {
                    for (let item of items){
                        item.metadata[`${ID}/metadata`] = {
                            speed: '',
                        }
                    }
                })
                for(let item of context.items){
                    console.log('Character added')
                    roomMetadata[`${ID}/metadata`].characters.push({
                        id: item.id,
                        usedMovement: 0,
                        positionHistory: [item.position],
                    })
                }
            }else{
                const items = context.items
                OBR.scene.items.updateItems(context.items, (items) =>{
                    for (let item of items){
                        console.log(roomMetadata[`${ID}/metadata`].characters.filter((character) => character.id == item.id))
                        delete roomMetadata[`${ID}/metadata`].characters.filter((character) => character.id == item.id)
                        delete item.metadata[`${ID}/metadata`]
                    }
                })  
            }
            
            await OBR.room.setMetadata(roomMetadata);
            
        }
    })
}