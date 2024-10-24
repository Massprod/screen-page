import { convertISOToCustomFormat } from "../../utility/convertToIso.js";
import updateMenuPosition from "../../utility/adjustContainerPosition.js";


const assignCloser = async (openerElement, menuElement) => {
  const mainCloser = (event) => {
    if (event && (event.target === menuElement || menuElement.contains(event.target))) {
      return;
    }
    clearInterval(checkInterval);
    checkInterval = null;
    menuElement.classList.add('hide');
    setTimeout( () => {
      menuElement.remove();
    }, 75);
    document.body.removeEventListener('mousedown', mainCloser);
    document.body.removeEventListener('touchstart', mainCloser);
  }
  document.body.addEventListener('mousedown', mainCloser);
  document.body.addEventListener('touchstart', mainCloser);

  let checkInterval = setInterval(() => {
    if (!openerElement.isConnected || !menuElement.isConnected) {
      mainCloser(null);  // empty event
      clearInterval(checkInterval);
      checkInterval = null;
    }
  }, 75);
}


const createRecord = async (recordData) => {
  const record = document.createElement('li');
  if ('id' in recordData) {
    record.id = recordData['id'];
  }
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


const createMoveExpandable = async () => {
  const expandableData = {
    'id': 'expField',
    'innerHTML': "",
    'classes': ['expandable'],
  }
  const expandableRecord = await createRecord(expandableData);
  
  const fullToggle = document.createElement('input');
  fullToggle.id = 'selectFromEverywhere';
  fullToggle.type = 'checkbox';
  fullToggle.classList.add('full-toggle');
  const fullToggleLable = document.createElement('label');
  fullToggleLable.classList.add('text-muted', 'small', 'position-absolute', 'full-toggle-label');
  fullToggleLable.innerHTML = 'Отовсюду';
  expandableRecord.appendChild(fullToggle);
  expandableRecord.appendChild(fullToggleLable);
  
  const selectContainer = document.createElement('div');
  selectContainer.classList.add('d-flex', 'flex-column', 'align-items-center', 'mt-4');

  const selector = document.createElement('select');
  selector.id = 'batchMenuMoveSelector';
  selector.classList.add('form-select', 'w-75', 'mb-2');
  selectContainer.appendChild(selector);

  const buttonsContainer = document.createElement('div');
  buttonsContainer.id = 'batchMenuMoveButtons';
  buttonsContainer.classList.add('d-flex', 'flex-row', 'align-items-center', 'gap-3', 'mt-2');
  selectContainer.appendChild(buttonsContainer); 

  const processingButton = document.createElement('button');
  processingButton.id = 'moveToProcess';
  processingButton.innerHTML = 'Обработка';
  processingButton.classList.add('btn', 'process');
  buttonsContainer.appendChild(processingButton);

  const rejectButton = document.createElement('button');
  rejectButton.id = 'moveToReject';
  rejectButton.innerHTML = 'Отказ'
  rejectButton.classList.add('btn', 'reject');
  buttonsContainer.appendChild(rejectButton);

  expandableRecord.appendChild(selectContainer);
  return expandableRecord;
}


export const createBatchMenu = async (
  event, openerElement, batchData, batchMarker, dataBank
) => {
  if (!batchData) {
    return;
  }
  const menu = document.createElement('div');
  menu.id = batchData['batchNumber'];
  menu.classList.add('batch-menu');
  const batchRecords = document.createElement('ul');
  batchRecords.id = 'menuList';
  const batchNumber = batchData['batchNumber'];
  // + ID FIELD +
  const idData = {
    'id': 'idField',
    'innerHTML': `<span class="text-label">Номер партии:</span><br><span class="data-value">${batchNumber}</span>`,
    'attributes': {
      'data-batch-number': batchNumber,
    },
    'classes': ['expand-ind'],
  };
  const batchIdRecord = await createRecord(idData);
  batchIdRecord.addEventListener('click', event => {
    if (batchNumber === batchMarker.targetValue) {
      batchMarker.clearMarking();
      return;
    }
    batchMarker.clearMarking();
    batchMarker.setRules('data-batch-number', batchNumber);
    batchMarker.markTargets(true, 5);
  })
  batchRecords.appendChild(batchIdRecord);
  // - ID FIELD -
  // + EXPANDABLE MOVE +
  const expandableRecord = await createMoveExpandable();
  batchRecords.appendChild(expandableRecord);
  batchIdRecord.addEventListener('click', event => {
    if (batchIdRecord.classList.contains('open')) {
      batchIdRecord.classList.remove('open');
      expandableRecord.classList.remove('open');
    } else {
      batchIdRecord.classList.add('open');
      expandableRecord.classList.add('open');
    }
  })
  // - EXPANDABLE MOVE -
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
    'id': 'statusField',
    'innerHTML': `<span class="text-label">Результат тестирования:</span><br><span class="data-value">${status}</span>`,
    'classes': statusClasses,
  }
  const statusRecord = await createRecord(statusData);
  batchRecords.appendChild(statusRecord);
  // - STATUS FIELD -
  // + TEST DATE FIELD +
  let lastTestDate = batchData['laboratoryTestDate'];
  if (lastTestDate) {
    const formatedDate = convertISOToCustomFormat(lastTestDate, true, true, true, true);
    const testDateData = {
      'id': 'testDateField',
      'innerHTML': `<span class="text-label">Дата последнего теста:</span><br><span class="data-value">${formatedDate}</span>`,
      'attributes': {
        'data-test-date': lastTestDate,
      }
    }
    const lastTestDataRecord = await createRecord(testDateData);
    batchRecords.appendChild(lastTestDataRecord);
  }
  // - TEST DATE FIELD -
  // + CREATION DATE FIELD +
  let creationDate = batchData['createdAt'];
  creationDate = convertISOToCustomFormat(creationDate, true, true, true, true);
  const creationData = {
    'id': 'creationDateField',
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

  // + UPDATING +
  let updating = false;
  let menuUpdateInterval = setInterval(async () => {
    if (!menu.isConnected) {
      clearInterval(menuUpdateInterval);
      menuUpdateInterval =  null;
      return;
    }
    if (!updating) {
      updating = true;
      await updateBatchMenu(menu, dataBank)
      updating = false;
    }
  }, 100);
  // - UPDATING - 
  return menu;
}


export const updateBatchMenu = async (menuElement, dataBank) => {
  const batchNumberField = menuElement.querySelector('#idField');
  const batchNumber = batchNumberField.getAttribute('data-batch-number');

  const testDateField = menuElement.querySelector('#testDateField');

  const statusField = menuElement.querySelector('#statusField');

  const batchData = dataBank[batchNumber];
  if (!batchData) {
    return;
  } 

  let newStatus = '';
  let newStatusClass = '';

  if (!batchData['laboratoryTestDate']) {
    newStatus = 'ожидает'
    newStatusClass = 'not-tested';
  } else if (batchData['laboratoryPassed']) {
    newStatus = 'успешно';
    newStatusClass = 'passed';
  } else {
    newStatus = 'неуспешно';
    newStatusClass = 'not-passed';
  }
  const newLastTestDate = batchData['laboratoryTestDate'];
  if (newLastTestDate && testDateField) {
    const menuLastTestDate = testDateField.getAttribute('data-test-date');
    if (menuLastTestDate < newLastTestDate) {
      const formatedDate = convertISOToCustomFormat(newLastTestDate, true, true, true, true);
      testDateField.innerHTML = `<span class="text-label">Дата последнего теста:</span><br><span class="data-value">${formatedDate}</span>`
    }
  } else if (newLastTestDate && !testDateField) {
    const formatedDate = convertISOToCustomFormat(newLastTestDate, true, true, true, true);
    const newTestDateData = {
      'id': 'testDateField',
      'innerHTML': `<span class="text-label">Дата последнего теста:</span><br><span class="data-value">${formatedDate}</span>`,
      'attributes': {
        'data-test-date': newLastTestDate,
      }
    }
    const lastTestDataRecord = await createRecord(newTestDateData);
    const menuList = menuElement.querySelector('#menuList');
    const creationDateElement = menuList.querySelector('#creationDateField');
    menuList.insertBefore(
      lastTestDataRecord, creationDateElement
    )
  }

  if (!(statusField.classList.contains(newStatusClass))) {
    statusField.classList.remove('not-tested', 'passed', 'not-passed');
    statusField.classList.add(newStatusClass);
    statusField.innerHTML = `<span class="text-label">Результат тестирования:</span><br><span class="data-value">${newStatus}</span>`;
  }

}
