import {
  BASIC_INFO_MESSAGE_ERROR,
  BASIC_INFO_MESSAGE_WARNING,
  BASIC_WHEELS_SEARCHER_OPTION,
  WHEEL_STATUSES,
  WHEELSTACK_WHEELS_LIMIT,
} from "../../uniConstants.js";
import BasicSearcher from "../../utility/search/basicSearcher.js";
import { getRequest, patchRequest } from "../../utility/basicRequests.js";
import { BACK_URL } from "../../uniConstants.js";
import flashMessage from "../../utility/flashMessage/flashMessage.js";


// global*
var wheelSearchers = [];
var openerWheels = [];
var openerElData = null;
var availableWheels = [];
var usedRecords = {};
var wheelsUpdateInterval = null;
var mainCloser = null;


// + WHEELS VALIDATION +
const validateWheelFields = (wheelsList) => {
  const wheelFields = Array.from(wheelsList.childNodes)
  let chosenWheelsIds = [];
  let maximumWheelIndex = WHEELSTACK_WHEELS_LIMIT - 1;
  for (let wheelIndex = maximumWheelIndex; wheelIndex >= 0; wheelIndex -= 1) {
    const wheelField = wheelFields[wheelIndex];
    const wheelInput = wheelField.querySelector('#inputField');
    const wheelId = wheelInput.value;
    chosenWheelsIds[maximumWheelIndex - wheelIndex] = wheelId;
  }
  let lastMissingIndex = -1;
  for (let wheelIndex = 1; wheelIndex <= maximumWheelIndex; wheelIndex += 1) {
    if ('' !== chosenWheelsIds[wheelIndex] && '' === chosenWheelsIds[wheelIndex - 1]) {
      lastMissingIndex = (maximumWheelIndex - wheelIndex) + 1;
    };
  };
  if (-1 !== lastMissingIndex) {
    const showMsg = BASIC_INFO_MESSAGE_WARNING;
    showMsg.message = '<b>Стопа не может иметь пропущенные элементы между колёсами.</b><br>Заполните пропущенные колёса.';
    showMsg.duration = 2500;
    flashMessage.show(showMsg);
    for (let markIndex = lastMissingIndex; markIndex <= maximumWheelIndex; markIndex += 1) {
      const missingWheelElement = wheelFields[markIndex];
      const missingInput = missingWheelElement.querySelector('#inputField');
      if ('' !== missingInput.value) {
        continue;
      }
      missingWheelElement.classList.add('delete-blink');
      setTimeout(() => {
        missingWheelElement.classList.remove('delete-blink');
      }, 1000);
    };
    return [];
  };
  // Cringe - but then we should check for undefined and need to rebuild :)
  if (-1 === lastMissingIndex && '' === chosenWheelsIds[0]) {
    const showMsg = BASIC_INFO_MESSAGE_WARNING;
    showMsg.message = '<b>Стопа не может быть пустой.</b><br>Выберите колесо.';
    showMsg.duration = 2500;
    flashMessage.show(showMsg);
    return [];
  };
  // Tried to use data field to set in searchFields on searcher.
  // But it's too much to cover: focus, unfocus selected not selected, symbol removed etc.
  // Either we change this from input => selector.
  // Or we need to extra check for correct wheel Ids before creating request.
  // Because, we're using `ObjectId` of the wheel, not `wheelId`...
  let wheelsMap = {};
  for (let [position, wheelId] of chosenWheelsIds.entries()) {
    if (wheelId) {
      wheelsMap[wheelId] = position;
    }
    
  }
  const correctWheels = [];
  for (let wheelData of availableWheels) {
    const checkWheelId = wheelData['wheelId'];
    if (checkWheelId in wheelsMap) {
      correctWheels[wheelsMap[checkWheelId]] = wheelData['_id'];
    };
  }
  return correctWheels;
  // return chosenWheelsIds;
}
// - WHEELS VALIDATION -


// + Closer +
const menuCloser = async (event, openerElement, menuElement, subMenus, boundCloser, force = false) => {
  if (!force) {
    if (event.target === menuElement || menuElement.contains(event.target)) {
      return;
    }
    for (let subMenu of Object.values(subMenus)) {
      if (subMenu && subMenu.contains(event.target)) {
        return;
      }
    }  
  }
  if (wheelsUpdateInterval) {
    clearInterval(wheelsUpdateInterval);
    wheelsUpdateInterval = null;
  }
  wheelSearchers.forEach(searcher => {
    searcher.clearListeners();
  })
  subMenus = {};
  menuElement.classList.add('hidden');
  document.body.removeEventListener('mousedown', boundCloser);
  document.body.removeEventListener('touchstart', boundCloser);
  setTimeout(() => {
    menuElement.remove();
    openerElement.classList.remove('hidden');
  }, 250);
}


