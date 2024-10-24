import flashMessage from "../../utility/flashMessage/flashMessage.js";
import {
  keepAuthCookieFresh,
  clearRedirect,
  validateRoleCookie,
  getCookie,
} from "../../utility/roleCookies.js";
import {
  BASIC_INFO_MESSAGE_PRESET,
  ORDERS_TABLE_BREAKSIZE,
  NAV_BUTTONS,
  AUTH_COOKIE_NAME,
  loginPage,
  RESTRICTED_TO_THIS_ROLE,
  USER_ROLE_COOKIE_NAME,
  HISTORY_PAGE_ROLES,
  USER_ROLE_COOKIE_UPDATE_INTERVAL,
  BACK_URL,
  GRID_PLACEMENT_INTERVAL,
  PLACEMENT_TYPES,
  BASIC_INFO_MESSAGE_WARNING,
  UPDATE_BATCHES_DATA_INTERVAL,
  UPDATE_DATA_BANKS_INTERVAL,
  UPDATE_ORDERS_DATA_INTERVAL,
  BASIC_ATTRIBUTES,
  BATCH_STATUS_CLASSES,
} from "../../uniConstants.js";
import NavigationButton from "../../utility/navButton/navButton.js";
import { getRequest } from "../../utility/basicRequests.js";
import { selectPlacementButtonAction} from "../../gridRel/placement/placementRel.js";
import Placement from "../../gridRel/placement/placement.js";
import ZoomAndDrag from "../../utility/zoomDrag.js";
import {
  combineObjectsData,
  combineSetsData,
  updateSetBank,
  updateObjBank,
} from "../../utility/dataManip.js";
import { createErrorElement, createLoadSpinner } from "../../utility/errorMessages.js";
import CellHoverCoordinate from "../../utility/cellHover/cellHoverCoordinate.js";
import { createOrderRecord } from "../../gridRel/ordersTable/orderRecords.js";
import { createBatchMenu } from "../../gridRel/batchMenu/batchMenu.js";
import AttributeMark from "../../utility/mark/mark.js";
import FocusMark from "../../utility/focusElement/focusElement.js";
import { createProRejOrderBulk } from "../../utility/ordersCreation.js";
import { createOrderMenu } from "../../gridRel/orderMenu/orderMenu.js";
import { createWheelstackMenu } from "../../gridRel/wheelstackMenu/wheelstackMenu.js";


// + BAD PRESET +
// ROLE COOKIE
keepAuthCookieFresh(AUTH_COOKIE_NAME);
const redirectUrl = `${loginPage}?message=${RESTRICTED_TO_THIS_ROLE}`
const userRole = await getCookie(USER_ROLE_COOKIE_NAME);
if (!userRole || !(userRole in HISTORY_PAGE_ROLES)) {
    clearRedirect(BASIC_COOKIES, redirectUrl);
}
setInterval( async () => {
    validateRoleCookie(USER_ROLE_COOKIE_NAME, HISTORY_PAGE_ROLES, redirectUrl);    
}, USER_ROLE_COOKIE_UPDATE_INTERVAL);
// ---
// NAV BUTTON
const navPosition = {
    top: 'auto',
    left: 'auto',
    right: '3%',
    bottom: '25px',
}
const roleNavButtons = NAV_BUTTONS[userRole];
const clearCookies = [USER_ROLE_COOKIE_NAME, AUTH_COOKIE_NAME];
const navButton = new NavigationButton(
    navPosition, roleNavButtons, clearCookies,
)
// ---
//  + HOVER COORD +
const hoverCoord = new CellHoverCoordinate('placement-cell');
//  - HOVER COORD -
// - BAD PRESET -


// + DATA BANKS +
// GRID
var gridWheels = {};
var gridWheelstacks = {};
var gridBatches = {};
var gridOrders = {};
// --- 
// PLATFORM
var platformWheels = {};
var platformWheelstacks = {};
var platformBatches = {};
var platformOrders = {};
// ---
// COMBINED
var _allWheels = {};
var _allWheelstacks = {};
var _allBatches = {};
var _allOrders = {};
// ---
// NOT YET PRESENT
var _notYetPresent = {
  'wheelstacks': {},
  'batches': {},
}

const pruneObject = (objectToPrune = {}, objectsToCheck = []) => {
  Object.keys(objectToPrune).forEach( element => {
    for (let toCheck of objectsToCheck) {
      if (element in toCheck) {
        delete objectToPrune[element];
      }
    }
  })
}
// TODO: Rebuild without interval?
setInterval( () => {
  pruneObject(_notYetPresent['batches'], [platformBatches, gridBatches]);
  pruneObject(_notYetPresent['wheelstacks'], [platformWheelstacks, gridWheelstacks]);
}, 1000);
// ---


// + MAINTAIN ORDERS DATA +
const maintainOrdersData = () => {
  Object.keys(_allOrders).forEach( async (orderId) => {
    if (_allOrders[orderId] === false) {
      const dataURL = `${BACK_URL.GET_ORDER_BY_ID}/${orderId}?active_orders=true&completed_orders=false&canceled_orders=false`;
      const dataResp = await getRequest(dataURL, true, true);
      const orderData = await dataResp.json();
      _allOrders[orderId] = orderData;
    };
  });
}
setInterval( () => {
  maintainOrdersData();
}, UPDATE_ORDERS_DATA_INTERVAL);
// - MAINTAIN ORDERS DATA -

