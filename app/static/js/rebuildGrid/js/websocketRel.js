// #region imports
import {
  BASIC_INFO_MESSAGE_ERROR,
  BASIC_INFO_MESSAGE_PRESET,
  BASIC_INFO_MESSAGE_WARNING,
  BASIC_TEMPO_STORAGE,
  WHEEL_STATUSES,
} from "../../uniConstants.js";
// + MAYBE CHANGE +
import {
  availableBatchNumbersWUnplaced,
  availableWheelsUnplaced,
  clearSelectorChosen,
  updateSelectorsData as updateSelectorsData,
  batchTomSelect,
  wheelTomSelectors,
} from "../../gridRel/wheelstackCreation/mainMenu.js";
import flashMessage from "../../utility/flashMessage/flashMessage.js";
import { handleTempoStorageUpdate } from "../../gridRel/tempoStorageSelector/tempoStorageSelector.js";
import {
  handlePlacementUpdate,
  handleBatchesUpdate,
  handleOrdersUpdate,
} from "./main.js";
import { wheelstackRebuildHandler } from "../../gridRel/wheelstackMenu/rebuildMenu.js";
// #endregion imports


export const initGridRelWebsocket = async (
  wsAddress,
  authToken,
) => {
  const socket = new WebSocket(`${wsAddress}?auth_token=${authToken}`);
  return socket;
};


// #region wsRequests
// #region wheelstackCreation
export const checkSocket = (webSocket) => {
  if (webSocket
     && webSocket.readyState !== WebSocket.CONNECTING
     && webSocket.readyState !== WebSocket.CLOSED
     && webSocket.readyState !== WebSocket.CLOSING
  ) {
    return true;
  };
  return false
}
// + WHEELSTACK CREATION +
export const reqBatchNumbersWUnplaced = async (socket) => {
  if (!checkSocket(socket)) {
    return;
  };
  const req_data = {
    'type': 'gather',
    'filter': {
      'task': 'batchNumbersWUnplaced',
      'dataFilter': '',
    }
  };
  socket.send(JSON.stringify(req_data));
};


export const reqBatchNumberUnplacedWheels = async (socket, batchNumber, handler = '') => {
  if (!checkSocket(socket)) {
    return;
  };
  const req_data = {
    'type': 'gather',
    'filter': {
      'task': 'wheelsUnplaced',
      'dataFilter': {
        'batchNumber': batchNumber,
        'status': WHEEL_STATUSES.UNPLACED,
      },
    },
    'handler': handler,
  };
  socket.send(JSON.stringify(req_data));
};


export const reqWheelstackCreation = async (socket, wheelstackData) => {
  if (!checkSocket(socket)) {
    return;
  };
  const req_data = {
    'type': 'create',
    'filter': {
      'task': 'wheelstackCreation',
      'dataFilter': {
        'wheelstackData': wheelstackData
      },
    },
  };
  socket.send(JSON.stringify(req_data));
};


const handleAvailableBatchNumbersWUnplaced = (newData) => {
  if (!batchTomSelect) {
    return;
  }
  if (0 === newData.length && !batchTomSelect.isDisabled) {
    const showMsg = {...BASIC_INFO_MESSAGE_WARNING};
    showMsg.message = 'Нет доступных к использованию <b>свободных</b> колёс';
    showMsg.fontSize = '20px';
    showMsg.duration = 2500;
    flashMessage.show(showMsg);  
    batchTomSelect.settings.placeholder = 'Нет доступных данных';
    batchTomSelect.inputState();
    batchTomSelect.disable();
  } else if (0 !== newData.length && batchTomSelect.isDisabled) {
    const showMsg = {...BASIC_INFO_MESSAGE_WARNING};
    showMsg.message = 'Получены новые <b>свободные</b> колёса';
    showMsg.fontSize = '20px';
    showMsg.duration = 1500;
    flashMessage.show(showMsg);
    batchTomSelect.settings.placeholder = 'Выберите партию стопы';
    batchTomSelect.inputState();
    batchTomSelect.enable();
  };
  updateSelectorsData([batchTomSelect], availableBatchNumbersWUnplaced, newData, 'batchNumber');
};


const wheelstackCreationWheelsUnplaced = (newData) => {
  const wheelsData = newData['wheels']
  if (0 === wheelsData) {
    clearSelectorChosen(batchTomSelect);
  };
  updateSelectorsData(wheelTomSelectors, availableWheelsUnplaced, wheelsData, '_id');
};
// - WHEELSTACK CREATION -
// #endregion wheelstackCreation

