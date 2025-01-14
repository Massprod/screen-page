import {
     BACK_URLS, GRID_NAME, TESTS_FAILED, TESTS_NOT_DONE, FLASH_MESSAGES,
     ORDER_MOVE_TO_REJECTED, ORDER_MOVE_TO_PROCESSING, 
     LABORATORY_NAME,
     ORDER_MOVE_TO_LABORATORY,
     ORDER_MOVE_WHOLE_STACK,
     STORAGE_NAME,
     ORDER_MOVE_TO_STORAGE,
     ORDER_MERGE_WHEELSTACKS,
} from "../managerPage/js/constants.js";
import { postRequest } from "../utility/basicRequests.js";
import flashMessage from "./flashMessage/flashMessage.js";


async function checkProRejOrderResponse(response) {
    if (response.ok) {
        return;
    }
    const respData = await response.json();
    const respDetail = respData['detail'];
    if (respDetail === TESTS_NOT_DONE) {
        flashMessage.show({
            message: `Партия ещё не проходила испытания.<br><b>Запрет использования вне приямка.</b>`,
            color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
            backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
            position: 'top-center',
            duration: 5000,
        })
    } else if (respDetail === TESTS_FAILED) {
        flashMessage.show({
            message: `Партия не прошла испытания.<br><b>Запрет отправки на обработку.</b>`,
            color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
            backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
            position: 'top-center',
            duration: 5000,
        })
    } else {
        flashMessage.show({
            message: `Ошибка при создании заказа: ${response.status}`,
            color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
            backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
            position: 'top-center',
            duration: 3000,
        });
    }
}

export async function createOrderMoveWholestackToStorageFromStorage(elementData, storageId) {
    let createOrderURL = `${BACK_URLS.POST_STORAGE_MOVE_FROM}`;
    let orderName = `AutoGenerated-${ORDER_MOVE_WHOLE_STACK}`;
    let orderDescription = `AutoGenerated-${ORDER_MOVE_WHOLE_STACK}`;
    const createOrderBody = {
        'orderName': orderName,
        'orderDescription': orderDescription,
        'source': {
            'storageId': elementData['placement']['placementId'],
            'wheelstackId': elementData['_id'],
        },
        'destination': {
            'placementType': STORAGE_NAME,
            'placementId': storageId,
            'rowPlacement': '0',
            'columnPlacement': '0',
        },
        'orderType': ORDER_MOVE_TO_STORAGE,
    };
    const args = {
        'method': 'POST',
        'body': JSON.stringify(createOrderBody),
    }
    const resp = await postRequest(createOrderURL, false, true, args);
    if (!resp.ok) {
        flashMessage.show({
            message: `Ошибка при создании переноса стопы в хранилище: ${resp.status}`
        });
    }
}


export async function createOrderMoveWholestackToStorage(elementData, storageId = null, storageName = null) {
    let createOrderURL = `${BACK_URLS.POST_STORAGE_MOVE_TO}`;
    let orderName = `AutoGenerated-${ORDER_MOVE_WHOLE_STACK}`;
    let orderDescription = `AutoGenerated-${ORDER_MOVE_WHOLE_STACK}`;
    const createOrderBody = {
        'orderName': orderName,
        'orderDescription': orderDescription,
        'source': {
            'placementType': elementData['placement']['type'],
            'placementId': elementData['placement']['placementId'],
            'rowPlacement': elementData['rowPlacement'],
            'columnPlacement': elementData['colPlacement'],
        },
    };
    if (storageId) {
        createOrderBody['storage'] = storageId;
    } else if (storageName) {
        createOrderBody['storageName'] = storageName;
    }
    const args = {
        'method': 'POST',
        'body': JSON.stringify(createOrderBody),
    }
    const resp = await postRequest(createOrderURL, false, true, args);
    if (!resp.ok) {
        flashMessage.show({
            message: `Ошибка при создании переноса стопы в хранилище: ${resp.status}`
        });
    }
}