// + MAINTAIN BATCHES DATA +
const maintainBatchesData = async (initial = false) => {
  Object.keys(_allBatches).forEach(async batchId => {
    const dataURL = `${BACK_URL.GET_BATCH_DATA}/${batchId}`;    
    const dataResp = await getRequest(dataURL, true, true);
    const batchData = await dataResp.json();
    if (batchId in _allBatches) {
      const oldDate = _allBatches[batchId]['laboratoryTestDate'];
      // if ((oldDate && oldDate < batchData['laboratoryTestDate']) || initial) {
      //   updateBatchElements(batchData);
      // }
      // TODO: redo creation of cells and everything that depends, because it's too much loops.
      updateBatchElements(batchData);
    }
    _allBatches[batchId] = batchData;
  })
}

setInterval( () => {
  maintainBatchesData();
}, UPDATE_BATCHES_DATA_INTERVAL);

// + MAINTAIN BATCH ELEMENTS +
const updateBatchElements = (batchData) => {
  const allElements = document.querySelectorAll(`[data-batch-number="${batchData['batchNumber']}"]`);
  allElements.forEach( element => {
    if ('TR' === element.tagName) {
      element = element.querySelector('#batchNumber');
    }
    let newClass = BATCH_STATUS_CLASSES.NOT_TESTED;
    if (batchData['laboratoryPassed']) {
      newClass = BATCH_STATUS_CLASSES.PASSED;
    } else if (!batchData['laboratoryPassed'] && batchData['laboratoryTestDate']) {
      newClass = BATCH_STATUS_CLASSES.NOT_PASSED;
    } else {
      newClass = BATCH_STATUS_CLASSES.NOT_TESTED;
    }
    for (let [key, value] of Object.entries(BATCH_STATUS_CLASSES)) {
      if (value !== newClass) {
        element.classList.remove(value);
      } else {
        element.classList.add(value);
      }
    }
  })
}
// - MAINTAIN BATCH ELEMENTS -

// - MAINTAIN BATCHES DATA -

// CRINGE UPDATE
setInterval(() => {
  combineObjectsData(_allWheels, [platformWheels, gridWheels]);
  combineObjectsData(_allWheelstacks, [platformWheelstacks, gridWheelstacks], [_notYetPresent, 'wheelstacks'], true);
  // TODO: BATCHES can change state == always loopin and updating their state 24/7 every 200ms or smth.
  //   Doubt there's going to be more than 20 batches, so 20 requests within 200ms is 100% fine.
  combineObjectsData(_allBatches, [platformBatches, gridBatches], [_notYetPresent, 'batches']);
  // TODO: add indicator of getting a new data records.
  //  Or better store all new record references and create a new Order records for each of them (in case of orders)
  combineObjectsData(_allOrders, [platformOrders, gridOrders]);
}, UPDATE_DATA_BANKS_INTERVAL);
// ---


const updateBanksFromPlacement = async (placementData, placementType) => {
  const newBatches = {};
  const newOrders = {};
  const allWheelstacks = placementData['wheelstacksData'];
  const allWheels = placementData['wheelsData'];
  for (let row in placementData['rows']) {
    for (let col in placementData['rows'][row]['columns']) {
      const cellData = placementData['rows'][row]['columns'][col];
      const wheelstackId = cellData['wheelStack'];
      if (wheelstackId) {
        const wheelstackData = allWheelstacks[wheelstackId];
        newBatches[wheelstackData['batchNumber']] = false;
      }
      const orderId = cellData['blockedBy'];
      if (orderId) {
        newOrders[orderId] = false;
      }
    }
  }
  if (PLACEMENT_TYPES.GRID === placementType) {
    updateObjBank(gridBatches, newBatches);
    updateObjBank(gridOrders, newOrders);
    gridWheelstacks = allWheelstacks ?? {};
    gridWheels = allWheels ?? {};
  } else if (PLACEMENT_TYPES.BASE_PLATFORM === placementType) {
    updateObjBank(platformBatches, newBatches);
    updateObjBank(platformOrders, newOrders);
    platformWheelstacks = allWheelstacks ?? {};
    platformWheels = allWheels ?? {};
  }
}
// - DATA BANKS -

const hideClass = 'hidden';

const platformsContainer = document.getElementById('platformsContainer');
const ordersContainer = document.getElementById('ordersTableContainer');
const ordersTableBody = ordersContainer.querySelector('#ordersTableBody');

const topContainer = document.getElementById('topContainer');
const botContainer = document.getElementById('botContainer');

const platformViewBut = document.getElementById('platformVis');
const ordersViewBut = document.getElementById('ordersVis');
const gridFullBut = document.getElementById('gridFull');

// + ORDERS ADJUSTMENT +
// window.addEventListener('resize', event => {
//   adjustOrderColumns();
// })

const adjustOrderColumns = () => {
  const curWidth = ordersContainer.getBoundingClientRect().width;
  const ordersTable = ordersContainer.querySelector('#ordersTable');
  if (ORDERS_TABLE_BREAKSIZE > curWidth) {
    // BATCH + ID 
    // const cellsToHide = ordersTable.querySelectorAll(
    //   'tr td:nth-child(1), tr td:nth-child(2), th:nth-child(1), th:nth-child(2)'
    // );

    // TIME
    const cellsToHide = ordersTable.querySelectorAll(
      'tr td:nth-child(5), th:nth-child(5)'
    );
    cellsToHide.forEach( cell => {
      cell.classList.add('orders-table-hidden');
    });
  } else {
    const cellsToShow = ordersTable.querySelectorAll('.orders-table-hidden');
    cellsToShow.forEach( cell => {
      cell.classList.remove('orders-table-hidden');
    });
  }
}
// - ORDERS ADJUSTMENT -

