import Placement from "./placement/placement.js";
import { getRequest } from "../../utility/basicRequests.js";
import {
    BACK_URL,
    BASIC_PMK_PLATFORM_PRESET,
    BASIC_PMK_GRID_PRESET,
    AUTH_COOKIE_NAME,
    loginPage,
    RESTRICTED_TO_THIS_ROLE,
    USER_ROLE_COOKIE_NAME,
    BASIC_COOKIES,
    HISTORY_PAGE_ROLES,
    NAV_BUTTONS,
    USER_ROLE_COOKIE_UPDATE_INTERVAL,
} from "../../uniConstants.js";
import { keepAuthCookieFresh, clearRedirect, validateRoleCookie, getCookie } from "../../utility/roleCookies.js";
import NavigationButton from "../../utility/navButton/navButton.js";
import CellHoverCoordinate from "../../utility/cellHover/cellHoverCoordinate.js";
import ZoomAndDrag from "../../utility/zoomDrag.js";
import flashMessage from "../../utility/flashMessage/flashMessage.js";
import { getISOFormatUTC, convertToUTC } from "../../utility/timeConvert.js";
import convertISOToCustomFormat from "../../utility/convertToIso.js";


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
// TODO: Check what can be moved to unils.
const getPlacementHistory = async (url, queries) => {
    let requestUrl = `${url}?`;
    for (let [query, value] of Object.entries(queries)) {
        requestUrl = `${requestUrl}${query}=${value}&`;
    }
    const response = await getRequest(requestUrl, true, true);
    const responseData = await response.json();
    return responseData;
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
        return [null, null];
    }
    if (!periodStart && !periodEnd) {
        flashMessage.show({
            'message': 'Не выбраны данные периода. Автоматический выбор последних 24 часов',
        });
        const shift = 60 * 60 * 24
        periodStart = getISOFormatUTC(-shift);
        periodEnd = getISOFormatUTC();
    } else if (!periodStart) {
        flashMessage.show({
            'message': 'Не выбрано начало периода. Автоматический выбор смещения на 24 часа',
        })
        const shift = 60 * 60 * 24
        const periodEndObject = new Date(periodEnd);
        periodEndObject.setSeconds(periodEndObject.getSeconds() - shift);
        periodStart = periodEndObject.toISOString().replace('Z','+00:00');
    } else if (!periodEnd) {
        flashMessage.show({
            'message': 'Не выбрано окончание периода. Автоматический выбор смещения на 24 часа',
        })
        const shift = 60 * 60 * 24
        const periodStartObject = new Date(periodStart);
        periodStartObject.setSeconds(periodStartObject.getSeconds() + shift);
        periodEnd = periodStartObject.toISOString().replace('Z', '+00:00');
    }
    periodStart = convertToUTC(periodStart);
    periodEnd = convertToUTC(periodEnd);
    return [periodStart, periodEnd];
}

// + PLATFORM +
var platformCurrentHistory = [];

const getPlatforms = async (url) => {
    const allRecordsResponse = await getRequest(url, true, true);
    const allRecordsData = await allRecordsResponse.json();
    return allRecordsData;
}


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
    const platformRecords = await  getPlatforms(getPlatformsURL);
    platformSelector.innerHTML = '';
    platformRecords.forEach( async record => {
        const newOption = await createOption(record['name'], record['name']);
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

switchPlatformViewBut.addEventListener('click', async (event) => {
    event.preventDefault();
    if (platformView) {
        await switchView(platformPlacementActiveElements, platformSelectActiveElements);
    } else {
        await switchView(platformSelectActiveElements, platformPlacementActiveElements);
    }
    
    platformView = !platformView
})

// + SLIDER +
// True == period view | False == date selector view
var sliderView = true; 
const platformHistoryDateInputGroup = platformHistorySlider.querySelector('#dateInput');
const platformHistoryLoadDataButton = platformHistorySlider.querySelector('#loadData');
const platformHistoryStartDate = platformHistorySlider.querySelector('#startDateTime');
const platformHistoryEndDate = platformHistorySlider.querySelector('#endDateTime');
const choosePeriodElements = new Set([
    platformHistoryDateInputGroup,
])
const platformHistoryContainer = platformHistorySlider.querySelector('#platformHistory');
const chooseDataElements = new Set([
    platformHistoryContainer,
])
const platformHistorySelector = platformHistoryContainer.querySelector('#platformsHistorySelector');
const platformHistoryPreviousBut = platformHistoryContainer.querySelector('#prevRecord');
const platformHistoryNextBut = platformHistoryContainer.querySelector('#nextRecord');

const platformHistoryDataURL = `${BACK_URL.GET_PLACEMENT_HISTORY}`;
// TODO: Change to universal, because we can use everything independent.
platformHistoryLoadDataButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const placementId = platformPlacement.placementId;
    if (!placementId) {
        flashMessage.show({
            'message': 'Не выбрано расположение',
        })
        return;
    }
    let startDate = platformHistoryStartDate.value;
    let endDate = platformHistoryEndDate.value;
    [startDate, endDate] = await correctDatePeriod(startDate, endDate);
    if (!startDate && !endDate) {
        return;
    }
    const queries = {
        'include_data': false,
        'period_start': encodeURIComponent(startDate),
        'period_end': encodeURIComponent(endDate),
        'placementId': placementId,
    }
    platformCurrentHistory = await getPlacementHistory(platformHistoryDataURL, queries);
    const optionsData = {}
    for (let index = 0; index < platformCurrentHistory.length; index += 1) {
        const optionValue = index;
        const optionName = platformCurrentHistory[index]['createdAt'];
        const corDate = convertISOToCustomFormat(optionName, false, true, true);
        optionsData[corDate] = optionValue;
    }
    await populateSelector(platformHistorySelector, optionsData);
    await switchView(choosePeriodElements, chooseDataElements);
})

