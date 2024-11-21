import {
  BACK_URL,
  BASIC_INFO_MESSAGE_WARNING,
  BASIC_TEMPO_STORAGE,
  EXTRA_INTERVALS,
  TOM_SETTINGS,
  BASIC_ATTRIBUTES,
  WHEELSTACK_WHEELS_LIMIT,
} from "../../uniConstants.js";
import { reqStorageExpandedData } from "../../rebuildGrid/js/websocketRel.js";
import { gridSocket } from "../../rebuildGrid/js/main.js";
import { updateOptions } from "../../utility/tomRelated.js";
import flashMessage from "../../utility/flashMessage/flashMessage.js";
import {
  gridPlacement,
} from "../../rebuildGrid/js/main.js";
import { triggerMoveSelectActive, moveSelectActive } from "../wheelstackMenu/wheelstackMenu.js";
import { getRequest } from "../../utility/basicRequests.js";
import { createOrderMenu } from "../orderMenu/orderMenu.js";
import { createOrderMoveWholestackFromStorage } from "../../utility/ordersCreation.js";

var intervalMaintainAvailableWheelstacks = null;
var lastChange = null;
var markMoveInterval = null;

export const tomWheelstacksTempo = new TomSelect(`#tomTargetTempoStorage`, TOM_SETTINGS.WHEELSTACK_TEMPO_STORAGE);
const allButs = document.getElementById('creationButtons');
const openerSlider = document.getElementById('creationViewSlider');
const checkEl = allButs.querySelector('.ts-control');
checkEl.style.width = '220px';
const moveFromStorageBut = document.getElementById('wheelstackStorageMenu');


openerSlider.addEventListener('click', (event) => {
  if (allButs.classList.contains('show-hidden')) {
    stopMaintainAvailableWheelstacks();
  } else {
    const chosenValue = tomWheelstacksTempo.getValue();
    if (chosenValue) {
      startMaintainAvailableWheelstacks();
    };
  };
});


tomWheelstacksTempo.on('change', async (event) => {
  const chosenOption = tomWheelstacksTempo.options[tomWheelstacksTempo.getValue()];
  const image = moveFromStorageBut.querySelector('img');
  if (chosenOption && chosenOption['blocked']) {
    image.src = 'static/images/blocked.png';
    return;
  };
  image.src = 'static/images/topRight.png';
  if (moveSelectActive) {
    clearCall();
  }
});


tomWheelstacksTempo.on('focus', () => {
  startMaintainAvailableWheelstacks();
});


tomWheelstacksTempo.on('blur', () => {
  const currentOption = tomWheelstacksTempo.getValue();
  if (currentOption) {
    return;
  };
  stopMaintainAvailableWheelstacks();
})


// + WS HANDLERS +
export const handleTempoStorageUpdate = (newData) => {
  if (!newData) {
    return;
  };
  if (0 !== newData['elements'].length) {
    lastChange = newData['lastChange'];
    tomWheelstacksTempo.settings.placeholder = 'Выберите стопу';
    tomWheelstacksTempo.inputState();
  } else {
    tomWheelstacksTempo.settings.placeholder = 'Нет доступных данных';
    tomWheelstacksTempo.inputState();
  };
  const newWheelstacks = {};
  for (let element of newData['elements']) {
    const elId = element['_id'];
    newWheelstacks[elId] = element;
  };
  for (let oldId of Object.keys(tomWheelstacksTempo.options)) {
    // No longer present == delete
    if (!(oldId in newWheelstacks)) {
      tomWheelstacksTempo.removeOption(oldId);
      continue;
    };
    // Present but changed == delete + update
    // Simple update doesnt update item data...
    const existChange = tomWheelstacksTempo.options[oldId]['lastChange'];
    const newChange = newWheelstacks[oldId]['lastChange'];
    if (existChange !== newChange) {
      tomWheelstacksTempo.removeOption(oldId);
    };
  };
  updateOptions(tomWheelstacksTempo, newData['elements'], false);
};
// - WS HANDLERS -