// + VIEW CHANGE +
const exitFullScreenImg = 'static/images/exit-fullscreen.png';
const setFullScreenImg = 'static/images/expand.png';
const platformVisible = 'static/images/platformVisible.png';
const platformNotVisible = 'static/images/platformNotVisible.png';
const ordersTableVisible = 'static/images/ordersVisible.png';
const ordersTableNotVisible = 'static/images/ordersNotVisible.png';
const leftArrow = 'static/images/left-arrow.png';
const rightArrow = 'static/images/right-arrow.png';


const changeButImg = (button, newSrc) => {
  const butImage = button.querySelector('img');
  butImage.src = newSrc;
}

// + VIEW BUTTONS CONTAINER +
const viewSliderChange = (expandClass, sliderButton, container, expandedImage, standardImage) => {
  if (sliderButton.classList.contains(expandClass)) {
    container.style.width = '0px';
    sliderButton.classList.remove(expandClass);
    changeButImg(sliderButton, standardImage);
  } else {
    sliderButton.classList.add(expandClass);
    container.style.width = `${container.scrollWidth}px`;
    changeButImg(sliderButton, expandedImage);
  }
}

const viewContainer = document.getElementById('viewButtonsContainer');
const viewButtonsContainer = document.getElementById('viewButtons');
const viewButtonsSlider = document.getElementById('viewSlider');
viewButtonsSlider.addEventListener('click', event => {
  viewSliderChange(
    'expanded', viewButtonsSlider, viewButtonsContainer, leftArrow, rightArrow
  )
})
// - VIEW BUTTONS CONTAINER -

const setGridFullscreen = (elements) => {
  let fullScreen = true;
  for (let element of elements) {
    if (element.classList.contains(hideClass)) {
      element.classList.remove(hideClass);
      fullScreen = false;
    } else {
      element.classList.add(hideClass);
    }
  }
  // adjustOrderColumns()
  if (fullScreen) {
    changeButImg(gridFullBut, exitFullScreenImg);
  } else {
    changeButImg(gridFullBut, setFullScreenImg);
  }
}

const triggerGridFullscreen = (elements) => {
  let hide = true;
  for (let element of elements) {
    if (!(element.classList.contains(hideClass))) {
      hide = false;
    };
  }
  if (hide) {
    topContainer.classList.add(hideClass);
    changeButImg(gridFullBut, exitFullScreenImg);
  } else {
    topContainer.classList.remove(hideClass);
    changeButImg(gridFullBut, setFullScreenImg);
  }
  // adjustOrderColumns();
}

// + PLATFORM VIEW CHANGE +

const alterPlatformView = (showNotif) => {
  const showMessage = BASIC_INFO_MESSAGE_PRESET;
  if (platformsContainer.classList.contains(hideClass)) {
    platformsContainer.classList.remove(hideClass);
    changeButImg(platformViewBut, platformNotVisible);
    showMessage.message = '<b>Восстановлен вид платформы</b>';
  } else {
    platformsContainer.classList.add(hideClass);
    changeButImg(platformViewBut, platformVisible);
    showMessage.message ='<b>Убран вид платформы</b>';
  }
  if (showNotif) {
    flashMessage.show(showMessage);
  }
  triggerGridFullscreen(
    [platformsContainer, ordersContainer]
  );
}

const forcePlatformClosedView = () => {
  platformsContainer.classList.add(hideClass);
  changeButImg(platformViewBut, platformVisible);
  triggerGridFullscreen(
    [platformsContainer, ordersContainer]
  );
}


platformViewBut.addEventListener('click', (event) => {
  alterPlatformView(true);
})

// - PLATFORM VIEW CHANGE -


ordersViewBut.addEventListener('click', event => {
  const showMessage = BASIC_INFO_MESSAGE_PRESET;
  if (ordersContainer.classList.contains(hideClass)) {
    showMessage.message = '<b>Восстановлен вид заказов</b>';
    changeButImg(ordersViewBut, ordersTableNotVisible);
    ordersContainer.classList.remove(hideClass);
    flashMessage.show(showMessage);
  } else {
    showMessage.message = '<b>Убран вид заказов</b>';
    changeButImg(ordersViewBut, ordersTableVisible);
    ordersContainer.classList.add(hideClass);
    flashMessage.show(showMessage);
  }
  triggerGridFullscreen(
    [platformsContainer, ordersContainer]
  );
})

gridFullBut.addEventListener('click', event => {
  if (ordersContainer.classList.contains(hideClass)
     && platformsContainer.classList.contains(hideClass)) {
      return;
  }
  setGridFullscreen([topContainer]);
})

// - VIEW CHANGE -

// + PLACEMENT UPDATE +
const placementChanged = async (placement) => {
  let placementType = placement.placementType;
  let checkURL = '';
  if (PLACEMENT_TYPES.GRID === placementType) {
    checkURL = `${BACK_URL.GET_GRID_LAST_CHANGE}/${placement.placementId}`;
  } else if (PLACEMENT_TYPES.BASE_PLATFORM === placementType) {
    checkURL = `${BACK_URL.GET_PLATFORM_LAST_CHANGE}/${placement.placementId}`;
  }
  const checkResp = await getRequest(checkURL, true, true);
  const checkData = await checkResp.json();
  if (placement.placementData['lastChange'] < checkData['lastChange']) {
    return true;
  }
  return false;
}