export async function createOrderMoveWholestackFromBaseGrid(elementData, destinationData, mergeType = false) {
    let createOrderURL = `${BACK_URLS.CREATE_MOVE_WHOLE_ORDER}`;
    let orderName = `AutoGenerated-${ORDER_MOVE_WHOLE_STACK}`;
    let orderDescription = `AutoGenerated-${ORDER_MOVE_WHOLE_STACK}`;
    const createOrderBody = {
        'orderName': orderName,
        'orderDescription': orderDescription,
        'source': {
            'placementType': elementData['placement']['type'],
            'placementId': elementData['placement']['placementId'],
            'rowPlacement': elementData['rowPlacement'],
            'columnPlacement': elementData['colPlacement'],
        },
        'destination': {
            'placementType': destinationData['destinationType'],
            'placementId': destinationData['destinationId'],
            'rowPlacement': destinationData['destinationRow'],
            'columnPlacement': destinationData['destinationCol'],
        },
    }
    createOrderBody['orderType'] = ORDER_MOVE_WHOLE_STACK;
    if (mergeType) {
        createOrderBody['orderType'] = ORDER_MERGE_WHEELSTACKS;
    }
    const args = {
        'method': 'POST',
        'body': JSON.stringify(createOrderBody),
    }
    const resp = await postRequest(createOrderURL, false, true, args);
    if (!resp.ok) {
        flashMessage.show({
            message: `Ошибка при создании переноса стопы: ${resp.status}`
        });
    }
}

export async function createOrderMoveWholestackFromStorage(elementData, destinationData, mergeType = false) {
    let createOrderURL = `${BACK_URLS.POST_STORAGE_MOVE_FROM}`;
    let orderName = `AutoGenerated-${ORDER_MOVE_WHOLE_STACK}`;
    let orderDescription = `AutoGenerated-${ORDER_MOVE_WHOLE_STACK}`;
    const createOrderBody = {
        'orderName': orderName,
        'orderDescription': orderDescription,
        'source': {
            'storageId': elementData['placement']['placementId'],
            'wheelstackId': elementData['_id'],
        },
        'destination': {
            'placementType': destinationData['destinationType'],
            'placementId': destinationData['destinationId'],
            'rowPlacement': destinationData['destinationRow'],
            'columnPlacement': destinationData['destinationCol'],
        },
    };
    createOrderBody['orderType'] = ORDER_MOVE_WHOLE_STACK;
    if (mergeType) {
        createOrderBody['orderType'] = ORDER_MERGE_WHEELSTACKS;
    };
    const args = {
        'method': 'POST',
        'body': JSON.stringify(createOrderBody),
    }
    const resp = await postRequest(createOrderURL, false, true, args);
    if (!resp.ok) {
        flashMessage.show({
            message: `Ошибка при создании переноса стопы: ${resp.status}`
        });
    }
}


export async function createProRejOrderBulk(
    elementData, extraElement, processing,
    destinationId, fromEverywhere = true, virtualPosition = 0,
) {
    let createOrderURL = `${BACK_URLS.CREATE_MOVE_TO_BULK_PRO_REJ_ORDERS}/?from_everywhere=${fromEverywhere}`;
    let orderName = `AutoGenerated-${ORDER_MOVE_TO_PROCESSING}`;
    let orderDesc = `AutoGenerated-${ORDER_MOVE_TO_PROCESSING}`;
    if (!processing) {
        orderName = `AutoGenerated-${ORDER_MOVE_TO_REJECTED}`;
        orderDesc = `AutoGenerated-${ORDER_MOVE_TO_REJECTED}`;
    };
    const createOrderBody = {
        'orderName': orderName,
        'orderDescription': orderDesc,
        'batchNumber': elementData['batchNumber'],
        'placementId': elementData['placement']['placementId'],
        'placementType': elementData['placement']['type'],
        'destination': {
            'placementType': GRID_NAME,
            'placementId': destinationId,
            'elementName': extraElement,
        },
        'orderType': ORDER_MOVE_TO_PROCESSING,
        'virtualPosition': virtualPosition,
    };
    if (!processing) {
        createOrderBody['orderType'] = ORDER_MOVE_TO_REJECTED;
    };
    const args = {
        'method': 'POST',
        'body': JSON.stringify(createOrderBody),
    };
    const resp = await postRequest(createOrderURL, false, true, args);
    await checkProRejOrderResponse(resp);
}