const stopMaintainAvailableWheelstacks = () => {
  if (intervalMaintainAvailableWheelstacks) {
    clearInterval(intervalMaintainAvailableWheelstacks);
    intervalMaintainAvailableWheelstacks = null;
  };
}


const startMaintainAvailableWheelstacks = () => {
  if (intervalMaintainAvailableWheelstacks) {
    stopMaintainAvailableWheelstacks();
  };
  intervalMaintainAvailableWheelstacks = setInterval( () => {
    reqStorageExpandedData(
      gridSocket, BASIC_TEMPO_STORAGE, lastChange
    );
  }, EXTRA_INTERVALS.TEMPO_WHEELSTACKS_UPDATE);
};


// + MOVE BUT +
// TODO: add clearance
const markEventHandlers = new Map();


const clearMarking = (eventHandlers, extraCalls = []) => {
  extraCalls.forEach( callBack => {
    callBack();
  });
  eventHandlers.forEach((handlerData, element) => {
    // { eventType: eventListener }
    Object.keys(handlerData).forEach( eventType => {
      element.removeEventListener(eventType, handlerData[eventType]);
    });
    if (document !== element) {
      element.classList.remove('move-possible');
      element.classList.remove('merge-possible');
    };
    eventHandlers.delete(element);
  });
};


const markMovePossible = (elementData, placement, markSelectActive, clearCallback) => {
  // Forced to use outside import...
  const emptyCellFilterClass = 'placement-cell-empty';
  const emptyCellMarkClass = 'move-possible';
  const emptyCells = placement.element.querySelectorAll(`.${emptyCellFilterClass}:not(.blocked):not(.${emptyCellMarkClass}):not(.identifier-cell)`);
  // + ADD MERGE + 
  const cellFilterClass = 'placement-cell';
  const cellMarkClass = 'merge-possible';
  const batchAttributeFilter = `[${BASIC_ATTRIBUTES.BATCH_NUMBER}="${elementData['batchNumber']}"]`;
  const mergeCells = placement.element.querySelectorAll(`.${cellFilterClass}:not(.blocked):not(.${cellMarkClass}):not(.identifier-cell)${batchAttributeFilter}`)
  // - ADD MERGE -
  if (0 === emptyCells.length && 0 === mergeCells.length && markSelectActive) {
    const markedCells = placement.element.querySelectorAll(`.${cellFilterClass}.${emptyCellMarkClass}`);
    // NO new empty to mark, but we're still having some we can use.
    if (0 !== markedCells.length) {
      return;
    }
    const emptyMessage = {...BASIC_INFO_MESSAGE_WARNING};
    emptyMessage.message = 'В приямке нет свободных ячеек';
    flashMessage.show(emptyMessage);
    clearCallback();
    return;
  };
  // TODO: all of these should be universal....
  // + MOVE HANDLER +
  const createMoveOrder = (element) => {
    return (event) => {
      if (!(element.classList.contains(`${emptyCellMarkClass}`))
         && !(element.classList.contains(`${cellMarkClass}`))
         && markSelectActive) {
        return;
      }
      const mergeType = element.classList.contains(`${cellMarkClass}`);
      let [destinationRow, destinationCol ] = element.id.split('|');
      const destinationData = {
        'destinationId': placement.placementId,
        'destinationType': placement.placementType,
        'destinationRow': destinationRow,
        'destinationCol': destinationCol,
      }
      createOrderMoveWholestackFromStorage(elementData, destinationData, mergeType);
      clearCallback();
    };
  };
  // - MOVE HANDLER -
  // Assign and store orderHandler for emptyCells.
  emptyCells.forEach(element => {
    if (element.classList.contains(`${emptyCellMarkClass}`)) {
      return;
    }
    element.classList.add(`${emptyCellMarkClass}`);
    if (markEventHandlers.has(element)) {
      return;
    }
    const moveOrderHandler = createMoveOrder(element);
    markEventHandlers.set(
      element, {
        'click': moveOrderHandler
      }
    );
    element.addEventListener('click', moveOrderHandler);
  });
  // ---
  // + MERGE +
  mergeCells.forEach(element => {
    if (element.classList.contains(`${cellMarkClass}`)) {
      return;
    }
    const targetWheelsAttr = element.getAttribute(BASIC_ATTRIBUTES.WHEELS);
    if (!targetWheelsAttr) {
      return;
    }
    const targetWheels = targetWheelsAttr.split(';');
    const sourceWheels = elementData['wheels'];
    // Wheels can be changed == we need to recheck == simply ignoring
    if ((targetWheels.length + sourceWheels.length) > WHEELSTACK_WHEELS_LIMIT) {
      return;
    }
    element.classList.add(`${cellMarkClass}`);
    if (markEventHandlers.has(element)) {
      return;
    }
    const mergeOrderHandler = createMoveOrder(element);
    markEventHandlers.set(
      element, {
        'click': mergeOrderHandler
      }
    );
    element.addEventListener('click', mergeOrderHandler);
  });
  // - MERGE -
};


