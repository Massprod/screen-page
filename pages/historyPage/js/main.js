import Placement from "./placement/placement.js";
import { getRequest } from "../../utility/basicRequests.js";
import {
    BACK_URL,
    AUTH_COOKIE_NAME,
    loginPage,
    RESTRICTED_TO_THIS_ROLE,
    USER_ROLE_COOKIE_NAME,
    BASIC_COOKIES,
    HISTORY_PAGE_ROLES,
    NAV_BUTTONS,
    USER_ROLE_COOKIE_UPDATE_INTERVAL,
} from "../../uniConstants.js";
import { ORDER_TYPES_TRANSLATE_TABLE } from "../../managerPage/js/constants.js";
import { keepAuthCookieFresh, clearRedirect, validateRoleCookie, getCookie } from "../../utility/roleCookies.js";
import NavigationButton from "../../utility/navButton/navButton.js";
import CellHoverCoordinate from "../../utility/cellHover/cellHoverCoordinate.js";
import ZoomAndDrag from "../../utility/zoomDrag.js";
import flashMessage from "../../utility/flashMessage/flashMessage.js";
import { getISOFormatUTC, convertToUTC, convertUTCToLocal } from "../../utility/timeConvert.js";
import convertISOToCustomFormat from "../../utility/convertToIso.js";
import { createPlacementRecord, createTableRow } from "./ordersTable/ordersTable.js";


// TODO: Can be universal on all pages, only change is roles.
//  We just need a function with ROLES + INTERVAL args.
//  Or we can even give cookies names as args, but later. 
// COOKIE CHECK
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
    top: '92%',
    left: 'auto',
    right: '3%',
    bottom: 'auto',
}
const roleNavButtons = NAV_BUTTONS[userRole];
const clearCookies = [USER_ROLE_COOKIE_NAME, AUTH_COOKIE_NAME];
const navButton = new NavigationButton(
    navPosition, roleNavButtons, clearCookies,
)
// ---
// HOVERING
const hoverCoord = new CellHoverCoordinate('placement-cell');
// ---
// TODO: Check what can be moved to utils.
// + UNI +
const triggerChange = async (element) => {
    const event = new Event('change');
    element.dispatchEvent(event);
}

const shiftSelector = async (selectorElement, shift) => {
    if (0 < shift && selectorElement.selectedIndex < selectorElement.options.length - 1) {
        selectorElement.selectedIndex += shift;
        triggerChange(selectorElement);
    } else if (0 > shift && 0 < selectorElement.selectedIndex) {
        selectorElement.selectedIndex += shift;
        triggerChange(selectorElement);
    }
}

const gatherOrderRowData = async (orderData) => {
    const showData = {};
    const wheelstackId = orderData['affectedWheelStacks']['source'];
    const wheelstackURL = `${BACK_URL.GET_WHEELSTACK_RECORD}/${wheelstackId}`;
    const wheelstackResp = await getRequest(wheelstackURL, true, true);
    const wheelstackData = await wheelstackResp.json();
    showData['batchNumber'] = `<b>${wheelstackData['batchNumber']}</b>`;
    showData['orderId'] = orderData['_id'];
    showData['orderType'] = ORDER_TYPES_TRANSLATE_TABLE[orderData['orderType']];
    showData['source'] = await createPlacementRecord(orderData['source']);
    showData['destination'] = await createPlacementRecord(orderData['destination']);
    showData['createdAt'] = `<b>${convertISOToCustomFormat(orderData['createdAt'], true, true)}</b>`;
    return showData;
}

const createOrderRecords = async (ordersData, targetTable) => {
    const orderElements = [];
    ordersData.forEach( async (orderData) => {
        const displayData = await gatherOrderRowData(orderData);
        const rowElement = await createTableRow(displayData);
        rowElement.id = displayData['orderId'];
        rowElement.childNodes[0].id = displayData['batchNumber'];
        targetTable.appendChild(rowElement);
        orderElements.push(rowElement);
    })
    return orderElements;
}