const periodChangeBut = platformHistoryContainer.querySelector('#periodChange');
periodChangeBut.addEventListener('click', async (event) => {
    event.preventDefault();
    await switchView(chooseDataElements, choosePeriodElements);
})

// TODO: change both to universal, just parge selector as argument.
platformHistoryPreviousBut.addEventListener('click', async (event) => {
    event.preventDefault();
    console.log(platformCurrentHistory);
    if (platformHistorySelector.selectedIndex > 0) {
        platformHistorySelector.selectedIndex -= 1;
        console.log(platformHistorySelector.selectedIndex);
        let index = platformHistorySelector.selectedIndex;
        let historyRecord = platformHistorySelector.options[index].value;
        console.log(platformCurrentHistory[historyRecord]);
        // async populatePlacement()
    }
})

platformHistoryNextBut.addEventListener('click', async (event) => {
    event.preventDefault();
    console.log(platformCurrentHistory);
    if (platformHistorySelector.selectedIndex < platformHistorySelector.options.length - 1) {
        platformHistorySelector.selectedIndex += 1;
        console.log(platformHistorySelector.selectedIndex);
        let index = platformHistorySelector.selectedIndex;
        let historyRecord = platformHistorySelector.options[index].value;
        console.log(historyRecord);
        console.log(platformCurrentHistory[historyRecord]);
    }
})

// - SLIDER -

// - PLATFORM -

var gridCurrentHistory = [];



// document.addEventListener('DOMContentLoaded', async () => {



//     const platformPresetDataURL = `${BACK_URL.GET_PRESET_DATA_BY_NAME}/${BASIC_PMK_PLATFORM_PRESET}`;
//     const platformPresetResponse = await getRequest(platformPresetDataURL, true, true);
//     const platformPresetData = await platformPresetResponse.json();
//     platformPlacement.buildPreset(platformPresetData, false);
//     // - PLATFORM -
//     // + GRID + 
//     const gridContainer = document.getElementById('gridsContainer');
//     const gridPlacement = new Placement('grid');
//     gridContainer.appendChild(gridPlacement.element);
//     const gridPresetDataURL = `${BACK_URL.GET_PRESET_DATA_BY_NAME}/${BASIC_PMK_GRID_PRESET}`;
//     const gridPresetResponse = await getRequest(gridPresetDataURL, true, true);
//     const gridPresetData = await gridPresetResponse.json();
//     gridPlacement.buildPreset(gridPresetData, true);
//     const zoomer = new ZoomAndDrag({
//         'grid': gridPlacement.element,
//         'viewport': gridContainer, 
//     })
//     // - GRID -
//     // + PLATFORM HISTORY + 
//     const platformHistoryContainer = document.getElementById('platformSlider');
//     const platformStartDate = platformHistoryContainer.querySelector('#startDateTime');
//     const platformEndDate = platformHistoryContainer.querySelector('#endDateTime');
//     const platformLoadButton = platformHistoryContainer.querySelector('#loadData');
//     platformHistoryDataURL = `${BACK_URL.GET_PLACEMENT_HISTORY}`;
//     platformLoadButton.addEventListener('click', (event) => {
//         event.preventDefault();
//         const startDate = platformStartDate.value;
//         const endDate = platformEndDate.value;
//         const queries = {
//             'include_data': true,
//             'period_start': startDate,
//             'period_end': endDate,
//             'placementId': platformPlacement,
//         }
//         platformCurrentHistory = getPlacementHistory(platformHistoryDataURL, queries);
//     } )
    
//     // * GATHER DATA *
//     const getPlacementHistory = (dataUrl, queries) => {
//         console.log('start: ', startDate, '\nend: ', endDate);
//         // const
//     }
//     // ---
//     // - PLATFORM HISTORY -

// })