const updatePlacement = async (placement, newId) => {
  let dataURL = '';
  let placementType = placement.placementType;
  // + PING FOR CHANGES +
  if (placement.placementId === newId) {
    if (!(await placementChanged(placement))) {
      return;
    };
  };
  // - PING FOR CHANGES - 
  if (PLACEMENT_TYPES.GRID === placementType) {
    dataURL = `${BACK_URL.GET_GRID_STATE}/${newId}?includeWheelstacks=true&includeWheels=true`;
  } else if (PLACEMENT_TYPES.BASE_PLATFORM === placementType) {
    dataURL = `${BACK_URL.GET_PLATFORM_STATE}/${newId}?includeWheelstacks=true&includeWheels=true`;
  }
  const startTime = performance.now();
  const dataResp = await getRequest(dataURL, false, true);
  // TODO: Error handling
  const newData = await dataResp.json()
  const endTime = performance.now()
  updateBanksFromPlacement(newData, placementType);
  placement.updatePlacement(newData);
  if (platformSelectActive && PLACEMENT_TYPES.GRID === placement.placementType) {
    const newPlatformsData = newData['assignedPlatforms'] ?? [];
    if (0 === newPlatformsData.length) {
      clearAvailPlatforms(
        platformsContainer, platformSelectRelated,
        platformSelector, true, true
      )
    } else {
      for (let record of newPlatformsData) {
        const platformName = record['platformName'];
        const platformId = record['platformId'];
        if (!(platformId in availPlatforms)) {      
          updateAvailPlatforms(
            newPlatformsData, platformsContainer,
            platformSelectRelated, platformSelector 
          );
          break;
        }
      }
    }
  }
}
// - PLACEMENT UPDATE -

// + GRID SELECTION +
const createOption = async (optionValue, optionName, selected = false) => {
  const newOption = document.createElement('option');
  newOption.value = optionValue
  newOption.textContent = optionName.charAt(0).toUpperCase() + optionName.slice(1);
  if (selected) {
      newOption.selected = true;
  }
  return newOption;
}

const updateAvailGrids = async (container, selectRelated, selector) => {
  const loadSpinner = createLoadSpinner('gridsSpinner');
  container.childNodes.forEach( child => {
    if (1 === child.nodeType) {
        child.classList.add('hidden');
    }
  });
  container.appendChild(loadSpinner);
  const gridsURL = `${BACK_URL.GET_GRIDS}?include_data=false`;
  const gridsReq = await getRequest(gridsURL, false, true);
  loadSpinner.remove();
  if (!gridsReq.ok) {
    const errorEl = createErrorElement(
      `Ошибка при загрузке: ${gridsReq.status}`, updateAvailGrids,
      container, selectRelated, selector
    );
    container.appendChild(errorEl);
    return;
  }
  const newGridsData = await gridsReq.json();
  availGrids = {};
  for (let gridData of newGridsData) {
    availGrids[gridData['_id']] = gridData;
  }
  selector.innerHTML = '';
  Object.keys(availGrids).forEach( async (gridId) => {
    const gridData = availGrids[gridId];
    const optionValue = {
      '_id': gridData['_id'],
      'presetId': gridData['preset'],
    }
    const newOption = await createOption(JSON.stringify(optionValue), gridData['name']);
    selector.appendChild(newOption);
  })
  selectRelated.forEach( element => {
    element.classList.remove('hidden');
  })
}

const gridsSelectInputGroup = botContainer.querySelector('#gridSelectInputGroup');
const gridsSelector = botContainer.querySelector('#gridsSelector');
var availGrids = {};
var availPlatforms = {};

// + GRID BUILD +
const gridsViewButton = botContainer.querySelector('#switchViewGrid');
const gridsContainer = botContainer.querySelector('#gridsContainer');
let gridSelectActive = true;

gridsViewButton.addEventListener('click', async event => {
  topContainer.classList.add('hidden');
  if (gridContainer.classList.contains('hidden')) {
    gridsContainer.classList.add('hidden');
    gridActiveElements.forEach(element => {
      element.classList.remove('hidden');
    })
    gridSelectActive = false;
  } else {
    gridSelectActive = true;
    await updateAvailGrids(
      botContainer, new Set([gridsContainer, gridsViewButton, gridsSelectInputGroup]), gridsSelector
    )
  }
})

await updateAvailGrids(
  gridsContainer, new Set([gridsContainer, gridsSelectInputGroup]), gridsSelector
);

const gridContainer = botContainer.querySelector('#gridContainer');
var gridPlacementUpdateInterval = null;
const gridPlacement = new Placement(PLACEMENT_TYPES.GRID);
const zoomer = new ZoomAndDrag({
  'viewport': gridContainer,
  'grid': gridPlacement.element,
  'maxScale': 0.7,
});
var gridView = false;
gridContainer.appendChild(gridPlacement.element);
const gridActiveElements = new Set([
  topContainer, gridContainer, viewContainer
])
const gridInactiveElements = new Set([gridsContainer]);


// + REMOVE SELECTORS +
const selectGridButton = botContainer.querySelector('#selectGrid');
selectGridButton.addEventListener('click', async event => {
  // TODO: Errors handle, what if we're not getting correct preset data?
  const placementId = await selectPlacementButtonAction(
    gridsSelector, gridPlacement, gridActiveElements, gridInactiveElements,
    gridView, gridsViewButton, true
  )
  // TODO: Maybe change it.
  const gridCells = gridContainer.querySelectorAll('.placement-cell, .grid-cell');
  assignWheelstackMenus(gridCells, gridPlacement, gridPlacement);
  // ---
  gridSelectActive = false;
  setPlatformToSelect();
  if (gridPlacementUpdateInterval) {
    clearInterval(gridPlacementUpdateInterval);
    gridPlacementUpdateInterval = null;
  }
  gridPlacementUpdateInterval = setInterval( async () => {
    if (gridSelectActive) {
      return;
    }
    await updatePlacement(gridPlacement, placementId);
  }, GRID_PLACEMENT_INTERVAL)
})
// + REMOVE SELECTORS +
// - GRID BUILD -
// - GRID SELECTION -

