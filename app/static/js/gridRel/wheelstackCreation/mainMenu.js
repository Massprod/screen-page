import { gridSocket } from "../../rebuildGrid/js/main.js";
import {
  reqBatchNumbersWUnplaced,
  reqBatchNumberUnplacedWheels,
  reqWheelstackCreation,
} from "../../rebuildGrid/js/websocketRel.js";
import {
  BASIC_INFO_MESSAGE_WARNING,
  EXTRA_INTERVALS,
  PLACEMENT_TYPES,
  TOM_SETTINGS,
  WHEELSTACK_WHEELS_LIMIT,
  BASIC_TEMPO_STORAGE,
} from "../../uniConstants.js";
import {showMenu, closeMenu } from "../wheelCreation/mainMenu.js";
import flashMessage from "../../utility/flashMessage/flashMessage.js";


export var availableBatchNumbersWUnplaced = [];
export var availableWheelsUnplaced = [];

var intervalMaintainAvailableBatches = null;
var intervalMaintainAvailableWheels = null;
var basicClearIntervals = new Set();
export var batchTomSelect = null;
export var wheelTomSelectors = [];
var chosenWheels = [];
var duplicateWheels = {};


const clearDependencies = () => {
  basicClearIntervals.forEach(interval => {
    if (interval) {
      clearInterval(interval);
    }
    basicClearIntervals.delete(interval);
    interval = null;
  });
  chosenWheels = [];
  duplicateWheels = {};
  wheelTomSelectors = [];
  batchTomSelect = null;
};


// + ACTIONS +
const actionCreateWheelstack = (wheelsData) => {
  const batchNumber = wheelsData['batchNumber'];
  const corWheels = wheelsData['wheels'].filter(record => record !== '' && record != null);
  const wheelstackData = {
    'batchNumber': batchNumber,
    'placementType': PLACEMENT_TYPES.STORAGE,
    'placementId': '',
    'placementName': BASIC_TEMPO_STORAGE,
    'rowPlacement': '',
    'colPlacement': '',
    'lastOrder': null,
    'maxSize': WHEELSTACK_WHEELS_LIMIT,
    'blocked': false,
    'wheels': corWheels,
    'status': PLACEMENT_TYPES.STORAGE,
  };
  reqWheelstackCreation(gridSocket, wheelstackData);
};
// - ACTIONS -

// + VALIDATION +
const validateBatch = (menu, selector) => {
  const batchNumber = selector.getValue();
  if (!batchNumber) {
    const batchWrapper = menu.querySelector('#batchData');
    const batchInput = batchWrapper.querySelector('.ts-control');
    batchInput.classList.add('delete-blink');
    setTimeout(() => {
      batchInput.classList.remove('delete-blink');
    }, 2000);
    const showMsg = {...BASIC_INFO_MESSAGE_WARNING};
    showMsg.message = 'Заполните обязательное поле <b>`Номер партии`</b>';
    showMsg.duration = 2750;
    flashMessage.show(showMsg);
  };
  return batchNumber;
};