// + TEMPO STORAGE +
export const reqStorageExpandedData = (socket, storageName, lastChange) => {
  if (!checkSocket(socket)) {
    return;
  };
  const reqData = {
    'type': 'gather',
    'filter': {
      'task': 'expandedStorage',
      'dataFilter': {
        'name': storageName,
        'lastChange': lastChange
      },
    },
  };
  // console.log('preRequestData', reqData);
  socket.send(JSON.stringify(reqData));
};
// - TEMPO STORAGE -

// + PLACEMENT +
export const reqPlacementData = (socket, placementData) => {
  if (!checkSocket(socket)) {
    return;
  };
  const reqData = {
    'type': 'gather',
    'filter': {
      'task': 'placementUpdate',
      'dataFilter': placementData,
    },
  };
  socket.send(JSON.stringify(reqData));
};
// - PLACEMENT -
// + BATCHES +
export const reqBatchesData = (socket, batchNumbers = []) => {
  if (!checkSocket(socket)) {
    return;
  };
  const reqData = {
    'type': 'gather',
    'filter': {
      'task': 'batchesData',
      'dataFilter': {
        'batchNumbers': batchNumbers,
      },
    },
  };
  socket.send(JSON.stringify(reqData));
};
// - BATCHES -
// + ORDERS +
export const reqOrdersData = (socket, orders = []) => {
  if (!checkSocket(socket)) {
    return;
  };
  const reqData = {
    'type': 'gather',
    'filter': {
      'task': 'ordersData',
      'dataFilter': {
        'orders': orders,
        'activeOrders': true,
        'completedOrders': false,
        'canceledOrders': false,
      },
    },
  };
  socket.send(JSON.stringify(reqData));
};
// - ORDERS -
// #region rebuildMenu

// #endregion rebuildMenu

// #endregion wsRequests


export const assignGridWebSocketListeners = async (socket) => {
  if (!socket) {
    throw new Error(`Empty arg = socket => ${socket}`)
  };
  socket.onmessage = (event) => {
    const messageData = JSON.parse(event.data);
    // console.log('websocketResponse: ', messageData);
    if ('error' === messageData['type']) {
      const showMsg = {...BASIC_INFO_MESSAGE_ERROR};
      showMsg.message = `<b>WS_ERROR</b><br>ErrorCode: ${messageData['code']}<br>Message: ${messageData['message']}`;
      showMsg.duration = 5000;
      flashMessage.show(showMsg);
    } else if ('dataUpdate' === messageData['type']) {
      const taskName = messageData['filter']['task'];
      const handler = messageData['handler'];
      if ('batchNumbersWUnplaced' === taskName) {
        handleAvailableBatchNumbersWUnplaced(messageData['data']);
      } else if ('wheelsUnplaced' === taskName) {
        // TODO: change to normal dict filter, but its one use for now. W.e
        if (handler) {
          if ('wheelstackCreationHandler' === handler) {
            wheelstackCreationWheelsUnplaced(messageData['data']);
          } else if ('wheelstackRebuildHandler' === handler) {
            wheelstackRebuildHandler(messageData['data']);
          };
        };
      } else if ('expandedStorage' === taskName) {
        handleTempoStorageUpdate(messageData['data']);
      } else if ('placementUpdate' === taskName) {
        handlePlacementUpdate(messageData['data']);
      } else if ('batchesUpdate' === taskName) {
        handleBatchesUpdate(messageData['data']);
      } else if ('ordersUpdate' === taskName) {
        handleOrdersUpdate(messageData['data']);
      };
    // Not the best idea to create within WS. But this one is test-task and it's fine.
    // Because we're just closing menu w.o anything else.
    // Better will stick to POST, because it's better for error handle1.
    } else if ('create' === messageData['type']) {
      if ('wheelstackCreation' === messageData['filter']['task']) {
        const showMsg = {...BASIC_INFO_MESSAGE_PRESET};
        showMsg.message = `<b>Стопа</b> с выбраннами данными.<br>Успешно добавлена во временное хранилище <b>${BASIC_TEMPO_STORAGE}.`;
        showMsg.duration = 2500;
        flashMessage.show(showMsg);
      };
    };
  };
  socket.onerror = (event) => {
    console.log('WS error', event);
  };
};
