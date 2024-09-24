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
import { BASE_PLATFORM_NAME, GRID_NAME, ORDER_TYPES_TRANSLATE_TABLE } from "../../managerPage/js/constants.js";
import { keepAuthCookieFresh, clearRedirect, validateRoleCookie, getCookie } from "../../utility/roleCookies.js";
import NavigationButton from "../../utility/navButton/navButton.js";
import CellHoverCoordinate from "../../utility/cellHover/cellHoverCoordinate.js";
import ZoomAndDrag from "../../utility/zoomDrag.js";
import flashMessage from "../../utility/flashMessage/flashMessage.js";
import { getISOFormatUTC, convertToUTC, convertUTCToLocal } from "../../utility/timeConvert.js";
import convertISOToCustomFormat from "../../utility/convertToIso.js";
import { createPlacementRecord, createTableRow } from "./ordersTable/ordersTable.js";
import BasicSearcher from '../../utility/search/basicSearcher.js';
import AttributeMark from '../../utility/mark/mark.js';
import FocusMark from "../../utility/focusElement/focusElement.js";
import { createBatchMenu } from "./batchMenu/batchMenu.js";


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
// + HOVER COORD +
const hoverCoord = new CellHoverCoordinate('placement-cell');
// - HOVER COORD -
// + TABLE ADJUSTMENT + 
var tableBreakSize = 936;
var ordersTableFull = document.getElementById('ordersTable');

window.addEventListener('DOMContentLoaded', event => {
    const breakerRows = document.querySelectorAll('.data-breaker');
    adjustTableColumns(ordersTableFull, tableBreakSize);
    breakerRows.forEach( element => {
        adjustRowsBreaker(element.childNodes[0], tableBreakSize, ordersTableFull);
    })
    
})

window.addEventListener('resize', async (event) => {
    const breakerRows = document.querySelectorAll('.data-breaker');
    await adjustTableColumns(ordersTableFull, tableBreakSize);
    breakerRows.forEach( element => {
        adjustRowsBreaker(element.childNodes[0], tableBreakSize, ordersTableFull);
    })
})

const adjustTableColumns = async (table, breakSize) => {
    const tableWidth = table.offsetWidth;
    if (tableWidth < breakSize) {
        const cellsToHide = table.querySelectorAll('tr:not(.data-breaker) td:nth-child(1), tr:not(.data-breaker) td:nth-child(2), th:nth-child(1), th:nth-child(2)');
        cellsToHide.forEach(cell => {
            cell.classList.add('orders-table-hidden');
        });
    } else {
        const cellsToShow = table.querySelectorAll('.orders-table-hidden');
        cellsToShow.forEach(cell => {
            cell.classList.remove('orders-table-hidden');
        });
    }
}

const adjustRowsBreaker = async (element, breakSize, offSetElement) => {
    if (offSetElement.offsetWidth <= breakSize) {
        element.colSpan = 4;
    } else {
        element.colSpan = 6;
    }
}
// - TABLE ADJUSTMENT -
// TODO: Check what can be moved to utils.
// + UNI +

const assignPlatformFocus = (element, target, focusClass, message, callTimeout = 0) => {
    element.addEventListener('click', event => {
        if (focusSequence) {
            flashMessage.show({
                'message': `Подождите отображения эпизода прошлого заказа`,
                'color': 'red',
                'duration': 800,
            })
            return;
        }
        setTimeout( () => {
            focusClass.higlightElement(target);
            flashMessage.show({
                'message': message,
                'color': '#013565',
                'duration': 1000,
            });
        }, callTimeout)
    })
} 

const assignGridSequenceFocus = (element, targets, focusContainer, focusers, message, callTimeout = 1500, sequenceCooldown = 2500) => {
    // TODO: REBUILD THIS MONSTROSITY LATER.
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
        for (let index = 0; index < targets.length; index += 1) {
            const target = targets[index];
            setTimeout( () => {
                // targets.length - index == we need to end focusing whole sequence at the same time.
                // callTimeout * (targets.length - index) == time we need
                // console.log(sequenceCooldown + (targets.length - index) * callTimeout);
                let highlightTime = 5000;
                if (1 !== targets.length) {
                    highlightTime = sequenceCooldown + (targets.length - index) * callTimeout;
                }
                const newTranslationData = focusers[index].centerElementInContainer(
                    focusContainer.childNodes[0], focusContainer, target, highlightTime
                );
                flashMessage.show({
                    'message': `${message}`,
                    'color': '#013565',
                    'duration': 1000,
                })
                zoomer.translation.x = newTranslationData['newX'];
                zoomer.translation.y = newTranslationData['newY'];
                zoomer.translation.scale = newTranslationData['newScale'];
                if (index === targets.length - 1) {
                    setTimeout( () => {
                        focusSequence = false;
                    }, (highlightTime + 500) * index);
                }
            }, callTimeout * index);
        }
    })
}