const validateWheels = (wheelsContainer, wheels) => {
  let validated = false;
  // Duplicates check.
  let uniqueWheels = new Set();
  for (let wheelId of wheels) {
    if (!wheelId) {
      continue;
    }
    if (uniqueWheels.has(wheelId)) {
      const showMsg = {...BASIC_INFO_MESSAGE_WARNING};
      showMsg.message = 'Удалите выделенные <b>ДУБЛИКАТЫ</b> колёс';
      showMsg.duration = 2500;
      flashMessage.show(showMsg);
      return validated;
    }
    uniqueWheels.add(wheelId);
  };
  // Check if empty
  if (0 === uniqueWheels.size) {
    const showMsg = {...BASIC_INFO_MESSAGE_WARNING};
    showMsg.duration = 2500;
    showMsg.message = '<b>Стопа</b> не может быть пустой.';
    showMsg.fontSize = '20px';
    flashMessage.show(showMsg);
    return validated;
  }
  let maximumWheelIndex = WHEELSTACK_WHEELS_LIMIT - 1;
  // Check all set values.
  let lastSetValueIndex = -1;
  for (let wheelIndex = 1; wheelIndex <= maximumWheelIndex; wheelIndex += 1) {
    if (wheels[wheelIndex] && !wheels[wheelIndex - 1]) {
      lastSetValueIndex = wheelIndex;
    };
  };
  // Everything below it should be marked as missing.
  if (-1 !== lastSetValueIndex) {
    const missingInputs = [];
    for (let index = 0; index < lastSetValueIndex; index += 1) {
      if (wheels[index]) {
        continue
      };
      const inputWrapper = wheelsContainer.querySelector(`#wheelSelectorWrapper${index}`);
      const inputControl = inputWrapper.querySelector('.ts-control');
      missingInputs.push(inputControl);
    }
    const showMsg = {...BASIC_INFO_MESSAGE_WARNING};
    showMsg.message = '<b>Стопа не может иметь пропущенные элементы между колёсами.</b><br>Заполните пропущенные колёса.';
    showMsg.duration = 2500;
    flashMessage.show(showMsg);
    missingInputs.forEach((input) => {
      input.classList.add('delete-blink-slow');
      setTimeout(() => {
        input.classList.remove('delete-blink-slow');
      }, 2500);
    });
    return validated;
  };
  validated = true;
  return validated;
};


const gatherValidateWheelsData = (menu, wheels) => {
  const batchNumber = validateBatch(menu, batchTomSelect);
  if (!batchNumber) {
    return;
  };
  const wheelsContainer = menu.querySelector('#wheelsContainer');
  if (!validateWheels(wheelsContainer, wheels)) {
    return;
  };
  const wheelsData = {
    'batchNumber': batchNumber,
    'wheels': wheels, 
  }
  return wheelsData;
};
// - VALIDATION -

// + DATA REL +
const clearSelectorOptions = (selector, options) => {
  options.forEach(option => {
    selector.removeOption(option);
  });
};


export const updateSelectorsData = (selectors = [], oldData, newData, key = null) => {
  let oldUnique = new Set();
  if (key) {
    oldData.map(element => {
      oldUnique.add(element[key]);
    });
  } else {
    oldUnique = new Set(oldData);
  };
  for (let newValue of newData) {
    if (key) {
      oldUnique.delete(newValue[key]);
    } else {
      oldUnique.delete(newValue);
    };
  };
  selectors.forEach(selector => {
    clearSelectorOptions(selector, oldUnique);
  })
  oldData.length = 0;
  oldData.push(...newData);
  selectors.forEach(selector => {
    updateOptions(selector, oldData);
  });
};
// + BATCHES UPDATE +
export const clearSelectorChosen = (selector) => {
  selector.removeOption(selector.getValue());
};

const stopMaintainAvailableBatches = () => {
  clearInterval(intervalMaintainAvailableBatches);
  intervalMaintainAvailableBatches = null;
};

const startMaintainAvailableBatches = (extraCalls = []) => {
  if (intervalMaintainAvailableBatches) {
    stopMaintainAvailableBatches();
  }
  intervalMaintainAvailableBatches = setInterval( async () => {
    reqBatchNumbersWUnplaced(gridSocket);
    extraCalls.forEach(callback => {
      callback();
    })
  }, EXTRA_INTERVALS.WHEELSTACK_CREATION_MENU_BATCHES);
  basicClearIntervals.add(intervalMaintainAvailableBatches);
};
// - BATCHES UPDATE -

// + WHEELS UPDATE + 
const stopMaintainAvailableWheels = () => {
  clearInterval(intervalMaintainAvailableWheels);
  intervalMaintainAvailableWheels = null;
}


