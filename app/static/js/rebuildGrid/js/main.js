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
} from "../../uniConstants.js";
import NavigationButton from "../../utility/navButton/navButton.js";
import { getRequest } from "../../utility/basicRequests.js";
import { selectPlacementButtonAction} from "../../gridRel/placement/placementRel.js";
import Placement from "../../gridRel/placement/placement.js";
import ZoomAndDrag from "../../utility/zoomDrag.js";
import { combineObjectsData, combineSetsData } from "../../utility/dataManip.js";
import { createErrorElement, createLoadSpinner } from "../../utility/errorMessages.js";


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
// - BAD PRESET -


// + DATA BANKS +
// TODO: Think about combining then together, because separated is simpler to use.
//       But it's kinda, mehhh.
// GRID
var gridWheels = new Set();
var gridWheelstacks = {};
var gridBatches = {};
var gridOrders = {};
// PLATFORM
var platformWheels = new Set();
var platformWheelstacks = {};
var platformBatches = {};
var platformOrders = {};

var _allWheels = new Set();
var _allWheelstacks = {};
var _allBatches = {};
var _allOrders = {};

// CRINGE UPDATE
setInterval(() => {
  combineSetsData(_allWheels, [platformWheels, gridWheels]);
  combineObjectsData(_allWheelstacks, [platformWheelstacks, gridWheelstacks]);
  // TODO: BATCHES can change state == always loopin and updating their state 24/7 every 200ms or smth.
  //   Doubt there's going to be more than 20 batches, so 20 requests within 200ms is 100% fine.
  combineObjectsData(_allBatches, [platformBatches, gridBatches]);
  // TODO: add indicator of getting a new data records.
  //  Or better store all new record references and create a new Order records for each of them (in case of orders)
  combineObjectsData(_allOrders, [platformOrders, gridOrders]);
}, 200);
// ---


const updateSetBank = (dataBank, newData) => {
  newData.forEach( element => {
    if (!(dataBank.has(element))) {
      dataBank.add(element);
    }
  })
  dataBank.forEach( element => {
    if (!(newData.has(element))) {
      dataBank.delete(element);
    }
  })
}

const updateObjBank = (dataBank, newData) => {
  Object.keys(newData).forEach( element => {
    if (!(element in dataBank)) {
      dataBank[element] = newData[element];
    }
  })
  Object.keys(dataBank).forEach( element => {
    if (!(element in newData)) {
      delete dataBank[element];
    }
  })
}

const updateBanksFromPlacement = async (placementData, placementType) => {
  const newWheels = new Set();
  const newBatches = {};
  const newOrders = {};
  const allWheelstacks = placementData['wheelstacksData'];
  for (let row in placementData['rows']) {
    for (let col in placementData['rows'][row]['columns']) {
      const cellData = placementData['rows'][row]['columns'][col];
      const wheelstackId = cellData['wheelStack'];
      if (wheelstackId) {
        const wheelstackData = allWheelstacks[wheelstackId];
        for (let wheelId of wheelstackData['wheels']) {
          newWheels.add(wheelId);
        }
        newBatches[wheelstackData['batchNumber']] = false;
      }
      const orderId = cellData['blockedBy'];
      if (orderId) {
        newOrders[orderId] = false;
      }
    }
  }
  if (PLACEMENT_TYPES.GRID === placementType) {
    updateSetBank(gridWheels, newWheels);
    updateObjBank(gridBatches, newBatches);
    updateObjBank(gridOrders, newOrders);
    gridWheelstacks = allWheelstacks;
  } else if (PLACEMENT_TYPES.BASE_PLAFTORM === placementType) {
    updateSetBank(platformWheels, newWheels);
    updateObjBank(platformBatches, newBatches);
    updateObjBank(platformOrders, newOrders);
    platformWheelstacks = allWheelstacks;
  }
}
// - DATA BANKS -

const hideClass = 'hidden';

const platformsContainer = document.getElementById('platformsContainer');
const ordersContainer = document.getElementById('ordersTableContainer');

const topContainer = document.getElementById('topContainer');
const botContainer = document.getElementById('botContainer');

const platformViewBut = document.getElementById('platformVis');
const ordersViewBut = document.getElementById('ordersVis');
const gridFullBut = document.getElementById('gridFull');

// + ORDERS ADJUSTMENT +
window.addEventListener('resize', event => {
  adjustOrderColumns();
})