const switchRecordButtonState = async (button, lastRecord) => {
    if (lastRecord) {
        button.classList.add('last-record', 'shake');
        flashMessage.show({
            'message': 'Отображена последняя запись',
            'color': 'red',
            'duration': 500,
        })
        setTimeout( () => {
            button.classList.remove('shake');
        }, 500);
    } else {
        button.classList.remove('last-record');
    }
}

const checkButtonState = async (prevButton, nextButton, selectorElement) => {
    const selectedIndex = selectorElement.selectedIndex;
    if (0 === selectedIndex &&  selectedIndex === selectorElement.options.length - 1) {
        switchRecordButtonState(prevButton, true);
        switchRecordButtonState(nextButton, true);
        return;
    }
    if (0 === selectedIndex) {
        switchRecordButtonState(prevButton, true);
    } else {
        switchRecordButtonState(prevButton, false);
    }
    if (selectedIndex === selectorElement.options.length - 1) {
        switchRecordButtonState(nextButton, true);
    } else {
        switchRecordButtonState(nextButton, false);
    }
}


const triggerResize = async (element) => {
    const event = new Event('resize');
    element.dispatchEvent(event);
}

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

const clearElements = async (elements) => {
    for (let element of elements) {
        element.remove();
    }
}

const gatherOrderRowData = async (orderData, wheelstacksData) => {
    const showData = {};
    const wheelstackId = orderData['affectedWheelStacks']['source'];
    const wheelstackData = wheelstacksData[wheelstackId];
    const batchData = wheelstackData['batchNumber'];
    let columnClasses = ['batch-indicator'];
    if (!batchData['laboratoryTestDate']) {
        columnClasses.push('not-tested');
    } else if (batchData['laboratoryPassed']) {
        columnClasses.push('passed');
    } else if (!batchData['laboratoryPassed']) {
        columnClasses.push('not-passed');
    }
    showData['batchNumber'] = {
        'innerHTML': `${batchData['batchNumber']}`,
        'title': `Номер партии | Нажмите для выделения всей партии`,
        'cursor': 'pointer',
        'classes': columnClasses,
    };
    showData['orderId'] = {
        'innerHTML': orderData['_id'],
        'title': `Номер заказа для идентификации`,
    };
    showData['orderType'] = {
        'innerHTML': ORDER_TYPES_TRANSLATE_TABLE[orderData['orderType']],
        'title': 'Тип заказа | Нажмите для выделения используемых элементов, в активном приямке и платформе',
        'cursor': 'pointer',
    };
    showData['source'] = {
        'innerHTML': await createPlacementRecord(orderData['source']),
        'title': 'Исходная позиция для перемещения | Нажмите для выделения используемого элемента, в активном приямке и платформе',
        'cursor': 'pointer',
    }
    showData['destination'] = {
        'innerHTML': await createPlacementRecord(orderData['destination']),
        'title': 'Конечная позиция для перемещения | Нажмите для выделения используемого элемента, в активном приямке и платформе',
        'cursor': 'pointer',
    }
    showData['createdAt'] = {
        'innerHTML': `<b>${convertISOToCustomFormat(orderData['createdAt'], true, true)}</b>`,
        'title': 'Время создания заказа в системе',
    };
    return showData;
}

