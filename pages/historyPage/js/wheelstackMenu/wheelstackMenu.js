import { BACK_URL } from "../../../uniConstants.js";
import { getRequest } from "../../../utility/basicRequests.js";
import updateMenuPosition from "../../../utility/adjustContainerPosition.js";
import { batchMarker } from "../../../historyPage/js/main.js";
import flashMessage from "../../../utility/flashMessage/flashMessage.js";



const focusTableOrder = async (orderId) => {
    const targetRow = ordersTable.querySelector(`tbody #${CSS.escape(orderId)}`);
    if (!targetRow) {
        flashMessage.show({
            'message': `В таблице не найден заказ с номером: ${orderId}`,
            'color': 'red',
            'duration': 1000,
        })
        return;
    }
    targetRow.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    targetRow.classList.add('basic-focus');
    setTimeout( () => {
        targetRow.classList.remove('basic-focus');
        flashMessage.show({
            'message': `Снято выделение заказа: ${orderId}`,
            'duration': 1500,
        })
    }, 2000)
}

const menuCloser = async (event, openerElement, menuElement, boundCloser) => {
    if (event.target === menuElement || menuElement.contains(event.target)) {
        return;   
    }
    menuElement.classList.add('hide');
    setTimeout(() => {
        menuElement.remove();
        openerElement.classList.remove('menu-active');
        document.body.removeEventListener('mousedown', boundCloser);
    }, 75);
}

const getWheelData = async (wheelObjectId) => {
    const reqURL = `${BACK_URL.GET_WHEEL_DATA_OBJECT_ID}/${wheelObjectId}`;
    const response = await getRequest(reqURL, true, true);
    const wheelData = await response.json();
    return wheelData;
}

const createWheelRecord = async (wheelData) => {
    const wheelRecord = document.createElement('li');
    let recordText = '-----------';
    let recordId = 'emptyWheel';
    if (!wheelData) {
        wheelRecord.classList.add('empty-record');
    } else {
        recordText = wheelData['wheelId'];
        recordId = wheelData['_id'];
    }
    wheelRecord.id = recordId;
    wheelRecord.textContent = recordText;
    return wheelRecord;
}

const createInfoRecord = async (recordId, infoText, blocked = false) => {
    const infoRecord = document.createElement('div');
    infoRecord.id = recordId ? recordId : 'emptyId';
    infoRecord.classList.add('info-record');
    if (blocked) {
        infoRecord.classList.add('blocked');
    }
    infoRecord.innerHTML = infoText;
    return infoRecord;
}

const assignCloser = async (openerElement, menuElement) => {
    const mainCloser = (event) => menuCloser(event, openerElement, menuElement, mainCloser);
    document.body.addEventListener('mousedown', mainCloser);
}

export const createWheelstackMenu = async (event, openerElement, wheelstackData) => {
    if (!wheelstackData) {
        return;
    }
    openerElement.classList.add('menu-active');
    // + WHEELS +
    const menu = document.createElement('div');
    menu.id = wheelstackData['_id'];
    menu.classList.add('wheelstack-menu');
    const wheelsList = document.createElement('ul');
    for (let wheelIndex = 5; wheelIndex > -1; wheelIndex -= 1) {
        const wheelObjectId = wheelstackData['wheels'][wheelIndex];
        let wheelRecord = null;
        if (!wheelObjectId) {
            wheelRecord = await createWheelRecord(wheelObjectId);
        } else {
            const wheelData = await getWheelData(wheelObjectId);
            wheelRecord = await createWheelRecord(wheelData);
        }
        wheelsList.appendChild(wheelRecord);
    }
    menu.appendChild(wheelsList);
    // - WHEELS -
    // + BATCH +
    const batchNumber = wheelstackData['batchNumber'];
    const batchText = `<b>Номер партии</b><br>${batchNumber}`;
    const batchRecord = await createInfoRecord(batchNumber, batchText);
    batchRecord.setAttribute('data-batch-number', wheelstackData['batchNumber']);
    batchRecord.addEventListener('click', (event) => {
        if (batchMarker.targetValue === batchNumber) {
            batchMarker.clearMarking();
            return;
        }
        batchMarker.clearMarking();
        batchMarker.setRules('data-batch-number', batchNumber);
        batchMarker.markTargets(true);
    })
    menu.appendChild(batchRecord);
    // - BATCH -
    // + ORDER BLOCK +
    if (wheelstackData['blocked']) {
        const orderObjectId = wheelstackData['lastOrder'];
        const orderText = `<b>Ожидает</b><br>${orderObjectId}`;
        const orderRecord = await createInfoRecord(orderObjectId, orderText, true);
        menu.appendChild(orderRecord);
        orderRecord.addEventListener('click', event => {
            focusTableOrder(orderObjectId);
        })
    }
    // - ORDER BLOCK -
    // END
    assignCloser(openerElement, menu)
    document.body.appendChild(menu);
    updateMenuPosition(event, menu);
    menu.classList.add('show');
    return menu;
}

export const createBlockedCellMenu = async (event, openerElement, cellData) => {
    if (!cellData) {
        return;
    }
    openerElement.classList.add('menu-active');
    const blockingOrderObjectId = cellData['blockedBy'];
    const menu = document.createElement('div');
    menu.id = 'emptyBlockedMenu';
    menu.classList.add('wheelstack-menu');
    // + ORDER BLOCK +
    const orderText = `<b>Ожидает</b><br>${blockingOrderObjectId}`;
    const orderRecord = await createInfoRecord(blockingOrderObjectId, orderText, true);
    orderRecord.addEventListener('click', event => {
        focusTableOrder(blockingOrderObjectId);
    })
    menu.appendChild(orderRecord);
    // - ORDER BLOCK -
    assignCloser(openerElement, menu)
    document.body.appendChild(menu);
    updateMenuPosition(event, menu);
    menu.classList.add('show');
    return menu;
}