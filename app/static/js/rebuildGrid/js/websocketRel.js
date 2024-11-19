import { AUTH_COOKIE_NAME, BASIC_INFO_MESSAGE_ERROR, BASIC_INFO_MESSAGE_PRESET, BASIC_INFO_MESSAGE_WARNING, BASIC_TEMPO_STORAGE, griRelSocketAddress, WHEEL_STATUSES } from "../../uniConstants.js";
import { getCookie } from "../../utility/roleCookies.js";
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
// - MAYBE CHANGE -


export const initGridRelWebsocket = async (useAuthToken = true) => {
  let authToken = '';
  if (useAuthToken) {
    authToken = await getCookie(AUTH_COOKIE_NAME);
  }
  const socket = new WebSocket(`${griRelSocketAddress}?auth_token=${authToken}`);
  // TODO: Error handle?
  // socket.onerror = event => {
  //
  // }
  await assignWebSocketListeners(socket);
  return socket;
};


// + WHEELSTACK CREATION +
export const reqBatchNumbersWUnplaced = async (socket) => {
  const req_data = {
    'type': 'gather',
    'filter': {
      'task': 'batchNumbersWUnplaced',
      'dataFilter': '',
    }
  };
  socket.send(JSON.stringify(req_data));
};


export const reqBatchNumberUnplacedWheels = async (socket, batchNumber) => {
  const req_data = {
    'type': 'gather',
    'filter': {
      'task': 'wheelsUnplaced',
      'dataFilter': {
        'batchNumber': batchNumber,
        'status': WHEEL_STATUSES.UNPLACED,
      },
    },
  };
  socket.send(JSON.stringify(req_data))
};


export const reqWheelstackCreation = async (socket, wheelstackData) => {
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
  }
  updateSelectorsData([batchTomSelect], availableBatchNumbersWUnplaced, newData, 'batchNumber');
};


const handleAvailableWheelsUnplaced = (newData) => {
  if (0 === newData.length){
    clearSelectorChosen(batchTomSelect);
  };
  updateSelectorsData(wheelTomSelectors, availableWheelsUnplaced, newData, '_id');
};
// - WHEELSTACK CREATION -

// + TEMPO STORAGE +
export const reqStorageExpandedData = (socket, storageName, lastChange) => {
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




const assignWebSocketListeners = async (socket) => {
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
      if ('batchNumbersWUnplaced' === taskName) {
        handleAvailableBatchNumbersWUnplaced(messageData['data']);
      } else if ('wheelsUnplaced' === taskName) {
        handleAvailableWheelsUnplaced(messageData['data']);
      } else if ('expandedStorage' === taskName) {
        handleTempoStorageUpdate(messageData['data']);
      }
    } else if ('create' === messageData['type']) {
      if ('wheelstackCreation' === messageData['filter']['task']) {
        const showMsg = {...BASIC_INFO_MESSAGE_PRESET};
        showMsg.message = `<b>Стопа</b> с выбраннами данными.<br>Успешно добавлена во временное хранилище <b>${BASIC_TEMPO_STORAGE}.`;
        showMsg.duration = 2500;
        flashMessage.show(showMsg);
      }
    }
  };
  socket.onerror = (event) => {
    console.log('WS error', event);
  };
  socket.onclose = (event) => {
    console.log('WS closed', event);
  };
};