const selectPlacementButtonAction = async (
    selectorElement, placement, showElements,
    hideElements, viewState, viewButton, useIdentifiers) => {
    if (!selectorElement.value) {
        flashMessage.show({
            'message': 'Выберите расположение',
        })
        return viewState;
    }
    const optionValue = JSON.parse(selectorElement.value);
    const placementId = optionValue['_id'];
    const presetId = optionValue['presetId'];
    await preparePlacement(placementId, presetId, placement, useIdentifiers);
    await switchView(hideElements, showElements);
    viewButton.classList.remove('hidden');
    return !viewState;
}

const updatePlacementHistory = async (placement, historyRecordId) => {
    const historyRecordURL = `${BACK_URL.GET_HISTORY_RECORD}?record_id=${historyRecordId}`;
    const historyDataResponse = await getRequest(historyRecordURL, true, true);
    const historyRecordData = await historyDataResponse.json();
    placement.updatePlacementHistory(historyRecordData);
    return historyRecordData;
}

const getPlacementRecords = async (url) => {
    const allRecordsResponse = await getRequest(url, true, true);
    const allRecordsData = await allRecordsResponse.json();
    return allRecordsData;
}

const preparePlacement = async (placementId, presetId, placement, useIdentifiers) => {
    placement.placementId = placementId;
    const presetDataURL = `${BACK_URL.GET_PRESET_DATA}/${presetId}`;
    const response = await getRequest(presetDataURL, true, true);
    const presetData = await response.json();
    placement.buildPreset(presetData, useIdentifiers); 
}

const getPlacementHistory = async (url, queries) => {
    let requestUrl = `${url}?`;
    for (let [query, value] of Object.entries(queries)) {
        requestUrl = `${requestUrl}${query}=${value}&`;
    }
    const response = await getRequest(requestUrl, true, true);
    const responseData = await response.json();
    return responseData;
}

const historySelectorPopulate = async (
    placementId, startDateElement, endDateElement, selectorElement
    ) => {
        let periodStart = startDateElement.value;
        let periodEnd = endDateElement.value;;
        const periods = await correctDatePeriod(periodStart, periodEnd);
        if (!periods) {
            return null;
        }
        const localPeriodStart = periods['local']['periodStart'];
        const localPeriodEnd = periods['local']['periodEnd']
        startDateElement.value = localPeriodStart.split('.')[0];
        endDateElement.value = localPeriodEnd.split('.')[0];
        periodStart = periods['utc']['periodStart'];
        periodEnd = periods['utc']['periodEnd'];
        const queries = {
            'include_data': false,
            'period_start': encodeURIComponent(periodStart),
            'period_end': encodeURIComponent(periodEnd),
            'placement_id': placementId,
        }
        const placementHistoryDataURL = `${BACK_URL.GET_PLACEMENT_HISTORY}`;
        const historyRecords = await getPlacementHistory(placementHistoryDataURL, queries);
        if (!historyRecords || 0 === historyRecords.length) {
            flashMessage.show({
                'message': '<b>Нет данных за выбранный период</b>',
                'color': 'red',
            })
            return historyRecords;
        }
        const optionsData = {};
        for (let index = 0; index < historyRecords.length; index += 1) {
            const optionValue = index;
            const optionName = historyRecords[index]['createdAt'];
            const corDate = convertISOToCustomFormat(optionName, false, true, true);
            optionsData[corDate] = optionValue;
        }
        await populateSelector(selectorElement, optionsData);
        return historyRecords;
    }

const createOption = async (optionValue, optionName, selected) => {
    const newOption = document.createElement('option');
    newOption.value = optionValue
    newOption.textContent = optionName.charAt(0).toUpperCase() + optionName.slice(1);
    if (selected) {
        newOption.selected = true;
    }
    return newOption;
}