// + PLATFORM SELECTION +
var platformView = false;
var platformSelectActive = true;
var platformPlacementUpdateInterval = null;
const platformPlacement = new Placement(PLACEMENT_TYPES.BASE_PLATFORM);
platformsContainer.appendChild(platformPlacement.element);
const platformViewButton = platformsContainer.querySelector('#switchViewPlatform'); 
const platformSelectInputGroup = platformsContainer.querySelector('#platformSelectInputGroup');
const platformSelector = platformSelectInputGroup.querySelector('#platformsSelector');
const selectPlatformButton = platformSelectInputGroup.querySelector('#selectPlatform');
const selectPlatformButtonContainer = platformSelectInputGroup.querySelector('#platformSelectButtons');
var platformSelectRelated = new Set(
  [platformSelectInputGroup]
)

const clearAvailPlatforms = async (container, showElements, selector, closeView = false, showNotif = false) => {
  if ('emptyList' === selector.value) {
    return;
  }
  container.childNodes.forEach( child => {
    if (1 === child.nodeType) {
      child.classList.add('hidden');
    }
  })
  selector.innerHTML = '';
  availPlatforms = {};
  const emptyValue = 'emptyList';
  const emptyName = 'Нет привязанных платформ';
  const emptyOption = await createOption(emptyValue, emptyName);
  selector.appendChild(emptyOption);
  if (closeView) {
    forcePlatformClosedView();
  }
  if (showNotif) {
    const infomessage = BASIC_INFO_MESSAGE_WARNING;
    infomessage.message = 'Выбранный приямок не имеет привязанных платформ';
    flashMessage.show(infomessage);
  }
  // TODO: Rebuild for set elements, we need to hide or show.
  //  This is temporary :)
  showElements.forEach( element => {
    element.classList.remove('hidden');
  })
  selectPlatformButtonContainer.classList.add('hidden');
}

const updateAvailPlatforms = async (
  newPlatformsData, container,
  selectRelated, selector
) => {
  availPlatforms = {};
  for (let platformData of newPlatformsData) {
    availPlatforms[platformData['platformId']] = platformData;
  }
  
  container.childNodes.forEach( child => {
    if (1 === child.nodeType) {
      child.classList.add('hidden');
    }
  });
  const loadSpinner = createLoadSpinner('platformsSpinner');
  container.appendChild(loadSpinner);
  selector.innerHTML = '';
  const availPlatformIds = Object.keys(availPlatforms);
  if (0 === availPlatformIds.length) {
    clearAvailPlatforms(selector, false, true)
    forcePlatformClosedView();
  } else {
    availPlatformIds.forEach( async (platformId) => {
      const platformName = availPlatforms[platformId]['platformName'];
      const optionValue = {
        'name': platformName,
      };
      const newOption = await createOption(
        JSON.stringify(optionValue), platformName
      );
      selector.appendChild(newOption);
    });
  }
  selectRelated.forEach( element => {
    element.classList.remove('hidden');
  })
  loadSpinner.remove();
  selectPlatformButtonContainer.classList.remove('hidden');
}

const platformActiveElements = new Set(
  [platformPlacement.element, platformViewButton]
);

const platformInActiveElements = new Set(
  [platformSelectInputGroup]
);

selectPlatformButton.addEventListener('click', async (event) => {
  const placementId = await selectPlacementButtonAction(
    platformSelector, platformPlacement, platformActiveElements, platformInActiveElements,
    platformView, platformViewButton, false
  )
  const platformCells = platformsContainer.querySelectorAll('.placement-cell, .baseplatform-cell');
  assignWheelstackMenus(platformCells, gridPlacement, platformPlacement);
  platformSelectActive = false;
  if (platformPlacementUpdateInterval) {
    clearInterval(platformPlacementUpdateInterval);
    platformPlacementUpdateInterval = null;
  }
  platformPlacementUpdateInterval = setInterval( async () => {
    if (platformSelectActive) {
      return;
    }
    await updatePlacement(platformPlacement, placementId);
  }, GRID_PLACEMENT_INTERVAL);
})


const setPlatformToSelect = () => {
  platformSelectInputGroup.classList.remove('hidden');
  platformPlacement.element.classList.add('hidden');
  platformViewButton.classList.add('hidden');
  platformSelectActive = true;
}


const platformViewSwitch = (hideSwitch = false) => {
  platformSelectActive = !platformSelectActive;
  if (platformSelectActive) {
    platformSelectInputGroup.classList.remove('hidden');
    platformPlacement.element.classList.add('hidden');
  } else {
    platformSelectInputGroup.classList.add('hidden');
    platformPlacement.element.classList.remove('hidden');
  }
  if (hideSwitch) {
    platformViewButton.classList.add('hidden');
  }
}


platformViewButton.addEventListener('click', (event) => {
  platformViewSwitch(false);
})
// - PLATFORM SELECTION -

// + ORDERS TABLE +
var createdOrderRecords = {};
var orderRecordsUpdating = false;
// ADJUST ON OPENING
// adjustOrderColumns();
// ---
const pruneOutdatedOrders = () => {
  if (gridSelectActive) {
    return;
  }
  Object.keys(createdOrderRecords).forEach( orderId => {
    if (orderId in _allOrders) {
      return;
    }
    createdOrderRecords[orderId].remove();
    delete createdOrderRecords[orderId];
  })
}

const pruneOrdersInterval = setInterval( () => {
  pruneOutdatedOrders();
}, 100)