const adjustOrderColumns = () => {
  const curWidth = ordersContainer.getBoundingClientRect().width;
  const ordersTable = ordersContainer.querySelector('#ordersTable');
  if (ORDERS_TABLE_BREAKSIZE > curWidth) {
    const cellsToHide = ordersTable.querySelectorAll(
      'tr td:nth-child(1), tr td:nth-child(2), th:nth-child(1), th:nth-child(2)'
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
  adjustOrderColumns()
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
  adjustOrderColumns();
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
const updatePlacement = async (placement) => {
  let dataURL = '';
  let placementType = placement.placementType;
  if (PLACEMENT_TYPES.GRID === placementType) {
    dataURL = `${BACK_URL.GET_GRID_STATE}/${placement.placementId}?includeWheelstacks=true`;
  } else if (PLACEMENT_TYPES.BASE_PLAFTORM === placementType) {
    dataURL = `${BACK_URL.GET_PLATFORM_STATE}/${placement.placementId}?includeWheelstacks=true`;
  }
  const dataResp = await getRequest(dataURL, false, true);
  // TODO: Error handling
  const newData = await dataResp.json()
  if (platformSelectActive && PLACEMENT_TYPES.GRID == placement.placementType) {
    const newPlatforms = new Set(newData['assignedPlatforms']);
    if (0 === newPlatforms.size) {
      clearAvailPlatforms(
        platformsContainer, platformSelectRelated,
        platformSelector, true, true
      )
    } else {
      for (let platform of newPlatforms) {
        if (!(availPlatforms.has(platform))) {
          updateAvailPlatforms(
            newPlatforms, platformsContainer,
            platformSelectRelated, platformSelector 
          );
          break;
        }
      }
    }
  }
  placement.updatePlacement(newData);
  updateBanksFromPlacement(newData, placementType);
}
// - PLACEMENT UPDATE -

// + GRID SELECTION +
const createOption = async (optionValue, optionName, selected) => {
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
  availGrids = await gridsReq.json();
  selector.innerHTML = '';
  availGrids.forEach( async (record) => {
    const optionValue = {
      '_id': record['_id'],
      'presetId': record['preset'],
    }
    const newOption = await createOption(JSON.stringify(optionValue), record['name']);
    selector.appendChild(newOption);
  })
  selectRelated.forEach( element => {
    element.classList.remove('hidden');
  })
}

const gridsSelectInputGroup = botContainer.querySelector('#gridSelectInputGroup');
const gridsSelector = botContainer.querySelector('#gridsSelector');
var availGrids = [];
var availPlatforms = new Set([]);

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

const selectGridButton = botContainer.querySelector('#selectGrid');
selectGridButton.addEventListener('click', async event => {
  // TODO: Errors handle, what if we're not getting correct preset data?
  await selectPlacementButtonAction(
    gridsSelector, gridPlacement, gridActiveElements, gridInactiveElements,
    gridView, gridsViewButton, true
  )
  gridSelectActive = false;
  if (gridPlacementUpdateInterval) {
    clearInterval(gridPlacementUpdateInterval);
    gridPlacementUpdateInterval = null;
  }
  gridPlacementUpdateInterval = setInterval( async () => {
    if (gridSelectActive) {
      return;
    }
    await updatePlacement(gridPlacement);
  }, GRID_PLACEMENT_INTERVAL)
})
// - GRID BUILD -
// - GRID SELECTION -

// + PLATFORM SELECTION +
var platformView = false;
var platformSelectActive = true;
var platformPlacementUpdateInterval = null;
const platformPlacement = new Placement(PLACEMENT_TYPES.BASE_PLAFTORM);
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
  availPlatforms = new Set([]);
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
  newPlatforms, container,
  selectRelated, selector) => {
  const loadSpinner = createLoadSpinner('platformsSpinner');
  availPlatforms = newPlatforms;
  container.childNodes.forEach( child => {
    if (1 === child.nodeType) {
      child.classList.add('hidden');
    }
  });
  container.appendChild(loadSpinner);
  selector.innerHTML = '';
  if (0 === availPlatforms.size) {
    clearAvailPlatforms(selector, false, true)
    forcePlatformClosedView();
  } else {
    availPlatforms.forEach( async (record) => {
      const optionValue = {
        'name': record,
      }
      const newOption = await createOption(JSON.stringify(optionValue), record);
      selector.appendChild(newOption);
    })
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
  await selectPlacementButtonAction(
    platformSelector, platformPlacement, platformActiveElements, platformInActiveElements,
    platformView, platformViewButton, false
  )
  platformSelectActive = false;
  if (platformPlacementUpdateInterval) {
    clearInterval(platformPlacementUpdateInterval);
    platformPlacementUpdateInterval = null;
  }
  platformPlacementUpdateInterval = setInterval( async () => {
    if (platformSelectActive) {
      return;
    }
    await updatePlacement(platformPlacement);
  }, GRID_PLACEMENT_INTERVAL);
})

platformViewButton.addEventListener('click', (event) => {
  platformSelectActive = !platformSelectActive;
  if (platformSelectActive) {
    platformSelectInputGroup.classList.remove('hidden');
    platformPlacement.element.classList.add('hidden');
  } else {
    platformSelectInputGroup.classList.add('hidden');
    platformPlacement.element.classList.remove('hidden');
  }
})
// - PLATFORM SELECTION -

setInterval( () => {
  console.log('gridWheels', gridWheels.size);
  console.log('platformWheels', platformWheels.size)
  console.log('gridWheelstacks', Object.keys(gridWheelstacks).length);
  console.log('platformWheelstacks', Object.keys(platformWheelstacks).length);
  console.log('platformOrders', Object.keys(platformOrders).length);
}, 5500)