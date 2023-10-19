import OBR from "@owlbear-rodeo/sdk";
import config from "./config.json";

const ID = config.ID;

let renderMovementTrackerList = () => {};

const getRoomMetadata = async () => {
  const metadata = await OBR.room.getMetadata();
  return metadata[`${ID}/metadata`];
};

const getItemIndex = (roomData, itemData) => {
  return roomData.characters.findIndex((x) => x.id == itemData.id);
};

const calculateFeet = async (oldPosition, newPosition) => {
  const distance = await OBR.scene.grid.getDistance(oldPosition, newPosition);
  const scale = await OBR.scene.grid.getScale();
  const multiplier = scale.parsed.multiplier;
  const digits = scale.parsed.digits;
  return Number((distance * multiplier).toFixed(digits));
};

export async function setupMovementTracker(element) {
  const recordPosition = async (items) => {
    const metadata = await OBR.room.getMetadata();
    const scale = await OBR.scene.grid.getScale();
    const roomMetadata = metadata[`${ID}/metadata`];
    if (!roomMetadata.state) {
      return;
    }
    for (let item of items) {
      const itemData = item.metadata[`${ID}/metadata`];
      if (itemData !== undefined && item.layer == "CHARACTER") {
        let lastPosition =
          itemData.positionHistory[itemData.positionHistory.length - 1];
        if (
          item.position.x != lastPosition.x ||
          item.position.y != lastPosition.y
        ) {
          const distance = await calculateFeet(lastPosition, item.position);
          if (
            itemData.usedMovement + distance > itemData.speed &&
            itemData.isUndo == false &&
            itemData.usingSpell == false
          ) {
            OBR.notification.show(
              `${
                item.text.plainText == "" ? item.name : item.text.plainText
              } don't have enough movement for that, you have ${(
                itemData.speed - itemData.usedMovement
              ).toFixed(scale.parsed.digits)}${scale.parsed.unit}. left`,
              "WARNING"
            );
            await OBR.scene.items.updateItems(
              (x) => x.id == item.id || x.attachedTo == item.id,
              (items) => {
                for (let i of items) {
                  i.position = lastPosition;
                }
              }
            );
            return;
          }
          if ((await OBR.player.getRole()) == "PLAYER") {
            return;
          }
          OBR.scene.items.updateItems(
            (x) => x.id == item.id,
            (items) => {
              for (let i of items) {
                i.metadata[`${ID}/metadata`].positionHistory.push(i.position);
                i.metadata[`${ID}/metadata`].usedMovement += distance;
              }
            }
          );
        }
      }
    }
  };

  renderMovementTrackerList = async (items) => {
    let trackedItems = [];
    let domElement = "";
    const scale = await OBR.scene.grid.getScale();
    const unit = scale.parsed.unit;
    for (let item of items) {
      if (item.metadata[`${ID}/metadata`] !== undefined) {
        if (item.metadata[`${ID}/metadata`].isGmOnly) {
          if ((await OBR.player.getRole()) == "GM") {
            trackedItems.push({
              id: item.id,
              name: item.text.plainText == "" ? item.name : item.text.plainText,
              speed: item.metadata[`${ID}/metadata`].speed,
              usedMovement: item.metadata[`${ID}/metadata`].usedMovement,
              spellIconColor:
                item.metadata[`${ID}/metadata`].usingSpell == true
                  ? "#bb99ff"
                  : "#FFFFFF",
              color: "#bb99ffda",
            });
          }
        } else {
          trackedItems.push({
            id: item.id,
            name: item.text.plainText == "" ? item.name : item.text.plainText,
            speed: item.metadata[`${ID}/metadata`].speed,
            usedMovement: item.metadata[`${ID}/metadata`].usedMovement,
            spellIconColor:
              item.metadata[`${ID}/metadata`].usingSpell == true
                ? "#bb99ff"
                : "#FFFFFF",
            color: "#FFFFFF",
          });
        }
      }
    }
    trackedItems.sort((a, b) => {
      if (a.color == "#bb99ffda" && b.color == "#FFFFFF") {
        return -1;
      } else if (a.color == "#FFFFFF" && b.color == "#bb99ffda") {
        return 1;
      }

      return 0;
    });
    let i = 0;
    element.innerHTML = "";
    for (let trackedItem of trackedItems) {
      element.innerHTML += `<div id='player'> 
                              <div class='name'>    
                                <p style="color:${trackedItem.color}">${
        trackedItem.name
      }</p>
                              </div>
                              <button class="tooltip undo" id="undo${i}">
                                <span class="tooltiptext">
                                  <nobr>Undo Movements</nobr>
                                </span>
                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 9V15M4 15H10M4 15C6.32744 12.9114 8.48287 10.5468 11.7453 10.0878C13.6777 9.81593 15.6461 10.1794 17.3539 11.1234C19.0617 12.0675 20.4164 13.5409 21.2139 15.3218" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                </button>
                                <button class="tooltip reset" id="reset${i}">
                                    <span class="tooltiptext">
                                        <nobr>Reset Movement</nobr>
                                    </span>
                                    <svg width="18px" height="18px" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    
                                        <g fill="none" fill-rule="evenodd" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" transform="translate(2 2)">
                                        
                                        <path d="m4.5 1.5c-2.4138473 1.37729434-4 4.02194088-4 7 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8"/>
                                        
                                        <path d="m4.5 5.5v-4h-4"/>
                                        
                                        </g>
                                        
                                    </svg>
                                </button>
                                <button class="tooltip spell" id="spell${i}">
                                <span class="tooltiptext">
                                <nobr>Using spell</nobr>
                                </span>
                                <svg fill=${
                                  trackedItem.spellIconColor
                                } height="13px" width="13px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 512 512" xml:space="preserve">
<g>
	<g>
    <g>
			<path d="M64,64v21.333c-11.776,0-21.333,9.557-21.333,21.333S52.224,128,64,128v106.667c-11.776,0-21.333,9.557-21.333,21.333
				c0,11.776,9.557,21.333,21.333,21.333V384c-11.776,0-21.333,9.557-21.333,21.333S52.224,426.667,64,426.667V448
				c0,35.285,28.715,64,64,64h21.333V0H128C92.715,0,64,28.715,64,64z"/>
			<path d="M326.532,260.896c-19.712-11.477-26.603-25.92-28.949-36.885c-11.328,13.355-20.245,30.997-20.245,53.333
				c0,17.643,14.357,32,32,32c17.643,0,32-14.357,32-32C341.338,271.029,331.695,263.52,326.532,260.896z"/>
			<path d="M405.333,0H192v512h213.333c35.285,0,64-28.715,64-64V64C469.333,28.715,440.619,0,405.333,0z M309.333,352
				c-41.173,0-74.667-33.493-74.667-74.667c0-89.131,89.771-125.056,93.611-126.549c9.152-3.584,19.563-0.405,25.195,7.637
				c5.632,8.043,5.056,18.901-1.408,26.283c-5.995,6.976-14.293,21.419-12.843,29.973c0.213,1.301,0.789,4.736,7.552,8.704
				c2.517,1.131,37.227,19.008,37.227,53.952C384,318.507,350.507,352,309.333,352z"/>
		</g>
	</g>
</g>
</svg>
                            </button>
                                <div class="movement tooltip">
                                    <p>${trackedItem.usedMovement.toFixed(
                                      scale.parsed.digits
                                    )} /</p>
                                    <div class="tooltip">
                                        <span class="tooltiptext">
                                        <nobr>Speed</nobr>
                                        </span>
                                        <input type="number" id="input${i}" class='movementInput' value='${
        trackedItem.speed
      }'>
                                    </div>
                                    ${unit}
                                </div>
                        </div>
                        <hr class="divider">
            `;
      i++;
    }

    for (let n = 0; n < trackedItems.length; n++) {
      const trackedItem = trackedItems[n];
      const updateSpeed = async (e) => {
        await OBR.scene.items.updateItems(
          (item) => item.id === trackedItem.id,
          (items) => {
            for (let item of items) {
              if (item.metadata[`${ID}/metadata`] !== undefined) {
                item.metadata[`${ID}/metadata`].speed = e.target.value;
              }
            }
          }
        );
      };
      const resetMovement = async () => {
        const metadata = await OBR.room.getMetadata();
        if (!metadata[`${ID}/metadata`].state) {
          OBR.notification.show(
            "Please enable the plugin before using it features",
            "INFO"
          );
          return;
        }
        OBR.scene.items.updateItems(
          (item) => item.id == trackedItem.id,
          (items) => {
            for (let item of items) {
              if (item.metadata[`${ID}/metadata`] !== undefined) {
                item.metadata[`${ID}/metadata`].usedMovement = 0;
                item.metadata[`${ID}/metadata`].positionHistory = [
                  item.position,
                ];
                item.metadata[`${ID}/metadata`].usingSpell = false;
              }
            }
          }
        );
      };

      const undoMovement = async () => {
        const metadata = await OBR.room.getMetadata();
        if (!metadata[`${ID}/metadata`].state) {
          OBR.notification.show(
            "Please enable the plugin before using it features",
            "INFO"
          );
          return;
        }
        const itemsAll = await OBR.scene.items.getItems(
          (item) =>
            item.id == trackedItem.id || item.attachedTo == trackedItem.id
        );
        const item = itemsAll.filter((x) => x.attachedTo === undefined)[0];

        if (item.metadata[`${ID}/metadata`].positionHistory.length <= 1) {
          OBR.notification.show(
            `You haven't moved ${
              item.text.plainText == "" ? item.name : item.text.plainText
            } yet`,
            "INFO"
          );
          return;
        }
        itemsAll.splice(itemsAll.indexOf(item), 1);

        const positionHistory = item.metadata[`${ID}/metadata`].positionHistory;
        const oldPosition = positionHistory.pop();
        const newPosition = positionHistory[positionHistory.length - 1];
        const distance = await calculateFeet(oldPosition, newPosition);

        OBR.scene.items.updateItems(
          (x) => x.id == trackedItem.id || x.attachedTo == trackedItem.id,
          (items) => {
            for (let i of items) {
              if (i.attachedTo === undefined) {
                i.metadata[`${ID}/metadata`].positionHistory.pop();
                i.metadata[`${ID}/metadata`].usedMovement -= distance;
                i.position = newPosition;
              } else {
                i.position = newPosition;
              }
            }
          }
        );
      };
      const useSpell = async () => {
        const metadata = await OBR.room.getMetadata();
        if (!metadata[`${ID}/metadata`].state) {
          OBR.notification.show(
            "Please enable the plugin before using it features",
            "INFO"
          );
          return;
        }
        OBR.scene.items.updateItems(
          (item) => item.id == trackedItem.id,
          (items) => {
            for (let item of items) {
              item.metadata[`${ID}/metadata`].usingSpell =
                !item.metadata[`${ID}/metadata`].usingSpell;
            }
          }
        );
      };
      element
        .querySelector(`#reset${n}`)
        .addEventListener("click", resetMovement);
      element
        .querySelector(`#undo${n}`)
        .addEventListener("click", undoMovement);
      element
        .querySelector(`#input${n}`)
        .addEventListener("change", updateSpeed);
      element.querySelector(`#spell${n}`).addEventListener("click", useSpell);
    }
  };

  OBR.scene.items.onChange(async (items) => {
    recordPosition(items);

    renderMovementTrackerList(items);
  });
  try {
    renderMovementTrackerList(
      await OBR.scene.items.getItems(
        (item) => item.metadata[`${ID}/metadata`] !== undefined
      )
    );
  } catch (error) {}
}

