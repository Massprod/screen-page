
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
}

export const BASIC_PRESET_NAMES = {
    PMK_PLATFORM: "pmkBasePlatform",
    PMK_GRID: "pmkGrid",
}

export const TEST_PLATFORM_NAME = "test";
export const TEST_GRID_NAME = "test2";

export const UPDATE_PERIODS = {
    BASE_PLATFORM: 500,
    GRID: 500,
}
