
const mainAddress = "http://127.0.0.1:8000";

// TODO: No REact => No ENV => No security
export const BACK_URLS = {
    // PRESET
    GET_PRESET_BY_NAME: `${mainAddress}/presets/by_name`,
    // PLATFORM
    GET_PLATFORM_LAST_CHANGE_BY_ID: `${mainAddress}/platform/change_time`,
    GET_PLATFORM_CELLS_DATA_BY_NAME: `${mainAddress}/platform/name`,
    // CELL
    GET_CELL_ELEMENT_DATA_BY_ID: `${mainAddress}/wheelstacks/id`,
    GET_CELL_ELEMENT_LAST_CHANGE_BY_ID: `${mainAddress}/wheelstacks/change_time`,
    // GRID
    GET_GRID_LAST_CHANGE_BY_ID: `${mainAddress}/grid/change_time`,
    GET_GRID_CELLS_DATA_BY_NAME: `${mainAddress}/grid/name`, 
    // ORDERS
    GET_ORDER_DATA_BY_ID: `${mainAddress}/orders/order`
}

export const BASIC_PRESET_NAMES = {
    PMK_PLATFORM: "pmkBasePlatform",
    PMK_GRID: "pmkGrid",
}

export const TEST_PLATFORM_NAME = "test";
export const TEST_GRID_NAME = "test2";

export const ORDER_CLICKABLE_ROW_CLASSES = {
    'extra-element-expanded-row': true,
}


export const FLASH_MESSAGES = {
    FETCH_ERROR_BG_COLOR: 'white',
    FETCH_ERROR_FONT_COLOR: 'red',
    FETCH_ERROR_DURATION: 1500,
    FETCH_NOT_FOUND_BG_COLOR: 'black',
    FETCH_NOT_FOUND_FONT_COLOR: 'white',
    FETCH_NOT_FOUND_DURATION: 1000,
}

export const ORDER_TYPES_TRANSLATE = {
    "moveWholeStack": "Перенос стопки",
    "moveTopWheel": "Перенос верхнего колеса",
    "moveToLaboratory": "Перенос в лабораторию",
    "mergeWheelStacks": "Объединение стопок",
    "moveToProcessing": "Перенос в обработку",
    "moveToRejected": "Перенос в брак",   
}


export const UPDATE_PERIODS = {
    BASE_PLATFORM: 500,
    GRID: 500,
    EXTRA_ELEMENT_ORDERS_CONTAINER: 500,
}