const clearCall = () => {
  clearMarking(markEventHandlers, [
    () => {triggerMoveSelectActive(false)},
    () => {
      clearInterval(markMoveInterval);
      markMoveInterval = null
    },
    () => {
      shiftImage(moveFromStorageBut, standardImg);
    },
  ]);
};


const startMarkingHandler = (elementData) => {
  triggerMoveSelectActive(true);
  markMoveInterval = setInterval( () => {
    markMovePossible(elementData, gridPlacement, moveSelectActive, clearCall);
    const currentValue = tomWheelstacksTempo.getValue();
    if (elementData['_id'] !== currentValue) {
      clearCall();
    };
  }, EXTRA_INTERVALS.MOVE_SELECT_INTERVAL);

  // + FORCE CANCEL +

  let lastTapTimeMoveSelect = 0;
  const cancelDblClickTouchHandler = (event) => {
    const currentTime = new Date().getTime();
    const tapInterval = currentTime - lastTapTimeMoveSelect;
    if (tapInterval < 275 && tapInterval > 0) {
      clearCall();
    }
    lastTapTimeMoveSelect = currentTime;
  };
  const cancelDblClickHandler = (event) => {
    clearCall();
  };
  markEventHandlers.set(
    document, {
      'touchstart': cancelDblClickTouchHandler,
      'dblclick': cancelDblClickHandler,
    }
  );
  document.addEventListener('touchstart', cancelDblClickTouchHandler);
  document.addEventListener('dblclick', cancelDblClickHandler);
  // - FORCE CANCEL -
}


const blockedElementHandler = async (event, chosenElement) => {
  const orderDataURL = `${BACK_URL.GET_ORDER_BY_ID}/${chosenElement['lastOrder']}`;
  const orderResp = await getRequest(orderDataURL, false, true);
  const orderData = await orderResp.json();
  createOrderMenu(
    event, chosenElement['$div'], orderData, false, true
  );
};


const cancelImg = 'static/images/cancelBut.png';
const standardImg = 'static/images/topRight.png';

const shiftImage = async (button, source) => {
  const image = button.querySelector('img');
  image.src = source;
};


moveFromStorageBut.addEventListener('click', async (event) => {
  const chosenElement = tomWheelstacksTempo.options[tomWheelstacksTempo.getValue()];
  if (!chosenElement) {
    const showMsg = {...BASIC_INFO_MESSAGE_WARNING};
    showMsg.message = 'Для начала переноса, выберите <b>стопу</b>.';
    showMsg.duration = 2500;
    flashMessage.show(showMsg);
    return;
  };
  if (chosenElement['blocked']) {
    blockedElementHandler(event, chosenElement);
    return;
  };
  // Ideally we should have used `wheelstack` menu.
  // But, because we failed to create universal...
  // Just ignoring it and creating an option to move from storage -> grid-placement.
  // First, we will get correct history + we won't waste time on rebuilding menu.
  // There's no reason to hard-push this menu on storage, because we don't have correct history for it :)
  if (!moveSelectActive) {
    startMarkingHandler(chosenElement);
    shiftImage(moveFromStorageBut, cancelImg);
  } else {
    clearCall();
  };
});
// - MOVE BUT -