export async function createProRejOrderGrid(
    elementData, extraElement, processing, destinationId, virtualPosition = 0,
) {
    let createOrderURL = `${BACK_URLS.CREATE_MOVE_TO_PROCESSING_ORDER}`;
    let orderName = `AutoGenerated-${ORDER_MOVE_TO_PROCESSING}`;
    let orderDesc = `AutoGenerated-${ORDER_MOVE_TO_PROCESSING}`;
    if (!processing) {
        createOrderURL = `${BACK_URLS.CREATE_MOVE_TO_REJECTED_ORDER}`;
        orderName = `AutoGenerated-${ORDER_MOVE_TO_REJECTED}`;
        orderDesc = `AutoGenerated-${ORDER_MOVE_TO_REJECTED}`;
    }
    const createOrderBody = {
        "orderName": orderName,
        "orderDescription": orderDesc,
        "source": {
            "placementType": elementData['placement']['type'],
            "placementId": elementData['placement']['placementId'],
            "rowPlacement": elementData['rowPlacement'],
            "columnPlacement": elementData['colPlacement'],
        },
        "destination": {
            "placementType": GRID_NAME,
            "placementId": destinationId,
            "elementName": extraElement,
        },
        'virtualPosition': virtualPosition,
    };
    const args = {
        'method': 'POST',
        'body': JSON.stringify(createOrderBody),
    }
    const resp = await postRequest(createOrderURL, false, true, args);
    await checkProRejOrderResponse(resp);
}


export async function createProRejOrderStorage(elementData, extraElement, processing, destinationId) {
    let createOrderURL = `${BACK_URLS.POST_STORAGE_MOVE_FROM}`;
    let orderName = `AutoGenerated-${ORDER_MOVE_TO_PROCESSING}`;
    let orderDesc = `AutoGenerated-${ORDER_MOVE_TO_PROCESSING}`;
    if (!processing) {
        orderName = `AutoGenerated-${ORDER_MOVE_TO_REJECTED}`;
        orderDesc = `AutoGenerated-${ORDER_MOVE_TO_REJECTED}`;
    }
    const createOrderBody = {
        'orderName': orderName,
        'orderDescription': orderDesc,
        'source': {
            'storageId': elementData['placement']['placementId'],
            'wheelstackId': elementData['_id'],
        },
        'destination': {
            'placementType': GRID_NAME,
            'placementId': destinationId,
            'rowPlacement': 'extra',
            'columnPlacement': extraElement,
        },
        'orderType': ORDER_MOVE_TO_PROCESSING,
    }
    if (!processing) {
        createOrderBody['orderType'] = ORDER_MOVE_TO_REJECTED;
    }
    const args = {
        'method': 'POST',
        'body': JSON.stringify(createOrderBody),
    }
    const resp = await postRequest(createOrderURL, false, true, args);
    await checkProRejOrderResponse(resp);
}

export async function createLaboratoryOrderGrid(elementData, chosenWheel, destinationId) {
    let createOrderURL = `${BACK_URLS.CREATE_MOVE_TO_LAB_ORDER}`;
    let orderName = `AutoGenerated-${ORDER_MOVE_TO_LABORATORY}`;
    let orderDesc = `AutoGenerated-${ORDER_MOVE_TO_LABORATORY}`;
    const createOrderBody = {
        'orderName': orderName,
        'orderDescription': orderDesc,
        'source': {
            'placementType': elementData['placement']['type'],
            'placementId': elementData['placement']['placementId'],
            'rowPlacement': elementData['rowPlacement'],
            'columnPlacement': elementData['colPlacement'],
        },
        'destination': {
            'placementType': GRID_NAME,
            'placementId': destinationId,
            'elementName': LABORATORY_NAME,
        },
        'chosenWheel': chosenWheel,
    };
    const args = {
        'method': 'POST',
        'body': JSON.stringify(createOrderBody),
    }
    const resp = await postRequest(createOrderURL, false, true, args);
    if (!resp.ok) {
        flashMessage.show({
            message: `Ошибка при создании заказа: ${resp.status}`
        });
    }
}

export async function createLaboratoryOrderStorage(elementData, chosenWheel, destinationId) {
    let createOrderURL = `${BACK_URLS.POST_STORAGE_MOVE_FROM}`;
    let orderName = `AutoGenerated-${ORDER_MOVE_TO_LABORATORY}`;
    let orderDesc = `AutoGenerated-${ORDER_MOVE_TO_LABORATORY}`;
    const createOrderBody = {
        'orderName': orderName,
        'orderDescription': orderDesc,
        'source': {
            'storageId': elementData['placement']['placementId'],
            'wheelstackId': elementData['_id'],
        },
        'destination': {
            'placementType': GRID_NAME,
            'placementId': destinationId,
            'rowPlacement': 'extra',
            'columnPlacement': LABORATORY_NAME,
        },
        'orderType': ORDER_MOVE_TO_LABORATORY,
        'chosenWheel': chosenWheel,
    }
    const args = {
        'method': 'POST',
        'body': JSON.stringify(createOrderBody),
    }
    const resp = await postRequest(createOrderURL, false, true, args);
    if (!resp.ok) {
        flashMessage.show({
            message: `Ошибка при создании заказа: ${resp.status}`
        });
    }
}