const switchView = async (activeElements, inActiveElements) => {
    activeElements.forEach( element => {
        element.classList.add('hidden');
    })
    inActiveElements.forEach( element => {
        element.classList.remove('hidden');
    })
}

const populateSelector = async (selectorElement, optionsData) => {
    selectorElement.innerHTML = '';
    if (0 === optionsData.length || 0 === Object.keys(optionsData).length) {
        const emptyOption = await createOption(null, 'Нет данных', true);
        selectorElement.appendChild(emptyOption);
        return;
    }
    for (let [optionName, optionValue] of Object.entries(optionsData)) {
        const option = await createOption(optionValue, optionName);
        selectorElement.appendChild(option);
    }
}

const correctDatePeriod = async (periodStart, periodEnd) => {
    if (periodStart && periodEnd && periodStart > periodEnd) {
        flashMessage.show({
            'message': 'Выберите корректный период. Дата начала не должна быть выше окончания.'
        })
        return null;
    }
    let standardStart = null;
    let standardEnd = null;
    if (!periodStart && !periodEnd) {
        flashMessage.show({
            'message': 'Не выбраны данные периода. Автоматический выбор последних 24 часов',
        });
        const shift = 60 * 60 * 24
        standardStart = getISOFormatUTC(-shift);
        standardEnd = getISOFormatUTC();
    } else if (!periodStart) {
        flashMessage.show({
            'message': 'Не выбрано начало периода. Автоматический выбор смещения на 24 часа',
        })
        const shift = 60 * 60 * 24
        const periodEndObject = new Date(periodEnd);
        periodEndObject.setSeconds(periodEndObject.getSeconds() - shift);
        standardStart = periodEndObject.toISOString().replace('Z','+00:00');
    } else if (!periodEnd) {
        flashMessage.show({
            'message': 'Не выбрано окончание периода. Автоматический выбор смещения на 24 часа',
        })
        const shift = 60 * 60 * 24
        const periodStartObject = new Date(periodStart);
        periodStartObject.setSeconds(periodStartObject.getSeconds() + shift);
        standardEnd = periodStartObject.toISOString().replace('Z', '+00:00');
    }
    if (!standardStart) {
        standardStart = convertToUTC(periodStart);
    }
    if (!standardEnd) {
        standardEnd = convertToUTC(periodEnd);
    }
    // CHANGE UTCtoLocal conversion, because `periodStart` and `periodEnd` already in correct format.
    // But because we can have them empty, we need to convert them from standard we create.
    // For now, leaving it just as extra convert in correct | incorrect situation, it's w.e. Not critical calc.
    const periods = {
        'utc': {
            'periodStart': standardStart,
            'periodEnd': standardEnd,
        },
        'local': {
            'periodStart': convertUTCToLocal(standardStart),
            'periodEnd': convertUTCToLocal(standardEnd),
        }
    }
    return periods;
}
// - UNI -
// + PLATFORM +
var ordersTable = document.getElementById('ordersTableBody');
var platformCurrentHistory = [];
var platformActiveHistoryData = null;
var platformActiveHistoryElements = null;

const platformsContainer = document.getElementById('platformsContainer');
const switchPlatformViewBut = platformsContainer.querySelector('#switchView');
// True == placement shown | False == selector shown
var platformView = false;

// SELECTOR rel
const platformSelector = platformsContainer.querySelector('#platformsSelector');
const platformSelectBut = platformsContainer.querySelector('#selectPlatform');
const platformsRefreshBut = platformsContainer.querySelector('#refreshPlatforms');