const createOrderRecords = async (historyData, targetTable, placementType, identifierRow, beforeBreaker = null) => {
    const orderElements = [];
    const ordersData = Object.values(historyData['placementOrders']);
    // TODO: Adjust back data, it's garbage. But it's okay for now, and history.
    const wheelstacksData = historyData['wheelstacksData'];
    if (0 !== ordersData.length) {
        identifierRow.childNodes[0].innerHTML = `Данные для <b>${placementType}</b>`;
    } else {
        identifierRow.childNodes[0].innerHTML = `Нет данных для отображения: <b>${placementType}</b>`;
    }
    for (let orderData of ordersData) {
        const orderWheelstack = orderData['affectedWheelStacks']['source'];
        const wheelstackData = wheelstacksData[orderWheelstack];
        const batchNumber = wheelstackData['batchNumber']['batchNumber'];
        const displayData = await gatherOrderRowData(orderData, wheelstacksData);
        const rowElement = await createTableRow(displayData);
        rowElement.id = orderData['_id'];
        rowElement.setAttribute('data-batch-number', batchNumber);
        if (beforeBreaker) {
            targetTable.insertBefore(rowElement, beforeBreaker);
        } else {
            targetTable.appendChild(rowElement);
        }
        if (ordersTableFull.offsetWidth < tableBreakSize) {
            rowElement.childNodes[0].classList.add('orders-table-hidden');
            rowElement.childNodes[1].classList.add('orders-table-hidden');
        }
        // + BATCH MARK +
        rowElement.childNodes[0].addEventListener('click', event => {
            batchMarkSubmit(batchNumber, 10);
        })
        rowElement.childNodes[0].addEventListener('contextmenu', event => {
            event.preventDefault();
            createBatchMenu(event, rowElement.childNodes[0], wheelstackData['batchNumber']);
        })
        // - BATCH MARK -
        // + FOCUS ORDER TARGET +
        // childNode[2] == source -> destination focus them one by one with delay
        // childNode[3] == focus source cell, only in platform and grid
        // childNode[4] == focus destination cell, only in grid (we can't move anything to platform)
        let sourceOrderFocusMessage = `Сфокусирован <b>ИСХОДНЫЙ</b> элемент участвующий в заказе <b>${orderData['_id']}</b>`;
        let sequenceMessage = `Сфокусирован элемент участвующий в заказе <b>${orderData['_id']}</b>`;
        let destOrderFocusMessage = `Сфокусирован <b>КОНЕЧНЫЙ</b> элемент участвующий в заказе <b>${orderData['_id']}</b>`;
        let sourceTargetElement = null;
        let destTargetElement = null;
        let sequenceTargets = [];
        const sourceElement = rowElement.childNodes[3];
        if (orderData && GRID_NAME === orderData['source']['placementType']) {
            let sourceTargetElementId = `${orderData['source']['rowPlacement']}|${orderData['source']['columnPlacement']}`;
            sourceTargetElement = gridContainer.querySelector(`#${CSS.escape(sourceTargetElementId)}`);
            if (sourceElement && sourceTargetElement) {
                assignGridSequenceFocus(
                    sourceElement,
                    [sourceTargetElement],
                    gridContainer,
                    [gridFocusMark, secondGridFocusMark],
                    sourceOrderFocusMessage,
                );
                sequenceTargets.push(sourceTargetElement);
            } else {
                sequenceTargets.push(null);
            }
        } else if (orderData && BASE_PLATFORM_NAME === orderData['source']['placementType']) {
            let sourceTargetElementId = `${orderData['source']['rowPlacement']}|${orderData['source']['columnPlacement']}`;
            sourceTargetElement = platformsContainer.querySelector(`#${CSS.escape(sourceTargetElementId)}`);
            if (sourceElement && sourceTargetElement) {
                assignPlatformFocus(rowElement.childNodes[2], sourceTargetElement, platformFocusMark, sequenceMessage);
                assignPlatformFocus(sourceElement, sourceTargetElement, platformFocusMark, sourceOrderFocusMessage);
            }
        }
        const destElement = rowElement.childNodes[4];
        if (orderData && GRID_NAME === orderData['destination']['placementType']) {
            let destTargetElementId = `${orderData['destination']['rowPlacement']}|${orderData['destination']['columnPlacement']}`;
            destTargetElement = gridContainer.querySelector(`#${CSS.escape(destTargetElementId)}`);
            if (destElement && destTargetElement) {
                sequenceTargets.push(destTargetElement);
                assignGridSequenceFocus(
                    destElement,
                    [destTargetElement],
                    gridContainer,
                    [gridFocusMark, secondGridFocusMark],
                    destOrderFocusMessage,
                );
            }
        }
        assignGridSequenceFocus(
            rowElement.childNodes[2],
            sequenceTargets,
            gridContainer,
            [gridFocusMark, secondGridFocusMark],
            sequenceMessage,
        );

        // - FOCUS ORDER TARGET -
        orderElements.push(rowElement);
    }
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
    // + BATCH INPUT FIELD +
    // - BATCH INPUT FIELD -
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
var focusSequence = false;
// + PLATFORM +
var gridFocusMark = new FocusMark();
var secondGridFocusMark = new FocusMark('second-focus-target');
var platformFocusMark = new FocusMark();
var ordersTable = document.getElementById('ordersTableBody');
var platformCurrentHistory = [];
var platformActiveHistoryData = {};
var platformActiveHistoryElements = null;
var platformHistoryLoading = null;
var platformBreaker = document.getElementById('platformBreaker');
var gridBreaker = document.getElementById('gridBreaker');

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
    if (platformHistoryLoading) {
        flashMessage.show({
            'message': `<b>Подождите загрузки данных прошлой записи.</b>`,
            'duration': 1000,
            'color': 'red',
        })
        return;
    }
    platformHistoryLoading = true;
    platformActiveHistoryData = await updatePlacementHistory(platformPlacement, newHistoryRecords[0]['_id']);
    platformCurrentHistory = newHistoryRecords;
    if (platformActiveHistoryData) {
        if (platformActiveHistoryElements) {
            await clearElements(platformActiveHistoryElements);
        }
        updateSearcherData(
            batchSearcher,
            prepareData('batchNumber',
                platformActiveHistoryData['batchesData'],
                 gridActiveHistoryData['batchesData']
               )
            );
        updateSearcherData(
            wheelsSearcher,
            prepareData('wheelId',
                platformActiveHistoryData['wheelsData'],
                gridActiveHistoryData['wheelsData']
            )
        )
        platformActiveHistoryElements = await createOrderRecords(
            platformActiveHistoryData, ordersTable, 'платформы', platformBreaker, gridBreaker,
        );
    }
    await switchView(platformPeriodElements, platformHistorySelectElements);
    checkButtonState(platformHistoryPreviousBut, platformHistoryNextBut, platformHistorySelector);
    const recordDate = platformActiveHistoryData['createdAt'];
    flashMessage.show({
        'message': `Данные отображения <b>ПЛАТФОРМЫ</b> изменены<br>Дата: ${convertISOToCustomFormat(recordDate, false, true, true)}`,
        'duration': 1000,
    })
    platformHistoryLoading = false;
})