const assignCloser = async (openerElement, menuElement, subMenus = {}) => {
  mainCloser = (event, force = false) => menuCloser(event, openerElement, menuElement, subMenus, mainCloser, force)
  
  document.body.addEventListener('mousedown', mainCloser);
  document.body.addEventListener('touchstart', mainCloser);
  return mainCloser;
}
// - Closer -


const getUnplacedWheels = async (batchNumber = '') => {
  const wheelsUrl = `${BACK_URL.GET_ALL_WHEELS}?batch_number=${batchNumber}&wheel_status=${WHEEL_STATUSES.UNPLACED}`;
  const wheelsData = await getRequest(wheelsUrl, true, true);
  return wheelsData.json();
}


const updateAvailableWheels = async () => {
  const unplacedWheels = await getUnplacedWheels(openerElData['batchNumber']);
  availableWheels = [...openerWheels, ...unplacedWheels]
  wheelSearchers.forEach( searcher => {
    searcher.setData(availableWheels);
  });
}


const maintainAvailableWheels = () => {
  if (wheelsUpdateInterval) {
    clearInterval(wheelsUpdateInterval);
    wheelsUpdateInterval = null;
  }
  updateAvailableWheels()
  wheelsUpdateInterval = setInterval( async () => {
    updateAvailableWheels()
  }, 500);
}


export const createWheelSelector = async (wheelPosition) => {
  // TODO: All this inplace styling needs to be changed. No time :(
  //   Especially this clear-btn fiesta :)
  const wheelRecord = document.createElement('li');
  wheelRecord.classList.add('empty-record');
  wheelRecord.id = `wheelSelectField${wheelPosition}`
  wheelRecord.title = 'Выберите элемент';

  const wheelInputGroup = document.createElement('div');
  wheelInputGroup.id = 'inputGroup';
  wheelInputGroup.classList.add('form-group-sm', 'position-relative', 'dropup');
  
  const wheelSelector = document.createElement('input');
  wheelSelector.id = 'inputField';
  wheelSelector.classList.add('form-control-sm', 'fs-5');
  wheelSelector.style.textAlign = 'center';
  wheelSelector.style.maxWidth = '60%';
  
  wheelInputGroup.appendChild(wheelSelector);

  const clearButton = document.createElement('button');
  clearButton.id = 'clearInputField';
  clearButton.style.display = 'none';
  clearButton.style.marginLeft = '10px';
  clearButton.classList.add('btn', 'clear-btn');

  const clearImage = document.createElement('img');
  clearImage.src = 'static/images/cancelBut.png'; 
  clearImage.style.height = '15px';
  clearImage.style.width = '15px';
  clearButton.appendChild(clearImage);
  wheelInputGroup.appendChild(clearButton);

  // Cringe clearance, but we need to filter used values...
  let prevValue = null;
  wheelSelector.addEventListener('focus', (event) => {
    prevValue = wheelSelector.value;
  })

  wheelSelector.addEventListener('input', () => {
    const newVal = wheelSelector.value;
    if (newVal !== '') {
      clearButton.style.display = 'block';
    } else {
      clearButton.style.display = 'none';
    }
    delete usedRecords[prevValue];
    prevValue = newVal
  });
  clearButton.addEventListener('click', () => {
    clearButton.style.display = 'none';
  });

  const resultsDropup = document.createElement('ul');
  resultsDropup.id = 'resultsDropup';
  resultsDropup.classList.add('dropup', 'dropdown-menu', 'w-50');
  resultsDropup.style.marginLeft = '20%';
  resultsDropup.style.maxHeight = '300px';
  wheelInputGroup.appendChild(resultsDropup);

  const wheelSearcher = new BasicSearcher(
    wheelInputGroup,
    wheelSelector,
    clearButton,
    resultsDropup,
    // We don't have any actions to assign. Except clearing ignored values.
    (selectedValue) => {
      clearButton.style.display = 'block';
      prevValue = selectedValue;
      usedRecords[selectedValue] = true;
    },
    () => {
      delete usedRecords[wheelSelector.value];
    },
    () => {},
    'wheelId',
    usedRecords,
    true
  );
  const settings = BASIC_WHEELS_SEARCHER_OPTION;
  settings['keys'] = ['wheelId'];
  wheelSearcher.setOptions(settings);
  wheelSearchers.push(wheelSearcher);

  wheelRecord.appendChild(wheelInputGroup);
  return wheelRecord;
}