const platformSelectInputGroup = platformsContainer.querySelector('#platformSelectInputGroup');
const platformSelectButtonsContainer = platformsContainer.querySelector('#platformSelectButtons');
const platformSelectActiveElements = new Set ([
    platformSelectInputGroup,
    platformSelectButtonsContainer,
]);
platformsRefreshBut.addEventListener('click', async (event) => {
    event.preventDefault();
    const getPlatformsURL = `${BACK_URL.GET_PLATFORMS}?include_data=false`;    
    const platformRecords = await  getPlacementRecords(getPlatformsURL);
    platformSelector.innerHTML = '';
    platformRecords.forEach( async record => {
        const optionValue = {
            '_id': record['_id'],
            'presetId': record['preset'],
        }
        const newOption = await createOption(JSON.stringify(optionValue), record['name']);
        platformSelector.appendChild(newOption);
    })
})
// PLACEMENT rel
const platformPlacement = new Placement('basePlatform');
platformPlacement.element.classList.add('hidden');
platformsContainer.appendChild(platformPlacement.element);
const platformHistorySlider = document.getElementById('platformHistorySlider');
platformsContainer.insertBefore(platformPlacement.element, platformHistorySlider);
const platformPlacementActiveElements = new Set([
    platformPlacement.element,
    platformHistorySlider,
]);

platformSelectBut.addEventListener('click', async (event) => {
    event.preventDefault();
    platformView = await selectPlacementButtonAction(
        platformSelector, platformPlacement, platformPlacementActiveElements,
        platformSelectActiveElements, platformView, switchPlatformViewBut, false
    )
})

switchPlatformViewBut.addEventListener('click', async (event) => {
    event.preventDefault();
    if (platformView) {
        await switchView(platformPlacementActiveElements, platformSelectActiveElements);
    } else {
        await switchView(platformSelectActiveElements, platformPlacementActiveElements);
    }
    platformView = !platformView;
})

// + SLIDER +
// True == period view | False == date selector view
const platformHistoryDateInputGroup = platformHistorySlider.querySelector('#dateInput');
const platformHistoryLoadDataButton = platformHistorySlider.querySelector('#loadData');
const platformHistoryStartDate = platformHistorySlider.querySelector('#startDateTime');
const platformHistoryEndDate = platformHistorySlider.querySelector('#endDateTime');
const platformPeriodElements = new Set([
    platformHistoryDateInputGroup,
])
const platformHistoryContainer = platformHistorySlider.querySelector('#platformHistory');
const platformHistorySelectElements = new Set([
    platformHistoryContainer,
])
const platformHistorySelector = platformHistoryContainer.querySelector('#platformsHistorySelector');
const platformHistoryPreviousBut = platformHistoryContainer.querySelector('#prevRecord');
const platformHistoryNextBut = platformHistoryContainer.querySelector('#nextRecord');

platformHistoryLoadDataButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const placementId = platformPlacement.placementId;
    if (!placementId) {
        flashMessage.show({
            'message': 'Не выбрано расположение',
        })
        return;
    }
    const newHistoryRecords = await historySelectorPopulate(
        placementId, platformHistoryStartDate, platformHistoryEndDate, platformHistorySelector,
    )
    if (!newHistoryRecords || 0 === newHistoryRecords.length) {
        return;
    }
    platformActiveHistoryData = await updatePlacementHistory(platformPlacement, newHistoryRecords[0]['_id']);
    platformCurrentHistory = newHistoryRecords;
    if (platformActiveHistoryData) {
        if (platformActiveHistoryElements) {
            platformActiveHistoryElements.forEach( element => {
                element.remove();
            })
        }
        platformActiveHistoryElements = await createOrderRecords(platformActiveHistoryData['placementOrders'], ordersTable);
    }
    await switchView(platformPeriodElements, platformHistorySelectElements);
    const recordDate = platformActiveHistoryData['createdAt'];
    flashMessage.show({
        'message': `Данные отображения <b>платформы</b> изменены<br>Дата: ${convertISOToCustomFormat(recordDate, false, true, true)}`,
        'duration': 1000,
    })
})

const periodChangeBut = platformHistoryContainer.querySelector('#periodChange');
periodChangeBut.addEventListener('click', async (event) => {
    event.preventDefault();
    await switchView(platformHistorySelectElements, platformPeriodElements);
})