const periodChangeBut = platformHistoryContainer.querySelector('#periodChange');
periodChangeBut.addEventListener('click', async (event) => {
    event.preventDefault();
    await switchView(platformHistorySelectElements, platformPeriodElements);
})

platformHistorySelector.addEventListener('change', async event => {
    if (platformHistoryLoading) {
        flashMessage.show({
            'message': `<b>Подождите загрузки данных прошлой записи.</b>`,
            'duration': 1000,
            'color': 'red',
        })
        return;
    }
    checkButtonState(platformHistoryPreviousBut, platformHistoryNextBut, platformHistorySelector);
    platformHistoryLoading = true;
    const selectedIndex = platformHistorySelector.selectedIndex;
    const historyIndex = platformHistorySelector.options[selectedIndex].value;    
    const historyRecordId = platformCurrentHistory[historyIndex]['_id'];
    platformActiveHistoryData = await updatePlacementHistory(
        platformPlacement, historyRecordId,
    )
    if (platformActiveHistoryData) {
        if (platformActiveHistoryElements) {
            await clearElements(platformActiveHistoryElements);
        }
        updateSearcherData(
            batchSearcher,
            prepareData('batchNumber',
                platformActiveHistoryData['batchesData'],
                 gridActiveHistoryData['batchesData']
               )
            );
        updateSearcherData(
            wheelsSearcher,
            prepareData('wheelId',
                platformActiveHistoryData['wheelsData'],
                gridActiveHistoryData['wheelsData']
            )
        )
        platformActiveHistoryElements = await createOrderRecords(
            platformActiveHistoryData, ordersTable, 'платформы', platformBreaker, gridBreaker,
        );
    }
    const recordDate = platformActiveHistoryData['createdAt'];
    flashMessage.show({
        'message': `Данные отображения <b>ПЛАТФОРМЫ</b> изменены<br>Дата: ${convertISOToCustomFormat(recordDate, false, true, true)}`,
        'duration': 1000,
    });
    platformHistoryLoading = false;
})