const maintainOrderRecords = async () => {
  // If another update is in progress or gridSelectActive is true, return early
  if (orderRecordsUpdating || gridSelectActive) {
    return;
  }
  
  // Set orderRecordsUpdating to true to indicate the process is running
  orderRecordsUpdating = true;

  const promises = [];  // Array to hold all createOrderRecord promises

  for (let [orderId, orderData] of Object.entries(_allOrders)) {
    if (orderId in createdOrderRecords || orderData === false) {
      continue;
    }
    // console.log('currentGridId', gridPlacement.placementId);
    // console.log(orderData);
    // console.log('---------------------');
    // if ((orderData['destination']['placementId']) !== gridPlacement.placementId) {
    //   return;
    // }

    let sourceWheelstackData = null;
    const sourceWheelstackId = orderData['affectedWheelStacks']['source'];
    if (sourceWheelstackId) {
      sourceWheelstackData = _allWheelstacks[sourceWheelstackId];
    }

    // TODO: when we add Merge, we will need to add `destWheelstacks` coverage.
    let destWheelstackData = null;
    const destWheelstackId = orderData['affectedWheelStacks']['destination'];
    if (destWheelstackId) {
      destWheelstackData = _allWheelstacks[destWheelstackId];
    }

    // TODO: ADD something to cull this requests.
    //  Because this elements not yet present in a GRID, and platform where they're not Chosen.
    //  So, we forced to get this data to correctly show ORDER_DATA, but we can save it somewhere for reuse and clear later.
    //  Fine for, now because we need to use it combined anyway.
    // Order to move from platform, so wheelstack is not yet in a bank, because this platform not actively chosen.
    let sourceNotPresent = false;
    if (!sourceWheelstackData && sourceWheelstackId) {
      sourceNotPresent = true;
      sourceWheelstackData = _notYetPresent['wheelstacks'][sourceWheelstackId];
      if (!sourceWheelstackData) {
        const sourceWheelstackDataURL = `${BACK_URL.GET_WHEELSTACK_RECORD}/${sourceWheelstackId}`;
        const sourceWheelstackDataResp = await getRequest(sourceWheelstackDataURL, true, true);
        sourceWheelstackData = await sourceWheelstackDataResp.json();
        _notYetPresent['wheelstacks'][sourceWheelstackId] = sourceWheelstackData;
        _allWheelstacks[sourceWheelstackId] = sourceWheelstackData;
        // console.log('wheelstackDownloaded');
      }
    }
    if (!sourceWheelstackData) {
      continue;
    }
    const batchNumber = sourceWheelstackData['batchNumber'];
    let batchData = _allBatches[batchNumber];
    if (!batchData && sourceNotPresent) {
      batchData = _notYetPresent['batches'][batchNumber];
      if (!batchData) {
        const batchDataUrl = `${BACK_URL.GET_BATCH_DATA}/${batchNumber}`; 
        const batchResp = await getRequest(batchDataUrl, true, true);
        batchData = await batchResp.json();
        _notYetPresent['batches'][batchData['batchNumber']] = batchData;
        _allBatches[batchData['batchNumber']] = batchData;
        // console.log('batchDownloaded');
      }
    }
    if (!batchData) {
      continue;
    }

    const curWidth = ordersContainer.getBoundingClientRect().width;
    // const hideColumns = ORDERS_TABLE_BREAKSIZE > curWidth;

    // Create order element asynchronously and store the promise
    const placementBanks = {'grids': availGrids, 'platforms': availPlatforms};
    const orderPromise = createOrderRecord(orderData, batchData, placementBanks)
      .then(orderElement => {
        assignBatchMenu(orderElement);
        const batchTd = orderElement.querySelector('#batchNumber')
        assignOrderMenu(orderElement, orderData, [batchTd]);
        orderElementAssignFocusEls(orderElement);
        ordersTableBody.appendChild(orderElement);
        createdOrderRecords[orderId] = orderElement;
      })
      .catch(error => {
        console.error(`Error creating order for ${orderId}:`, error);
      });

    promises.push(orderPromise);  // Add each promise to the array
  }

  // Wait for all createOrderRecord promises to resolve
  await Promise.all(promises).catch(error => {
    console.error('Error maintaining order records:', error);
  });

  // Once all operations are done, set orderRecordsUpdating to false
  orderRecordsUpdating = false;
};


let orderRecordsUpdateInterval = setInterval( () => {
  maintainOrderRecords();
}, 100);
// - ORDERS TABLE -


// + FOCUS RELATED +
// + BATCH MARKER +
const batchMarker = new AttributeMark('batch-mark');
const batchMarkTrigger = (targetValue, markTimeout = 90) => {
  if (targetValue && '' !== targetValue.trim()) {
    batchMarker.clearMarking();
    batchMarker.setRules(BASIC_ATTRIBUTES.BATCH_NUMBER, targetValue);
    batchMarker.markTargets(true, markTimeout);
  }
}
// - BATCH MARKER -
var focusSequence = false;
var gridFocusMark = new FocusMark('focus-target'); // default class
var secondGridFocusMark = new FocusMark('second-focus-target');
var platformFocusMark = new FocusMark('focus-target');  // default class