platformHistorySelector.addEventListener('change', async event => {
    const selectedIndex = platformHistorySelector.selectedIndex;
    const historyIndex = platformHistorySelector.options[selectedIndex].value;    
    const historyRecordId = platformCurrentHistory[historyIndex]['_id'];
    platformActiveHistoryData = await updatePlacementHistory(
        platformPlacement, historyRecordId,
    )
    if (platformActiveHistoryData) {
        if (platformActiveHistoryElements) {
            platformActiveHistoryElements.forEach( element => {
                element.remove();
            })
        }
        platformActiveHistoryElements = await createOrderRecords(platformActiveHistoryData['placementOrders'], ordersTable);
    }
    const recordDate = platformActiveHistoryData['createdAt'];
    flashMessage.show({
        'message': `Данные отображения <b>платформы</b> изменены<br>Дата: ${convertISOToCustomFormat(recordDate, false, true, true)}`,
        'duration': 1000,
    })
})

platformHistoryPreviousBut.addEventListener('click', async (event) => {
    event.preventDefault();
    await shiftSelector(platformHistorySelector, -1);
})

platformHistoryNextBut.addEventListener('click', async (event) => {
    event.preventDefault();
    await shiftSelector(platformHistorySelector, 1);
})
// - SLIDER -
// - PLATFORM -

// + GRID + 
var gridCurrentHistory = [];
var gridActiveHistoryData = null;
var gridActiveHistoryElements = null;

const gridsContainer = document.getElementById('gridsContainer');
const gridContainer = document.getElementById('gridContainer');
const switchGridViewBut = gridsContainer.querySelector('#switchViewGrid');
// TRUE = grid show | False == selector shown
var gridView = false;

// SELECTOR rel
const gridsSelector = gridsContainer.querySelector('#gridsSelector');
const gridSelectBut = gridsContainer.querySelector('#selectGrid');
const gridRefreshBut = gridsContainer.querySelector('#refreshGrids');

const gridSelectInputGroup = gridsContainer.querySelector('#gridSelectInputGroup');
const gridSelectButtonsContainer = gridsContainer.querySelector('#gridSelectButtons');
const gridSelectActiveElements = new Set([
    gridSelectInputGroup,
    gridSelectButtonsContainer,
])
// ---
// Refresh grid options
gridRefreshBut.addEventListener('click', async (event) => {
    event.preventDefault();
    const getGridsURL = `${BACK_URL.GET_GRIDS}?include_data=false`;
    const gridRecords = await getPlacementRecords(getGridsURL);
    gridsSelector.innerHTML = '';
    gridRecords.forEach( async record => {
        let optionValue = {
            '_id': record['_id'],
            'presetId': record['preset'],
        }
        optionValue = JSON.stringify(optionValue);
        const newOption = await createOption(optionValue, record['name']);
        gridsSelector.appendChild(newOption);
    })
})
// ---
// PLACEMENT rel
const gridPlacement = new Placement('grid');
// ZOOMER
const zoomer = new ZoomAndDrag({
    'viewport': gridContainer,
    'grid': gridPlacement.element,
    'maxScale': 0.7,
});
// ---
// VIEW SWITCH
gridContainer.appendChild(gridPlacement.element);
const gridHistorySlider = document.getElementById('gridHistorySlider');
const gridPlacementActiveElements = new Set([
    gridContainer,
    gridHistorySlider,
])
gridSelectBut.addEventListener('click', async (event) => {
    event.preventDefault();
    gridView = await selectPlacementButtonAction(
        gridsSelector, gridPlacement, gridPlacementActiveElements,
        gridSelectActiveElements, gridView, switchGridViewBut, true
    )
})