const startMaintainAvailableWheels = (batchNumber, extraCalls = []) => {
  if (intervalMaintainAvailableWheels) {
    stopMaintainAvailableWheels();
  };
  intervalMaintainAvailableWheels = setInterval( () => {
    reqBatchNumberUnplacedWheels(gridSocket, batchNumber, 'wheelstackCreationHandler');
    extraCalls.forEach(callback => {
      callback();
    });
  }, EXTRA_INTERVALS.WHEELSTACK_CREATION_MENU_WHEELS);
  basicClearIntervals.add(intervalMaintainAvailableWheels);
}
// - WHEELS UPDATE -


// + SELECTORS +
const assignTomSelect = (elementId, settings) => {
  const tomWrapper = new TomSelect(`#${elementId}`, settings);
  return tomWrapper;
}

const updateOptions = (tomSelector, options, disableEmpty = true) => {
  if (0 === options.length && disableEmpty) {
    tomSelector.disable();
  } else {
    tomSelector.enable();
  }
  tomSelector.addOptions(options);
}
// - SELECTORS -
// - DATA REL -


// + MENU REL +
export const createWheelstackCreationMenu = (event) => {
  clearDependencies();
  const menuContainer = document.createElement('div');
  menuContainer.classList.add('form-container', 'p-4');
  // + TITLE +
  const menuTitle = document.createElement('h4');
  menuTitle.classList.add('text-center');
  menuTitle.textContent = 'Добавление стопы';
  menuContainer.appendChild(menuTitle);
  // - TITLE -
  // + BATCH NUMBER +
  const batchContainer = document.createElement('div');
  batchContainer.id = 'batchData';
  batchContainer.classList.add('mb-3');
  const labelBatchNumber = document.createElement('label');
  labelBatchNumber.classList.add('form-label');
  labelBatchNumber.setAttribute('for', 'batchNumber');
  labelBatchNumber.innerHTML = 'Номер <b>партии</b> стопы';
  batchContainer.appendChild(labelBatchNumber);
  const selectBatchNumber = document.createElement('select');
  selectBatchNumber.id = 'selectBatch';
  batchContainer.appendChild(selectBatchNumber);
  menuContainer.appendChild(batchContainer);
  // - BATCH NUMBER -
  // + WHEELS CONT +
  const wheelsCont = document.createElement('div');
  wheelsCont.id = 'wheelsContainer';
  wheelsCont.classList.add('wheels-cont');
  for (let wheelIndex = WHEELSTACK_WHEELS_LIMIT - 1; wheelIndex >= 0; wheelIndex -= 1) {
    const wheelSelectorWrapper = document.createElement('div');
    wheelSelectorWrapper.id = `wheelSelectorWrapper${wheelIndex}`;
    wheelSelectorWrapper.classList.add('mb-3', 'wheels-wrapper');
    const textT = document.createElement('div');
    textT.classList.add('wheels-text');
    textT.textContent = `${wheelIndex + 1}. `;
    wheelSelectorWrapper.appendChild(textT);
    const wheelSelector = document.createElement('select');
    wheelSelector.id = `selectWheels|${wheelIndex}`;
    wheelSelectorWrapper.appendChild(wheelSelector);
    wheelsCont.appendChild(wheelSelectorWrapper);
  }
  menuContainer.appendChild(wheelsCont);
  // - WHEELS CONT -
  // + BUTTONS CONT + 
  const buttonsGroup = document.createElement('div');
  buttonsGroup.classList.add('d-flex', 'justify-content-between', 'gap-1');
  //  + CREATE BUTTON +
  const createButton = document.createElement('button');
  createButton.classList.add('btn', 'btn-warning');
  createButton.textContent = 'Добавить стопу';
  createButton.addEventListener('click', event => {
    const wheelsData = gatherValidateWheelsData(menuContainer, chosenWheels);
    if (!wheelsData) {
      return;
    }
    actionCreateWheelstack(wheelsData);
    // TODO: we can't simply check if it was success.
    // So, either we pass menu into handlers and close it when message of success.
    // Or we don't care, because if it fails we still need to choose everyhing again :)
    // And we don't have clear error descriptions for now, so it's w.e
    closeMenu();
    clearDependencies();
  });
  buttonsGroup.appendChild(createButton);
  //  - CREATE BUTTON -
  //  + CANCEL BUTTON +
  const cancelButton = document.createElement('div');
  cancelButton.classList.add('btn', 'btn-secondary');
  cancelButton.textContent = 'Отменить';
  cancelButton.addEventListener('click', event => {
    closeMenu();
    clearDependencies();
  });
  buttonsGroup.appendChild(cancelButton);
  //  - CANCEL BUTTON -
  menuContainer.appendChild(buttonsGroup);
  // - BUTTONS CONT -
  return menuContainer;
};


