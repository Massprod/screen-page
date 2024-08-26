
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
    GET_ORDER_DATA_BY_ID: `${mainAddress}/orders/order`,
    COMPLETE_ORDER_BY_ID: `${mainAddress}/orders/complete`,
    CANCEL_ORDER_BY_ID: `${mainAddress}/orders/cancel`,
    GET_ALL_ORDERS_DATA: `${mainAddress}/orders/all`,
    CREATE_MOVE_WHOLE_ORDER: `${mainAddress}/orders/create/move`,
    CREATE_MOVE_TO_PROCESSING_ORDER: `${mainAddress}/orders/create/process`,
    CREATE_MOVE_TO_BULK_PRO_REJ_ORDERS: `${mainAddress}/orders/create/bulk`,
    CREATE_MOVE_TO_REJECTED_ORDER: `${mainAddress}/orders/create/reject`, 
    CREATE_MOVE_TO_LAB_ORDER: `${mainAddress}/orders/create/laboratory`,
    // WHEELSTACK
    GET_WHEELSTACK_DATA_BY_ID: `${mainAddress}/wheelstacks/id`,
    // BATCH_NUMBER
    GET_BATCH_NUMBER_DATA_BY_ID: `${mainAddress}/batch_number/batch_number`,
    // WHEELS
    GET_WHEEL_DATA_BY_OBJECT_ID: `${mainAddress}/wheels/object_id`,
    // STORAGES
    GET_ALL_STORAGES: `${mainAddress}/storages/all`,
    GET_STORAGE: `${mainAddress}/storages`,
    POST_STORAGE_MOVE_TO: `${mainAddress}/orders/create/storage/move_to`,
    POST_STORAGE_MOVE_FROM: `${mainAddress}/orders/create/storage/move_from`,
    PATCH_CLEAR_EMPTY_BATCHES_STORAGES: `${mainAddress}/storages/clear`,
    
}

export const ELEMENT_TYPES = {
    WHEELSTACK: 'wheelstack',
}

export const BASIC_PRESET_NAMES = {
    PMK_PLATFORM: "pmkBasePlatform",
    PMK_GRID: "pmkGrid",
}

export const TEST_PLATFORM_NAME = "pmkBase1";
export const TEST_GRID_NAME = "pmkGrid1";

export const ORDER_CLICKABLE_ROW_CLASSES = {
    'extra-element-expanded-row': true,
}

export const LABORATORY_NAME = "laboratory";
export const GRID_NAME = 'grid';
export const BASE_PLATFORM_NAME = 'basePlatform';
export const STORAGE_NAME = 'storage';
export const SHIPPED = 'shipped';
export const EXTRA_ELEMENT_NAME = 'extra';

export const TESTS_NOT_DONE = "TESTS_NOT_DONE";
export const TESTS_FAILED = "TESTS_FAILED";

export const ORDER_MOVE_TO_PROCESSING = "moveToProcessing";
export const ORDER_MOVE_TO_REJECTED = "moveToRejected";
export const ORDER_MOVE_TO_LABORATORY = 'moveToLaboratory';
export const ORDER_MOVE_WHOLE_STACK = 'moveWholeStack';
export const ORDER_MOVE_TO_STORAGE = 'moveToStorage';

export const PLACEMENT_TYPES = {
    "grid": "Приямок",
    "basePlatform": "Челнок",
    'storage': "Хранилище",
    'laboratory': "Лаборатория",
}

export const MANAGER_ROLE_NAME = 'MANAGER';
export const OPERATOR_ROLE_NAME = 'OPERATOR';


export const FLASH_MESSAGES = {
    FETCH_ERROR_BG_COLOR: 'white',
    FETCH_ERROR_FONT_COLOR: 'red',
    FETCH_ERROR_DURATION: 1500,
    FETCH_NOT_FOUND_BG_COLOR: 'black',
    FETCH_NOT_FOUND_FONT_COLOR: 'white',
    FETCH_NOT_FOUND_DURATION: 1000,
}

export const ORDER_TYPES_TRANSLATE_TABLE = {
    "moveWholeStack": "Перемещение<br>в приямке",
    "moveTopWheel": "Перенос верхнего колеса",
    "moveToLaboratory": "Лаборатория",
    "mergeWheelStacks": "Объединение стопок",
    "moveToProcessing": "Обработка",
    "moveToRejected": "Отказ",
    "moveToStorage": "Хранилище",
}

export const ORDER_TYPES_TRANSLATE = {
    "moveWholeStack": "Перемещение в приямке",
    "moveTopWheel": "Перенос верхнего колеса",
    "moveToLaboratory": "Лаборатория",
    "mergeWheelStacks": "Объединение стопок",
    "moveToProcessing": "Обработка",
    "moveToRejected": "Отказ",
    "moveToStorage": "Хранилище",
}

export const ORDERS_TABLE_COLUMNS_TRANSLATE = {
    "batchNumber": "Номер партии",
    "orderId": "Номер заказа",
    "orderType": "Тип заказа",
    "source": "Исходная",
    "destination": "Конечная",
    "createdAt": "Время поступления",
}

export const UPDATE_PERIODS = {
    BASE_PLATFORM: 200,
    GRID: 200,
    EXTRA_ELEMENT_ORDERS_CONTAINER: 300,
    ORDERS_TABLE_UPDATE_RATE: 300,
    STORAGE_ROWS: 200,
    STORAGE_BATCHES_ROWS: 200,
    BATCHES_WHEELSTACK_ROWS: 200,
    ELEMENT_MENU: 100,
    SOURCE_MARKING: 50,
}