switchGridViewBut.addEventListener('click', async (event) => {
    event.preventDefault();
    if (gridView) {
        await switchView(gridPlacementActiveElements, gridSelectActiveElements);
    } else {
        await switchView(gridSelectActiveElements, gridPlacementActiveElements);
    }
    gridView = !gridView;
})
// ---
// History slider
const gridHistoryDateInputGroup = gridHistorySlider.querySelector('#dateInput');
const gridHistoryLoadDataButton = gridHistorySlider.querySelector('#loadData');
const gridHistoryStartDate = gridHistorySlider.querySelector('#startDateTime');
const gridHistoryEndDate = gridHistorySlider.querySelector('#endDateTime');
const gridPeriodElements = new Set([
    gridHistoryDateInputGroup,
]);
const gridHistoryContainer = gridHistorySlider.querySelector('#gridHistory');
const gridHistorySelectElements = new Set([
    gridHistoryContainer,
]);
const gridHistorySelector = gridHistoryContainer.querySelector('#gridHistorySelector');
const gridHistoryPreviousBut = gridHistoryContainer.querySelector('#prevRecord');
const gridHistoryNextBut = gridHistoryContainer.querySelector('#nextRecord');

gridHistoryLoadDataButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const placementId = gridPlacement.placementId;
    if (!placementId) {
        flashMessage.show({
            'message': 'Не выбрано расположение',
        })
        return;
    }
    const newHistoryRecords = await historySelectorPopulate(
        placementId, gridHistoryStartDate, gridHistoryEndDate, gridHistorySelector,
    )
    if (!newHistoryRecords || 0 === newHistoryRecords.length) {
        return;
    }
    gridActiveHistoryData = await updatePlacementHistory(gridPlacement, newHistoryRecords[0]['_id']);
    gridCurrentHistory = newHistoryRecords;
    if (gridActiveHistoryData) {
        if (gridActiveHistoryElements) {
            gridActiveHistoryElements.forEach( element => {
                element.remove();
            })
        }
        gridActiveHistoryElements = await createOrderRecords(gridActiveHistoryData['placementOrders'], ordersTable);
    }
    await switchView(gridPeriodElements, gridHistorySelectElements);
    const recordDate = gridActiveHistoryData['createdAt'];
    flashMessage.show({
        'message': `Данные отображения <b>платформы</b> изменены<br>Дата: ${convertISOToCustomFormat(recordDate, false, true, true)}`,
        'duration': 1000,
    })
})

const gridPeriodChangeBut = gridHistoryContainer.querySelector('#periodChange');
gridPeriodChangeBut.addEventListener('click', async (event) => {
    event.preventDefault();
    await switchView(gridHistorySelectElements, gridPeriodElements);
})

gridHistorySelector.addEventListener('change', async event => {
    const selectedIndex = gridHistorySelector.selectedIndex;
    const historyIndex = gridHistorySelector.options[selectedIndex].value;
    const historyRecordId = gridCurrentHistory[historyIndex]['_id'];
    gridActiveHistoryData = await updatePlacementHistory(gridPlacement, historyRecordId);
    if (gridActiveHistoryData) {
        if (gridActiveHistoryElements) {
            gridActiveHistoryElements.forEach( element => {
                element.remove();
            })
        }
        gridActiveHistoryElements = await createOrderRecords(gridActiveHistoryData['placementOrders'], ordersTable);
    }
    const recordDate = gridActiveHistoryData['createdAt'];
    flashMessage.show({
        'message': `Данные отображения <b>платформы</b> изменены<br>Дата: ${convertISOToCustomFormat(recordDate, false, true, true)}`,
        'duration': 1000,
    })
})

gridHistoryPreviousBut.addEventListener('click', async (event) => {
    event.preventDefault();
    await shiftSelector(gridHistorySelector, -1);
})

gridHistoryNextBut.addEventListener('click', async (event) => {
    event.preventDefault();
    await shiftSelector(gridHistorySelector, 1);
})
// ---
// - GRID -
// +  ORDERS TABLE +

// - ORDERS TABLE - 