// + MOVE TO DIFF +
const orderElementAssignFocusEls= (orderElement) => {
  const orderId = orderElement.id;
  const orderData = _allOrders[orderId];
  if (!orderData) {
    orderElement.remove();
    console.error('Canceled creation of `orderRow` no data in bank `_allOrders`');
    return;
  }
  
  let sourceOrderFocusMessage = `Сфокусирован <b>ИСХОДНЫЙ</b> элемент участвующий в заказе <b>${orderData['_id']}</b>`;
  let sequenceMessage = `Сфокусирован элемент участвующий в заказе <b>${orderData['_id']}</b>`;
  let destOrderFocusMessage = `Сфокусирован <b>КОНЕЧНЫЙ</b> элемент участвующий в заказе <b>${orderData['_id']}</b>`;
  let sourceTargetElement = null;
  let sourceTargetElementId = null;
  let destTargetElement = null;
  let destTargetElementId = null;
  let sequenceTargets = [];
  
  // TODO: WTF is this? Refactor this InduStuff/
  const sourceOrderElement = orderElement.querySelector('#source');
  if (sourceOrderElement) {
    const sourcePlacementId = orderData['source']['placementId'];
    const sourcePlacementType = orderData['source']['placementType'];
    const sourceRow = orderData['source']['rowPlacement'];
    const sourceCol = orderData['source']['columnPlacement'];
    if ('extra' !== sourceRow) {
      if (PLACEMENT_TYPES.GRID === sourcePlacementType) {
        sourceTargetElementId = `${sourceRow}|${sourceCol}`; 
        assignGridSequenceFocus(
          sourceOrderElement,
          [{
            'elementId': sourceTargetElementId,
            'container': gridContainer,
            'onlyHighlight': false,
            'placementId': sourcePlacementId,
            'errorMessage': `Не активен вид выбранного элемента: <b>${availGrids[sourcePlacementId]['name']}</b>`,
          }],
          [gridFocusMark],
          sourceOrderFocusMessage,
          0,
          0,
        );
        sequenceTargets.push(
          {
            'elementId': sourceTargetElementId,
            'container': gridContainer,
            'onlyHighlight': false,
            'placementId': sourcePlacementId,
            'errorMessage': `Не активен вид выбранного элемента: <b>${availGrids[sourcePlacementId]['name']}</b>`,
          }
        );
      } else if (PLACEMENT_TYPES.BASE_PLATFORM === sourcePlacementType) {
        sourceTargetElementId = `${sourceRow}|${sourceCol}`;
        // assignFocus(
        //   sourceOrderElement, sourceTargetElementId, platformsContainer, platformFocusMark, sourceOrderFocusMessage
        // );
        assignGridSequenceFocus(
          sourceOrderElement,
          [{
            'elementId': sourceTargetElementId,
            'container': platformsContainer,
            'onlyHighlight': true,
            'placementId': sourcePlacementId,
            'errorMessage': `Не активен вид выбранного элемента: <b>${availPlatforms[sourcePlacementId]['platformName']}</b>`,
          }],
          [platformFocusMark],
          sourceOrderFocusMessage,
          0,
          0,
        )
        sequenceTargets.push(
          {
            'elementId': sourceTargetElementId,
            'container': platformsContainer,
            'onlyHighlight': true,
            'placementId': sourcePlacementId,
            'errorMessage': `Не активен вид выбранного элемента: <b>${availPlatforms[sourcePlacementId]['platformName']}</b>`,
          }
        );
      }
    }
  }
  
  const destOrderElement = orderElement.querySelector('#destination');
  if (destOrderElement) {
    const destinationPlacementId = orderData['destination']['placementId'];
    const destinationPlacementType = orderData['destination']['placementType'];
    const destinationRow = orderData['destination']['rowPlacement'];
    const destinationCol = orderData['destination']['columnPlacement'];
    if ('extra' !== destinationRow) {
      if (PLACEMENT_TYPES.GRID === destinationPlacementType) {
        destTargetElementId = `${destinationRow}|${destinationCol}`;
        assignGridSequenceFocus(
          destOrderElement,
          [{
            'elementId': destTargetElementId,
            'container': gridContainer,
            'onlyHighlight': false,
            'placementId': destinationPlacementId,
            'errorMessage': `Не активен вид выбранного элемента: <b>${availGrids[destinationPlacementId]['name']}</b>`,
          }],
          [gridFocusMark, secondGridFocusMark],
          destOrderFocusMessage,
          0,
          0,
        );
        sequenceTargets.push(
          {
            'elementId': destTargetElementId,
            'container': gridContainer,
            'onlyHighlight': false,
            'placementId': destinationPlacementId,
            'errorMessage': `Не активен вид выбранного элемента: <b>${availGrids[destinationPlacementId]['name']}</b>`,
          }
        );
      }
    }
  }
  const orderTypeElement = orderElement.querySelector('#orderType');
  assignGridSequenceFocus(
    orderTypeElement,
    sequenceTargets,
    [gridFocusMark, secondGridFocusMark],
    sequenceMessage,
  );
}

const assignFocus = (element, target, targetContainer, focusClass, message, callTimeout = 0) => {
  element.addEventListener('click', event => {
    if (focusSequence) {
          flashMessage.show({
              'message': `Подождите отображения эпизода прошлого заказа`,
              'color': 'red',
              'duration': 800,
          })
          return;
      }
      const targetElement = targetContainer.querySelector(`#${CSS.escape(target)}`);
      if (!targetElement || targetElement.classList.contains('placement-cell-empty')) {
        return;
      }
      setTimeout( () => {
          focusClass.higlightElement(targetElement);
          flashMessage.show({
              'message': message,
              'color': '#013565',
              'duration': 1000,
          });
      }, callTimeout)
  })
}