platformHistoryPreviousBut.addEventListener('click', async (event) => {
    event.preventDefault();
    if (platformHistoryLoading) {
        flashMessage.show({
            'message': `<b>Подождите загрузки данных прошлой записи.</b>`,
            'duration': 1000,
            'color': 'red',
        })
        return;
    }
    checkButtonState(platformHistoryPreviousBut, platformHistoryNextBut, platformHistorySelector);
    await shiftSelector(platformHistorySelector, -1);
})

platformHistoryNextBut.addEventListener('click', async (event) => {
    event.preventDefault();
    if (platformHistoryLoading) {
        flashMessage.show({
            'message': `<b>Подождите загрузки данных прошлой записи.</b>`,
            'duration': 1000,
            'color': 'red',
        })
        return;
    }
    checkButtonState(platformHistoryPreviousBut, platformHistoryNextBut, platformHistorySelector);
    await shiftSelector(platformHistorySelector, 1);
})
// - SLIDER -
// - PLATFORM -

// + GRID +
var gridCurrentHistory = [];
var gridActiveHistoryData = {};
var gridActiveHistoryElements = null;
var gridHistoryLoading = false;

const gridsContainer = document.getElementById('gridsContainer');
const gridContainer = document.getElementById('gridContainer');
gridContainer.addEventListener('contextmenu', event => {
    event.preventDefault();
})
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
    if (gridHistoryLoading) {
        flashMessage.show({
            'message': `<b>Подождите загрузки данных прошлой записи.</b>`,
            'duration': 1000,
            'color': 'red',
        })
        return;
    }
    gridHistoryLoading = true;
    gridActiveHistoryData = await updatePlacementHistory(gridPlacement, newHistoryRecords[0]['_id']);
    gridCurrentHistory = newHistoryRecords;
    if (gridActiveHistoryData) {
        if (gridActiveHistoryElements) {
            await clearElements(gridActiveHistoryElements);
        }
        updateSearcherData(
            batchSearcher,
            prepareData('batchNumber',
                 platformActiveHistoryData['batchesData'],
                  gridActiveHistoryData['batchesData'],
                )
            );
        updateSearcherData(
            wheelsSearcher,
            prepareData('wheelId',
                platformActiveHistoryData['wheelsData'],
                gridActiveHistoryData['wheelsData']
            )
        )
        gridActiveHistoryElements = await createOrderRecords(
            gridActiveHistoryData, ordersTable, 'приямка', gridBreaker, null
        );
    }
    await switchView(gridPeriodElements, gridHistorySelectElements);
    checkButtonState(gridHistoryPreviousBut, gridHistoryNextBut, gridHistorySelector);
    const recordDate = gridActiveHistoryData['createdAt'];
    flashMessage.show({
        'message': `Данные отображения <b>ПРИЯМКА</b> изменены<br>Дата: ${convertISOToCustomFormat(recordDate, false, true, true)}`,
        'duration': 1000,
    })
    gridHistoryLoading = false;
})

const gridPeriodChangeBut = gridHistoryContainer.querySelector('#periodChange');
gridPeriodChangeBut.addEventListener('click', async (event) => {
    event.preventDefault();
    await switchView(gridHistorySelectElements, gridPeriodElements);
})

