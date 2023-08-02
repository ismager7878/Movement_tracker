import OBR from "@owlbear-rodeo/sdk";

const ID = 'com.github.ismager7878'

export const setupMovementTracker = (element) => {
    const renderMovementTrackerList = (items) => {
        let trackedItems = []
        for(let item of items){
            if(item.metadata[`${ID}/metadata`] !== undefined){
                trackedItems.push(item)
            }
        }

        
        console.log(trackedItems)
    }
    OBR.scene.items.onChange(renderMovementTrackerList)
}