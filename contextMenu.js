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
        onClick(context) {
            const addMovementTracker = context.items.every(x => x.metadata[`${ID}/metadata`] === undefined)
            if(addMovementTracker){
                OBR.scene.items.updateItems(context.items, (items) => {
                    for (let item of items){
                        item.metadata[`${ID}/metadata`] = {
                            speed: '',
                            usedMovement: 0,
                            postionHistory: [],
                            
                        }
                    }
                })
            }else{
                const items = context.items
                OBR.scene.items.updateItems(context.items, (items) =>{
                    for (let item of items){
                        delete item.metadata[`${ID}/metadata`]
                    }
                })  
            }

            
        }
    })
}