gridHistorySelector.addEventListener('change', async event => {
    if (gridHistoryLoading) {
        flashMessage.show({
            'message': `<b>Подождите загрузки данных прошлой записи.</b>`,
            'duration': 1000,
            'color': 'red',
        })
        return;
    }
    checkButtonState(gridHistoryPreviousBut, gridHistoryNextBut, gridHistorySelector);
    gridHistoryLoading = true;
    const selectedIndex = gridHistorySelector.selectedIndex;
    const historyIndex = gridHistorySelector.options[selectedIndex].value;
    const historyRecordId = gridCurrentHistory[historyIndex]['_id'];
    gridActiveHistoryData = await updatePlacementHistory(gridPlacement, historyRecordId);
    if (gridActiveHistoryData) {
        if (gridActiveHistoryElements) {
            await clearElements(gridActiveHistoryElements);
            gridActiveHistoryElements = [];
        }
        updateSearcherData(
            batchSearcher,
            prepareData('batchNumber',
                 platformActiveHistoryData['batchesData'],
                  gridActiveHistoryData['batchesData']
                )
            );
        updateSearcherData(
            wheelsSearcher,
            prepareData('wheelId',
                platformActiveHistoryData['wheelsData'],
                gridActiveHistoryData['wheelsData']
            )
        )
        gridActiveHistoryElements = await createOrderRecords(
            gridActiveHistoryData, ordersTable, 'приямка', gridBreaker, null,
        );
    }
    const recordDate = gridActiveHistoryData['createdAt'];``
    flashMessage.show({
        'message': `Данные отображения <b>ПРИЯМКА</b> изменены<br>Дата: ${convertISOToCustomFormat(recordDate, false, true, true)}`,
        'duration': 1000,
    })
    gridHistoryLoading = false;
})


gridHistoryPreviousBut.addEventListener('click', async (event) => {
    event.preventDefault();
    if (gridHistoryLoading) {
        flashMessage.show({
            'message': `<b>Подождите загрузки данных прошлой записи.</b>`,
            'duration': 1000,
            'color': 'red',
        })
        return;
    }
    checkButtonState(gridHistoryPreviousBut, gridHistoryNextBut, gridHistorySelector);
    await shiftSelector(gridHistorySelector, -1);
})

gridHistoryNextBut.addEventListener('click', async (event) => {
    event.preventDefault();
    if (gridHistoryLoading) {
        flashMessage.show({
            'message': `<b>Подождите загрузки данных прошлой записи.</b>`,
            'duration': 1000,
            'color': 'red',
        })
        return;
    }
    checkButtonState(gridHistoryPreviousBut, gridHistoryNextBut, gridHistorySelector);
    await shiftSelector(gridHistorySelector, 1);
})
// ---
// - GRID -
// + EXTRA CONTROL BUTTONS +
const fulscreenBut = document.getElementById('fullScreen');
const foldScreenBut = document.getElementById('foldScreen');
const topContainer = document.getElementById('topContainer');
const hidePlatformBut = document.getElementById('hidePlatform');
const showPlatformBut = document.getElementById('showPlatform');

fulscreenBut.addEventListener('click', event => {
    topContainer.classList.add('hidden');
    fulscreenBut.classList.add('hidden');
    foldScreenBut.classList.remove('hidden');
    hidePlatformBut.classList.add('hidden');
    showPlatformBut.classList.add('hidden');
})

foldScreenBut.addEventListener('click', event => {
    foldScreenBut.classList.add('hidden');
    topContainer.classList.remove('hidden');
    fulscreenBut.classList.remove('hidden');
    if (platformsContainer.classList.contains('hidden')) {
        showPlatformBut.classList.remove('hidden');
    } else {
        hidePlatformBut.classList.remove('hidden');
    }
})

hidePlatformBut.addEventListener('click', event => {
    platformsContainer.classList.add('hidden');
    hidePlatformBut.classList.add('hidden');
    showPlatformBut.classList.remove('hidden');
    triggerResize(window);
})

showPlatformBut.addEventListener('click', event => {
    hidePlatformBut.classList.remove('hidden');
    showPlatformBut.classList.add('hidden');
    platformsContainer.classList.remove('hidden');
    triggerResize(window);
})
// - EXTRA CONTROL BUTTONS -
// + INPUT FIELDS +
const prepareData = (key, ...dataSources) => {
    let newData = [];
    dataSources.forEach(dataSource => {
        if (!dataSource) {
            return;
        }
        if (dataSource instanceof Object) {
            newData = [...newData, ...Object.values(dataSource)];
            return;
        }
        newData = [...newData, ...dataSource];
    });
    let uniqueData = new Set();
    if (key) {
        for (let record of newData) {
            uniqueData.add(record[key]);
        }
    }
    uniqueData = Array.from(uniqueData);
    return uniqueData;
};

const clearMarking = (marker) => {
    marker.clearMarking();
}