export const createRebuildMenu = async (originalMenu, openerData, dataBanks, removeDependedElements = [], originalMenuCloser) => {
  usedRecords = {};
  wheelSearchers = [];
  openerWheels = [];
  availableWheels = [];
  openerElData = openerData;

  const menus = {};
  const menu = document.createElement('div');
  menu.id = openerElData['_id'];
  menu.classList.add('wheelstack-menu', 'show');
  
  const originalRect = originalMenu.getBoundingClientRect();

  // Set menu to match originalMenu's position and size
  menu.style.top = `${originalRect.top}px`;
  menu.style.left = `${originalRect.left}px`;
  menu.style.width = `${originalRect.width}px`;

  originalMenu.classList.add('hidden');

  document.body.appendChild(menu);

  const wheelsList = document.createElement('ul');
  wheelsList.id = 'wheelsField';
  for (let wheelIndex = WHEELSTACK_WHEELS_LIMIT - 1; wheelIndex > -1; wheelIndex -= 1) {
    let wheelRecord = await createWheelSelector(wheelIndex);
    wheelsList.appendChild(wheelRecord);
  }
  // ADD searchers data update
  for (let wheelObjectId of openerElData['wheels']) {
    const wheelData = dataBanks['wheels'][wheelObjectId];
    openerWheels.push(wheelData)
  }
  // + ACTION BUTTONS + 
  const actionButtonsContainer = document.createElement('div');
  actionButtonsContainer.id = 'actionButtons';
  actionButtonsContainer.classList.add('wheelstack-buttons','horizontal');
  //   + REBUILD BUTTON +
  const rebuildButton = document.createElement('button');
  rebuildButton.id = 'rebuildButton';
  rebuildButton.innerHTML = 'Изменить';
  rebuildButton.title = 'Изменить состав стопы';
  rebuildButton.classList.add('btn', 'btn-dark', 'w-100');
  rebuildButton.addEventListener('click', async event => {
    const corData = validateWheelFields(wheelsList);
    if (0 === corData.length) {
      return;
    }
    const reconstructURL = `${BACK_URL.PATCH_RECONSTRUCT_WHEELSTACK}/${openerData['_id']}`
    const wheelsBody = JSON.stringify({
      'wheels': corData
    });
    const reqArgs = {
      'method': 'PATCH',
      'body': wheelsBody
    };
    try {
      const corResp = await patchRequest(
        reconstructURL, true, true, reqArgs
      );
      originalMenuCloser(event, true);
      mainCloser(event, true);
    } catch (error) {
      const showMsg = BASIC_INFO_MESSAGE_ERROR;
      showMsg.message = `<b>Ошибка</b> обновления:<br> ${error}`;
      showMsg.duration = 5000;
      flashMessage.show(showMsg);
    };
  })
  actionButtonsContainer.appendChild(rebuildButton);
  //   - REBUILD BUTTON -
  //   + CANCEL BUTTON +
  const cancelButton = document.createElement('button');
  cancelButton.id = 'cancelButton';
  cancelButton.innerHTML = 'Вернуться';
  cancelButton.title = 'Вернуть меню стопы';
  cancelButton.classList.add('btn', 'btn-danger', 'w-100');
  actionButtonsContainer.appendChild(cancelButton);
  cancelButton.addEventListener('click', event => {
    mainCloser(event, true);
  })
  //   - CANCEL BUTTON -
  menu.appendChild(actionButtonsContainer);
  // - ACTION BUTTONS -
  assignCloser(originalMenu, menu, menus);
  maintainAvailableWheels();
  menu.appendChild(wheelsList);

  const openerExistInterval = setInterval(() => {
    const openerExists = dataBanks['wheelstacks'][openerData['_id']];
    const openerBlocked = openerExists['blocked'];
    if (originalMenu && openerExists && !(openerBlocked)) {
      return;
    }
    removeDependedElements.forEach( element => {
      element.classList.add('hidden');
    })
    mainCloser(null, true);
    clearInterval(openerExistInterval);
  }, 150);

  return menu
}