const assignGridSequenceFocus = (element, targets, focusers, message, callTimeout = 1500, sequenceCooldown = 2500) => {
  // TODO: REBUILD THIS MONSTROSITY LATER. :)
  element.addEventListener('click', event => {
    if (focusSequence) {
      flashMessage.show({
        'message': `Подождите отображения эпизода прошлого заказа`,
        'color': 'red',
        'duration': 800,
      })
      return;
    }
    focusSequence = true;
    let highlightTime = 5000;
    for (let index = 0; index < targets.length; index += 1) {
      const targetData = targets[index];
      const targetElementId = targetData['elementId'];
      const targetContainer = targetData['container'];
      const onlyHighlight = targetData['onlyHighlight'];
      const errorMessage = targetData['errorMessage'];
      const targetElement = targetContainer.querySelector(`#${CSS.escape(targetElementId)}`);
      if (!targetElement) {
        flashMessage.show({
          'message': errorMessage,
          'color': 'red',
          'duration': 1500,
        });
        continue;
      }
      const targetPlacementId = targetData['placementId'];
      // +++ test
      const placementContainer = targetElement.parentElement.parentElement;
      // console.log(placementContainer.id);
      // console.log('targetContId', targetPlacementId);
      if (placementContainer.id !== targetPlacementId) {
        flashMessage.show({
          'message': errorMessage,
          'color': 'red',
          'duration': 1500,
        });
        continue;
      }
      // test ---
      setTimeout( () => {
        // targets.length - index == we need to end focusing whole sequence at the same time.
        // callTimeout * (targets.length - index) == time we need
        // console.log(sequenceCooldown + (targets.length - index) * callTimeout);
        if (1 !== targets.length) {
          highlightTime = sequenceCooldown + (targets.length - index) * callTimeout;
        }
        if (onlyHighlight) {
          focusers[index].higlightElement(targetElement, highlightTime);
        } else {
          // console.log(targetContainer);
          const newTranslationData = focusers[index].centerElementInContainer(
            targetContainer.childNodes[0], targetContainer, targetElement, highlightTime
          );
          zoomer.translation.x = newTranslationData['newX'];
          zoomer.translation.y = newTranslationData['newY'];
          zoomer.translation.scale = newTranslationData['newScale'];
        }
        // flashMessage.show({
        //   'message': `${message}`,
        //   'color': '#013565',
        //   'duration': 1000,
        // })
      }, callTimeout * index);
    }
    setTimeout( () => {
      focusSequence = false;
    }, (highlightTime + 200) * (targets.length - 1));
  })
}
// - MOVE TO DIFF -

// - FOCUS RELATED -


// + CONTEXT MENUS +
const assignMoveProRejButton = async (batchMenu, moveSelector, processing = true) => {
  const everyWhereToggle = batchMenu.querySelector('#selectFromEverywhere');
  const fromEverywhere = everyWhereToggle.checked;
  const idField = batchMenu.querySelector('#idField');
  const batchNumber = idField.getAttribute(BASIC_ATTRIBUTES.BATCH_NUMBER);
  const elementData = {
    'batchNumber': batchNumber,
    'placement': {
      'placementId': gridPlacement.placementId,
      'type': gridPlacement.placementType,
    },
  };
  await createProRejOrderBulk(
    elementData, moveSelector.value, processing,
    gridPlacement.placementId, fromEverywhere
  )
}

// + BATCH MENU +
export const assignBatchExpandableButtons = async (batchMenu) => {
  // + populateSelector +
  const moveSelector = batchMenu.querySelector('#batchMenuMoveSelector');
  for (let [elementName, elementData] of Object.entries(gridPlacement.placementExtraRows)) {
    if ('laboratory' === elementData['type']) {
      continue;
    }
    const newOption = await createOption(elementName, elementName);
    moveSelector.appendChild(newOption);
  }
  // - populateSelector -
  
  // + assignButtons +
  const processingButton = batchMenu.querySelector('#moveToProcess');
  processingButton.addEventListener('click', async event => {
    assignMoveProRejButton(batchMenu, moveSelector, true);
  });
  const rejectButton = batchMenu.querySelector('#moveToReject');
  rejectButton.addEventListener('click', async event => {
    assignMoveProRejButton(batchMenu, moveSelector, false);
  })
  // - assignButtons -
}


const assignBatchMenu = (orderElement) => {
  const batchTd = orderElement.querySelector('#batchNumber');
  const batchNumber = orderElement.getAttribute(BASIC_ATTRIBUTES.BATCH_NUMBER);
  // + MARKER +
  batchTd.addEventListener('click', async event => {
    if (batchNumber === batchMarker.targetValue) {
      batchMarker.clearMarking();
      return;
    }
    batchMarkTrigger(batchNumber, 10);
  })
  // - MARKER -
  const batchData = _allBatches[batchNumber];
  if (!batchData) {
    orderElement.remove();
    return;
  }
  batchTd.addEventListener('contextmenu', async event => {
    event.preventDefault();
    const batchMenu = await createBatchMenu(
      event, batchTd, batchData, batchMarker, _allBatches
    );
    assignBatchExpandableButtons(batchMenu);
  });
}
// - BATCH MENU -
// + ORDER MENU +
const assignOrderMenu = (orderElement, orderData, ignoredElements = []) => {
  // CONTEXTMENU
  orderElement.addEventListener('contextmenu', async event => {
    event.preventDefault();
    if (ignoredElements.includes(event.target)) {
      return;
    }
    createOrderMenu(event, orderElement, orderData, true);
  })
}
// - ORDER MENU -
const assignWheelstackMenus = (cells, placement, sourcePlacement) => [
  cells.forEach( cell => {
    if (cell.hasWheelstackMenuAssigned) {
      return;
    }
    cell.addEventListener('click', (event) => {
      event.preventDefault();
      const wheelstackMenu = createWheelstackMenu(
        event,
        cell, 
        {
          'wheelstacks': _allWheelstacks,
          'orders': _allOrders,
          'wheels': _allWheels,
          'batches': _allBatches,
        },
        {
          'batchMarker': batchMarker,
        },
        ordersTableBody,
        placement,
        sourcePlacement
      );
      cell.hasWheelstackMenuAssigned = wheelstackMenu;
    })
  })
]
// - CONTEXT MENUS -

setInterval( () => {
//   console.log(_allOrders);
//   console.log('GRIDS', availGrids);
//   console.log('PLATFORMS', availPlatforms);
  // console.log('WHEELS_LENGTH', Object.keys(_allWheels).length);
  // console.log('WHEELS', _allWheels);
}, 5500);