const updateSearcherData = (searcher, newData) => {
    searcher.setData(newData);
}

const focusChosenWheel = (wheelId) => {
    const curTargets = Array.from(document.querySelectorAll(`[data-wheels]`)).filter(element => {
        const attrValue = element.getAttribute('data-wheels');
        const valueList = attrValue.split(';');
        return valueList.includes(wheelId);
    });
    // There should be only 1 element with wheelId.
    curTargets.forEach( target => {
        if (gridContainer.contains(target)) {
            const newTranslationData = gridFocusMark.centerElementInContainer(
                gridContainer.childNodes[0],
                gridContainer,
                target,
            );
            // ZoomAndDrag saves it's direction as Class value, we need to adjust it.
            zoomer.translation.x = newTranslationData['newX'];
            zoomer.translation.y = newTranslationData['newY'];
            zoomer.translation.scale = newTranslationData['newScale'];
        } else if (platformsContainer.contains(target)) {
            platformFocusMark.higlightElement(target);
        }
        flashMessage.show({
            'message': `Сфокисурована стопка содержащая колесо: <b>${wheelId}</b>`,
            'color': '#013565',
        })
    })
}
//  + BATCH FIELD +
export const batchMarker = new AttributeMark('batch-mark');
const batchOptions = {
    threshold: 0.4,
    distance: 5,
    ignoreLocation: true,
    minMatchCharLength: 1 
};
const batchSearchForm = document.getElementById('batchSearchForm');
const batchSearchField = document.getElementById('batchSearchField');
const batchResultContainer = document.getElementById('batchResults');
const batchClearButton = document.getElementById('clearBatchSearch');

const batchMarkSubmit = (targetValue, markTimeout = 90) => {
    if (targetValue && '' !== targetValue.trim()) {
        batchMarker.clearMarking();
        batchMarker.setRules('data-batch-number', targetValue);
        batchMarker.markTargets(true, markTimeout);
    }
}

const batchMenuOpener = async (event, openerElement, targetBatchNumber) => {
    if (!targetBatchNumber) {
        return;
    }
    // gridActiveHistoryData
    // platformActiveHistoryData
    // TODO: We should use separated search fields, or combine grid + platform.
    //  Because we can have a situation, where grid will have batch with later date or vice versa.
    let menu = null;
    if (targetBatchNumber in gridActiveHistoryData['batchesData']) {
        menu = await createBatchMenu(event, openerElement, gridActiveHistoryData['batchesData'][targetBatchNumber]);
    } else if (targetBatchNumber in platformActiveHistoryData['batchesData']) {
        menu = await createBatchMenu(event, openerElement, platformActiveHistoryData['batchesData'][targetBatchNumber]);
    }
    return menu;
}

const batchSearcher = new BasicSearcher(
    batchSearchForm,
    batchSearchField,
    batchClearButton,
    batchResultContainer,
    batchMarkSubmit,
    () => clearMarking(batchMarker),
    batchMenuOpener,
);
batchSearcher.setOptions(batchOptions);
//  - BATCH FIELD -
// + WHEELS FIELD +
export const wheelsMarker = new AttributeMark('wheels-mark');
const wheelsOptions = {
    threshold: 0.4,
    distance: 5,
    ignoreLocation: true,
    minMatchCharLength: 1,
};
const wheelsSearchForm = document.getElementById('wheelsSearchForm');
const wheelsSearchField = document.getElementById('wheelsSearchField');
const wheelsResultContainer = document.getElementById('wheelsResults');
const wheelsClearButton = document.getElementById('clearWheelsSearch');

const wheelsMarkSubmit = (targetValue) => {
    if (targetValue && '' !== targetValue.trim()) {
        wheelsMarker.clearMarking();
        wheelsMarker.setRules('data-wheels', targetValue);
        wheelsMarker.markTargets(true);
        focusChosenWheel(targetValue)
    }
}

const wheelsSearcher = new BasicSearcher(
    wheelsSearchForm,
    wheelsSearchField,
    wheelsClearButton,
    wheelsResultContainer,
    wheelsMarkSubmit,
    () => clearMarking(wheelsMarker),
);
wheelsSearcher.setOptions(wheelsOptions);
// - WHEELS FIELD -
// - INPUT FIELDS -


