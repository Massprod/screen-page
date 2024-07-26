
// TODO: No REact => No ENV => No security
export const BACK_URLS = {
    GET_PRESET_BY_NAME: "http://127.0.0.1:8000/presets/by_name",
    GET_PLATFORM_CELLS_DATA_BY_NAME: "http://127.0.0.1:8000/platform/name",
    GET_CELL_ELEMENT_DATA_BY_ID: "http://127.0.0.1:8000/wheelstacks/id",
    GET_CELL_ELEMENT_LAST_CHANGE_BY_ID: "http://127.0.0.1:8000/wheelstacks/change_time",
    GET_PLATFORM_LAST_CHANGE_BY_ID: "http://127.0.0.1:8000/platform/change_time",
}

export const BASIC_PRESET_NAMES = {
    PMK_PLATFORM: "pmkBasePlatform",
    PMK_GRID: "pmkGrid",
}

export const TEST_PLATFORM_GRID_NAME = "test";


export const CLASS_NAMES = {
    BASE_PLATFORM: 'base-platform',
}


export const UPDATE_PERIODS = {
    BASE_PLATFORM: 500,
}

