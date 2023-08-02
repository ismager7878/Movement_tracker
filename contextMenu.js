import OBR from "@owlbear-rodeo/sdk";

const ID = 'com.github.ismager7878'

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
            console.log(context)
            const addMovementTracker = context.items.every(x => x.metadata[`${ID}/metadata`] === undefined)
            if(addMovementTracker){
                const speed = window.prompt("Enter movement speed");
                OBR.scene.items.updateItems(context.items, (items) => {
                    for (let item of items){
                        item.metadata[`${ID}/metadata`] = {
                            speed: speed,
                            movement: 0,
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