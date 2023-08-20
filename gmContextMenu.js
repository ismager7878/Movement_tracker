import OBR from "@owlbear-rodeo/sdk";

const ID = "com.abarbre.movement_tracker";

export const setupGmContextMenu = () => {
  OBR.contextMenu.create({
    id: `${ID}/context-menu-gm`,
    icons: [
      {
        icon: "/assets/contextMenuGM_add_icon.svg",
        label: "Track Movement(Private to GM)",
        filter: {
          roles: ["GM"],
          every: [
            { key: "layer", value: "CHARACTER" },
            { key: ["metadata", `${ID}/metadata`], value: undefined },
          ],
        },
      },
      {
        icon: "/assets/contextMenu_remove_icon.svg",
        label: "Stop Movement Tracking",
        filter: {
          roles: ["GM"],
          every: [
            { key: "layer", value: "CHARACTER" },
            { key: ["metadata", `${ID}/metadata`, "isGmOnly"], value: true },
          ],
        },
      },
    ],
    onClick(context) {
      const addMovementTracker = context.items.every(
        (x) => x.metadata[`${ID}/metadata`] === undefined,
      );
      if (addMovementTracker) {
        OBR.scene.items.updateItems(context.items, (items) => {
          for (let item of items) {
            item.metadata[`${ID}/metadata`] = {
              usedMovement: 0,
              positionHistory: [item.position],
              speed: 30,
              isUndo: false,
              usingSpell: false,
              isGmOnly: true,
            };
          }
        });
      } else {
        OBR.scene.items.updateItems(context.items, (items) => {
          for (let item of items) {
            delete item.metadata[`${ID}/metadata`];
          }
        });
      }
    },
    shortcut: "G",
  });
};
