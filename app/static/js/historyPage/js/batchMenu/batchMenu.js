import { batchMarker } from "../main.js";
import convertISOToCustomFormat from "../../../utility/convertToIso.js";
import updateMenuPosition from "../../../utility/adjustContainerPosition.js";


const menuCloser = async (event, openerElement, menuElement, boundCloser) => {
    // leaving `openerElement` as arg, if we want to distinguish element which opened it.
    if (event.target === menuElement || menuElement.contains(event.target)) {
        return;   
    }
    menuElement.classList.add('hide');
    setTimeout(() => {
        menuElement.remove();
        document.body.removeEventListener('mousedown', boundCloser);
        document.body.removeEventListener('touchstart', boundCloser);
    }, 75);
}

const assignCloser = async (openerElement, menuElement) => {
    const mainCloser = (event) => menuCloser(event, openerElement, menuElement, mainCloser);
    document.body.addEventListener('mousedown', mainCloser);
    document.body.addEventListener('touchstart', mainCloser);
}

const createRecord = async (recordData) => {
    const record = document.createElement('li');
    record.innerHTML = recordData['innerHTML'];
    if ('attributes' in recordData) {
        for (let [attribute, value] of Object.entries(recordData['attributes'])) {
            record.setAttribute(attribute, value);
        }
    }
    if ('classes' in recordData) {
        const classes = recordData['classes']
        classes.forEach( element => {
            record.classList.add(element);
        })
    }
    return record;
}


export const createBatchMenu = async (event, openerElement, batchData) => {
    if (!batchData) {
        return;
    }
    const menu = document.createElement('div');
    menu.id = batchData['batchNumber'];
    menu.classList.add('batch-menu');
    const batchRecords = document.createElement('ul');
    const batchNumber = batchData['batchNumber'];
    // + ID FIELD +
    const idData = {
        'innerHTML': `<span class="text-label">Номер партии:</span><br><span class="data-value">${batchNumber}</span>`,
        'attributes': {
            'data-batch-number': batchNumber,
        },
    };
    const batchIdRecord = await createRecord(idData);
    batchIdRecord.addEventListener('click', event => {
        if (batchNumber === batchMarker.targetValue) {
            batchMarker.clearMarking();
            return;
        }
        batchMarker.clearMarking();
        batchMarker.setRules('data-batch-number', batchNumber);
        batchMarker.markTargets(true);
    })
    batchRecords.appendChild(batchIdRecord);
    // - ID FIELD -
    // + STATUS FIELD +
    let status = '';
    let statusClasses = ['batch-indicator'];
    if (!batchData['laboratoryTestDate']) {
        status = 'ожидает';
        statusClasses.push('not-tested');
    } else if (batchData['laboratoryPassed']) {
        status = 'успешно';
        statusClasses.push('passed');
    } else {
        status = 'неуспешно';
        statusClasses.push('not-passed');
    }
    const statusData = {
        'innerHTML': `<span class="text-label">Результат тестирования:</span><br><span class="data-value">${status}</span>`,
        'classes': statusClasses,
    }
    const statusRecord = await createRecord(statusData);
    batchRecords.appendChild(statusRecord);
    // - STATUS FIELD -
    // + TEST DATE FIELD +
    let lastTestDate = batchData['laboratoryTestDate'];
    if (lastTestDate) {
        lastTestDate = convertISOToCustomFormat(lastTestDate, true, true, true, true);
        const testDateData = {
            'innerHTML': `<span class="text-label">Дата последнего теста:</span><br><span class="data-value">${lastTestDate}</span>`,
        }
        const lastTestDataRecord = await createRecord(testDateData);
        batchRecords.appendChild(lastTestDataRecord);
    }
    // - TEST DATE FIELD -
    // + CREATION DATE FIELD +
    let creationDate = batchData['createdAt'];
    creationDate = convertISOToCustomFormat(creationDate, true, true, true, true);
    const creationData = {
        'innerHTML': `<span class="text-label">Дата поступления:</span><br><span class="data-value">${creationDate}</span>`,
    }
    const creationDateRecord = await createRecord(creationData);
    batchRecords.appendChild(creationDateRecord);
    // - CREATION DATE FIELD -
    menu.appendChild(batchRecords);
    assignCloser(openerElement, menu);
    document.body.appendChild(menu);
    updateMenuPosition(event, menu);
    menu.classList.add('show');
    return menu;
}