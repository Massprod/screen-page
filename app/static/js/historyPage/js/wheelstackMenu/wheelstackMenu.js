import updateMenuPosition from "../../../utility/adjustContainerPosition.js";
import { batchMarker } from "../../../historyPage/js/main.js";
import flashMessage from "../../../utility/flashMessage/flashMessage.js";
import { ORDER_MOVE_TO_LABORATORY } from "../../../uniConstants.js";
import { createBatchMenu } from "../batchMenu/batchMenu.js";


var curOrdersTable = document.getElementById('ordersTableBody');


const focusTableOrder = async (orderId) => {
    const targetRow = curOrdersTable.querySelector(`tbody #${CSS.escape(orderId)}`);
    if (!targetRow) {
        flashMessage.show({
            'message': `В таблице не найден заказ с номером: ${orderId}`,
            'color': 'red',
            'duration': 1000,
        })
        return;
    }
    // flashMessage.show({
    //     'message': `Выделен заказ: ${orderId}`,
    //     'duration': 1000,
    // })
    targetRow.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    targetRow.classList.add('basic-focus');
    setTimeout( () => {
        targetRow.classList.remove('basic-focus');
        // flashMessage.show({
        //     'message': `Снято выделение заказа: ${orderId}`,
        //     'duration': 1500,
        // })
    }, 2000)
}

const menuCloser = async (event, openerElement, menuElement, subMenus, boundCloser) => {
    if (event.target === menuElement || menuElement.contains(event.target)) {
        return;   
    }
    for (let subMenu of Object.values(subMenus)) {
        if (subMenu.contains(event.target)) {
            return;
        }
    }
    subMenus = {};
    menuElement.classList.add('hide');
    setTimeout(() => {
        menuElement.remove();
        openerElement.classList.remove('menu-active');
        document.body.removeEventListener('mousedown', boundCloser);
        document.body.removeEventListener('touchstart', boundCloser);
    }, 75);
}

const assignCloser = async (openerElement, menuElement, subMenus = {}) => {
    const mainCloser = (event) => menuCloser(event, openerElement, menuElement, subMenus, mainCloser);
    document.body.addEventListener('mousedown', mainCloser);
    document.body.addEventListener('touchstart', mainCloser);
}

const createWheelRecord = async (wheelData, blocked = false) => {
    const wheelRecord = document.createElement('li');
    let recordText = '-----------';
    let recordId = 'emptyWheel';
    if (!wheelData) {
        wheelRecord.classList.add('empty-record');
        wheelRecord.title = 'Пустая позиция';
    } else {
        recordText = wheelData['wheelId'];
        recordId = wheelData['_id'];
        wheelRecord.title = 'Номер горячей маркировки колеса'
        if (blocked) {
            wheelRecord.classList.add('blocked');
            wheelRecord.title = `Ожидает переноса в лабораторию`;
        }
        wheelRecord.setAttribute('data-wheels', wheelData['wheelId']);
    }
    wheelRecord.id = recordId;
    wheelRecord.textContent = recordText;
    return wheelRecord;
}

const createInfoRecord = async (recordId, infoText, recordTitle, blocked = false) => {
    const infoRecord = document.createElement('div');
    infoRecord.id = recordId ? recordId : 'emptyId';
    infoRecord.title = recordTitle;
    infoRecord.classList.add('info-record');
    if (blocked) {
        infoRecord.classList.add('blocked');
    }
    infoRecord.innerHTML = infoText;
    return infoRecord;
}

export const createWheelstackMenu = async (event, openerElement, wheelstackData) => {
    if (!wheelstackData) {
        return;
    }
    var menus = {};
    openerElement.classList.add('menu-active');
    const menu = document.createElement('div');
    menu.id = wheelstackData['_id'];
    menu.classList.add('wheelstack-menu');
    // + ORDER BLOCK +
    if (wheelstackData['blocked']) {
        const orderObjectId = wheelstackData['lastOrder']['_id'];
        const orderText = `<b>Ожидает</b><br>${orderObjectId}`;
        const orderTitle = 'Ожидает выполнения заказа';
        const orderRecord = await createInfoRecord(orderObjectId, orderText, orderTitle, true);
        menu.appendChild(orderRecord);
        orderRecord.addEventListener('click', event => {
            focusTableOrder(orderObjectId);
        })
    }
    // - ORDER BLOCK -
    // + BATCH +
    const batchData = wheelstackData['batchNumber'];
    const batchNumber = batchData['batchNumber'];
    const batchText = `<b>Номер партии</b><br>${batchNumber}`;
    const batchTitle = 'Номер партии колёс стопы';
    const batchRecord = await createInfoRecord(batchNumber, batchText, batchTitle);
    // STATUS INDICATION
    batchRecord.classList.add('batch-indicator');
    if (!batchData['laboratoryTestDate']) {
        batchRecord.classList.add('not-tested');
    } else if (batchData['laboratoryPassed']) {
        batchRecord.classList.add('passed');
    } else {
        batchRecord.classList.add('not-passed');
    }
    batchRecord.setAttribute('data-batch-number', batchNumber);
    batchRecord.addEventListener('click', (event) => {
        if (batchMarker.targetValue === batchNumber) {
            batchMarker.clearMarking();
            return;
        }
        batchMarker.clearMarking();
        batchMarker.setRules('data-batch-number', batchNumber);
        batchMarker.markTargets(true);
    })
    batchRecord.addEventListener('click', async event => {
        event.preventDefault();
        menus['batchMenu'] = await createBatchMenu(event, batchRecord, batchData);
    })
    menu.appendChild(batchRecord);
    // - BATCH -
    // + WHEELS +
    const wheelsList = document.createElement('ul');
    let blockedWheelObjectId = null;
    if (wheelstackData['blocked']) {
        const orderData = wheelstackData['lastOrder'];
        if (ORDER_MOVE_TO_LABORATORY === orderData['orderType']) {
            blockedWheelObjectId = wheelstackData['lastOrder']['affectedWheels']['source'][0];
        }  
    }
    for (let wheelIndex = 5; wheelIndex > -1; wheelIndex -= 1) {
        const wheelData = wheelstackData['wheels'][wheelIndex];
        let wheelRecord = null;
        if (wheelData && wheelData['_id'] === blockedWheelObjectId) {
            wheelRecord = await createWheelRecord(wheelData, true);
        } else {
            wheelRecord = await createWheelRecord(wheelData);
        }   
        wheelsList.appendChild(wheelRecord);
    }
    menu.appendChild(wheelsList);
    // - WHEELS -
    // END
    assignCloser(openerElement, menu, menus)
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
    const blockingOrderObjectId = cellData['blockedBy']['_id'];
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
    assignCloser(openerElement, menu);
    document.body.appendChild(menu);
    updateMenuPosition(event, menu);
    menu.classList.add('show');
    return menu;
}