export const setUpStateToggle = async (element) => {
  let meta = await OBR.room.getMetadata();
  if (
    (await OBR.player.getRole()) == "GM" &&
    meta[`${ID}/metadata`] === undefined
  ) {
    meta = {
      "com.abarbre.movement_tracker/metadata": {
        state: false,
      },
    };
  }
  element.checked = meta[`${ID}/metadata`].state;
  await OBR.room.setMetadata(meta);

  const toggleState = async (callback) => {
    const metadata = await OBR.room.getMetadata();

    const playerRole = await OBR.player.getRole();
    if (playerRole == "GM") {
      if (
        metadata[`${ID}/metadata`].state == false &&
        element.checked == true
      ) {
        OBR.scene.items.updateItems(
          (item) => item.metadata[`${ID}/metadata`] !== undefined,
          (items) => {
            for (let item of items) {
              item.metadata[`${ID}/metadata`].positionHistory = [item.position];
            }
          }
        );
      } else {
        OBR.scene.items.updateItems(
          (item) => item.metadata[`${ID}/metadata`] !== undefined,
          (items) => {
            for (let item of items) {
              item.metadata[`${ID}/metadata`].usedMovement = 0;
            }
          }
        );
      }
      metadata[`${ID}/metadata`].state = callback.target.checked;
    } else {
      OBR.notification.show("You shall not touch, the GM's button", "WARNING");
      element.checked = metadata[`${ID}/metadata`].state;
    }

    await OBR.room.setMetadata(metadata);
  };

  const updateStateToggle = async (data) => {
    const metadata = data[`${ID}/metadata`];
    element.checked = metadata.state;
  };
  OBR.room.onMetadataChange(updateStateToggle);
  element.addEventListener("input", toggleState);
};

export const setupGmReset = async (element) => {
  if ((await OBR.player.getRole()) == "PLAYER") {
    element.style["display"] = "none";
  }

  const gmReset = async () => {
    const metadata = await OBR.room.getMetadata();
    const items = await OBR.scene.items.getItems(
      (item) => item.metadata[`${ID}/metadata`] !== undefined
    );

    if (!metadata[`${ID}/metadata`].state) {
      OBR.notification.show(
        "Please enable the plugin before using it features",
        "INFO"
      );
      return;
    }
    if (
      items.every((item) => item.metadata[`${ID}/metadata`].isGmOnly == false)
    ) {
      OBR.notification.show("You haven't added any GM entities yet", "INFO");
      return;
    }
    OBR.scene.items.updateItems(
      (item) => item.metadata[`${ID}/metadata`],
      (items) => {
        for (let item of items) {
          const gmOnly = item.metadata[`${ID}/metadata`].isGmOnly;
          if (gmOnly) {
            item.metadata[`${ID}/metadata`].usedMovement = 0;
            item.metadata[`${ID}/metadata`].positionHistory = [item.position];
            item.metadata[`${ID}/metadata`].usingSpell = false;
          }
        }
      }
    );
  };
  element.addEventListener("click", gmReset);
};