export const openWheelstackCreationMenu = () => {
  duplicateWheels = {};
  chosenWheels = [];
  const wheelstackMenu = createWheelstackCreationMenu();
  showMenu(wheelstackMenu);
  // + BATCH OPTIONS +
  batchTomSelect = assignTomSelect('selectBatch', TOM_SETTINGS.WHEELSTACK_CREATION_BATCHES);
  const batchWrapper = wheelstackMenu.querySelector('#batchData');
  const batchInput = batchWrapper.querySelector('.ts-control');
  batchInput.classList.add('check-batch');
  const batchControl = batchWrapper.querySelector('input');
  batchControl.classList.add('check-batch-input');
  startMaintainAvailableBatches();
  batchTomSelect.on('change', () => {
    // Updating available wheels on 
    const curVal = batchTomSelect.getValue();
    startMaintainAvailableWheels(curVal);
  })
  // - BATCH OPTIONS -
  // + WHEEL OPTION +
  for (let wheelIndex = WHEELSTACK_WHEELS_LIMIT - 1; wheelIndex >= 0; wheelIndex -= 1) {
    const wheelTomSelector = assignTomSelect(`${CSS.escape(`selectWheels|${wheelIndex}`)}`, TOM_SETTINGS.WHEELSTACK_CREATION_WHEELS);
    wheelTomSelector.disable();
    const currentWrapper = wheelstackMenu.querySelector(`#wheelSelectorWrapper${wheelIndex}`);
    const currentDupInput = currentWrapper.querySelector('.ts-control');
    currentDupInput.classList.add('check');
    const inputControl = currentWrapper.querySelector('input');
    inputControl.classList.add('check-input');
    // DUPLICATE MARK
    const duplicateMarkClass = 'delete-blink-slow';
    wheelTomSelectors.push(wheelTomSelector);
    wheelTomSelector.on('change', () => {
      const wheelId = wheelTomSelector.input.id.split('|')[1]
      const curVal = wheelTomSelector.getValue();
      const prevVal = chosenWheels[wheelId];
      chosenWheels[wheelId] = curVal;
      const currentWrapper = wheelstackMenu.querySelector(`#wheelSelectorWrapper${wheelIndex}`);
      const currentDupInput = currentWrapper.querySelector('.ts-control');
      if (prevVal in duplicateWheels) {
        duplicateWheels[prevVal]['counter'] -= 1;
        if (1 >= duplicateWheels[prevVal]['counter']) {
          duplicateWheels[prevVal]['markedDup'].forEach(element => {
            element.classList.remove(duplicateMarkClass);
          });
        }
      };
      if (!curVal) {
        currentDupInput.classList.remove(duplicateMarkClass);
        return;
      }
      if (curVal in duplicateWheels) {
        duplicateWheels[curVal]['counter'] += 1;
      } else {
        duplicateWheels[curVal] = {
          'counter': 1,
          'markedDup': new Set(),
        };
      };
      if (1 < duplicateWheels[curVal]['counter']) {
        currentDupInput.classList.add(duplicateMarkClass);
        duplicateWheels[curVal]['markedDup'].add(currentDupInput);
      } else {
        duplicateWheels[curVal]['markedDup'].forEach(element => {
          element.classList.remove(duplicateMarkClass);
        });
      };
    });
  }
  // - WHEEL OPTION -
};
// - MENU REL -