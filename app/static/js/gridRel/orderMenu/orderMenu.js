import updateMenuPosition from "../../utility/adjustContainerPosition.js";
import { EXTRA_ORDER_TYPES_TRANSLATE_TABLE, BASIC_INFO_MESSAGE_WARNING, BACK_URL } from "../../uniConstants.js";
import flashMessage from "../../utility/flashMessage/flashMessage.js";
import { postRequest } from "../../utility/basicRequests.js";



const curOrdersTable = document.getElementById('ordersTableBody');
let currentlyFocusedRow = null;
let currentlyFocusedRowTimeout= null;


const updateOrderStatus = async (orderId, complete = true) => {
  try {
    let updateURL = BACK_URL.POST_COMPLETE_ORDER;
    if (!complete) {
      updateURL = BACK_URL.POST_CANCEL_ORDER;
    }
    updateURL += `/${orderId}`;
    const response = await postRequest(updateURL, false, true);
    if (!response.ok) {
      const errorMessage = BASIC_INFO_MESSAGE_WARNING;
      errorMessage.message = `Ошибка при обновлении статуса заказа: ${response.statusText}`;
      flashMessage.show(errorMessage);
        throw new Error(`Error while updating orderStatus ${response.statusText}. URL = ${url}`);
    }
    return response
  } catch (error) {
    console.error(
        `There was a problem with updating orderStatus: ${error}`
    );
    throw error
  }
}


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
  flashMessage.show({
    'message': `Выделен заказ: ${orderId}`,
    'duration': 1000,
  })
  targetRow.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
  if (currentlyFocusedRow) {
    currentlyFocusedRow.classList.remove('basic-focus');
    currentlyFocusedRow = null;
    clearTimeout(currentlyFocusedRowTimeout);
    currentlyFocusedRowTimeout = null; 
  }
  targetRow.classList.add('basic-focus');
  currentlyFocusedRow = targetRow;
  currentlyFocusedRowTimeout = setTimeout( () => { 
    if (!currentlyFocusedRow) {
      return;
    }
    currentlyFocusedRow.classList.remove('basic-focus');
    currentlyFocusedRow = null;
    flashMessage.show({
        'message': `Снято выделение заказа: ${orderId}`,
        'duration': 1500,
    })
  }, 2000)
}


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
    if (!openerElement.isConnected) {
      mainCloser(null);  // empty event
      clearInterval(checkInterval);
      checkInterval = null;
    }
  }, 50);
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


export const createOrderMenu = async (
  event, openerElement, orderData, removableOpener = true
) => {
  if (!orderData) {
    return;
  }
  console.log(orderData);
  const menu = document.createElement('div');
  const orderId = orderData['_id'];
  menu.id = orderId;
  menu.classList.add('order-menu');
  const menuRecords = document.createElement('ul');
  // + ID FIELD +
  const idData = {
    'id': 'idField',
    'innerHTML': `<span class="text-label">Номер:</span><br><span class="data-value">${orderId}</span>`,
  };
  const orderIdRecord = await createRecord(idData);
  orderIdRecord.addEventListener('click', event => {
    focusTableOrder(orderId);
  })
  menuRecords.appendChild(orderIdRecord);
  // - ID FIELD -
  // + TYPE FIELD +
  const orderType = orderData['orderType'];
  const translateType = EXTRA_ORDER_TYPES_TRANSLATE_TABLE[orderType];
  const typeData = {
    'id': 'typeField',
    'innerHTML': `<span class="text-label">Тип заказа:</span><br><span class="data-value">${translateType}</span>`,
    'attributes': {
      'data-order-type': orderType,
    },
  };
  const typeRecord = await createRecord(typeData);
  menuRecords.appendChild(typeRecord);
  // - TYPE FIELD -
  // + BUTTONS FIELD +
  
  const buttonsContainer = document.createElement('li');
  buttonsContainer.classList.add('d-flex', 'flex-row', 'align-items-center', 'justify-content-center', 'gap-3');
  
  const completeButton = document.createElement('button');
  completeButton.id = 'completeOrder';
  completeButton.innerHTML = 'Выполнить';
  completeButton.classList.add('btn', 'process');
  completeButton.addEventListener('click', event => {
    const result = updateOrderStatus(orderId, true); 
    if (result) {
      openerElement.remove();
    };
  });
  buttonsContainer.appendChild(completeButton);

  const cancelButton = document.createElement('button');
  cancelButton.id = 'cancelOrder';
  cancelButton.innerHTML = 'Отменить';
  cancelButton.classList.add('btn', 'reject');
  cancelButton.addEventListener('click', event => {
    const result = updateOrderStatus(orderId, false);
    if (result) {
      openerElement.remove();
    }
  })
  buttonsContainer.appendChild(cancelButton);

  menuRecords.appendChild(buttonsContainer);
  // - BUTTONS FIELD -
  menu.appendChild(menuRecords);
  menu.classList.add('show');
  document.body.appendChild(menu);
  assignCloser(openerElement, menu);
  updateMenuPosition(event, menu);

}