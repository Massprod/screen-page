import { convertISOToCustomFormat } from "../../utility/convertToIso.js";
import {
  BACK_URL,
  PLACEMENT_TYPES_TRANSLATE,
  ORDER_TYPES_TRANSLATE_TABLE,
  PLACEMENT_TYPES,
  EXTRA_ELEMENT_NAME,
  BASIC_ATTRIBUTES,
} from "../../uniConstants.js";
import { getRequest } from "../../utility/basicRequests.js";
import flashMessage from "../../utility/flashMessage/flashMessage.js";


export const focusTableOrder = async (orderId, focusTable) => {
  if (!focusTable) {
    return;
  }
  const targetRow = focusTable.querySelector(`tbody #${CSS.escape(orderId)}`);
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


export const createPlacementRecord = async (placementData, placementBanks) => {
  const placementType = placementData['placementType'];
  const placementId = placementData['placementId'];
  const placementRow = placementData['rowPlacement'];
  const placementCol = placementData['columnPlacement'];
  let placementRecord = "";
  // + REMOVE SELECTORS +
  if (PLACEMENT_TYPES.GRID === placementType) {
    placementRecord += `<b>${placementBanks['grids'][placementId]['name']}</b><br>`;
  } else if (PLACEMENT_TYPES.BASE_PLATFORM === placementType) {
    placementRecord += `<b>${placementBanks['platforms'][placementId]['platformName']}</b><br>`;
  }
  // + REMOVE SELECTORS +
  if (placementCol === PLACEMENT_TYPES.LABORATORY) {
      placementRecord += `<b>${PLACEMENT_TYPES_TRANSLATE[placementCol]}</b>`;
  } else if (placementRow === EXTRA_ELEMENT_NAME) {
      placementRecord += `<b>${PLACEMENT_TYPES_TRANSLATE[placementType]}</b><br><b>${placementCol}</b>`;
  } else if (placementType !== PLACEMENT_TYPES.STORAGE) {
      placementRecord += `<b>${PLACEMENT_TYPES_TRANSLATE[placementType]}</b><br>Р: <b>${placementRow}</b> | К: <b>${placementCol}</b>`;
  } else if (placementType === PLACEMENT_TYPES.STORAGE) {
      // TODO: when we will setup STORAGE BANK <- change this request to just provided data from creation call.
      const storageGetNoDataURL = `${BACK_URL.GET_STORAGE}/?storage_id=${placementId}&include_data=false`;
      const storageResp = await getRequest(storageGetNoDataURL, true, true);
      const storageData = await storageResp.json();
      const storageName = storageData['name'];
      placementRecord += `${PLACEMENT_TYPES_TRANSLATE[placementType]}<br><b>${storageName}</b>`;
  }
  return placementRecord;
}


export const gatherOrderRowData = async (
  orderData, batchData, placementBanks
) => {
  const showData = {};
  let columnClasses = ['batch-indicator'];
  if (!batchData['laboratoryTestDate']) {
    columnClasses.push('not-tested');
  } else if (batchData['laboratoryPassed']) {
    columnClasses.push('passed');
  } else if (!batchData['laboratoryPassed']) {
    columnClasses.push('not-passed');
  }
  showData['batchNumber'] = {
    'id': 'batchNumber',
    'innerHTML': `${batchData['batchNumber']}`,
    'title': `Номер партии | Нажмите для выделения всей партии`,
    'cursor': 'pointer',
    'classes': columnClasses,
  };
  // showData['orderId'] = {
  //   'id': 'orderId',
  //   'innerHTML': orderData['_id'],
  //   'title': `Номер заказа для идентификации`,
  // };
  showData['orderType'] = {
    'id': 'orderType',
    'innerHTML': ORDER_TYPES_TRANSLATE_TABLE[orderData['orderType']],
    'title': 'Тип заказа | Нажмите для выделения используемых элементов, в активном приямке и платформе',
    'cursor': 'pointer',
  };
  showData['source'] = {
    'id': 'source',
    'innerHTML': await createPlacementRecord(orderData['source'], placementBanks),
    'title': 'Исходная позиция для перемещения | Нажмите для выделения используемого элемента, в активном приямке и платформе',
    'cursor': 'pointer',
  };
  showData['destination'] = {
    'id': 'destination',
    'innerHTML': await createPlacementRecord(orderData['destination'], placementBanks),
    'title': 'Конечная позиция для перемещения | Нажмите для выделения используемого элемента, в активном приямке и платформе',
    'cursor': 'pointer',
  };
  showData['createdAt'] = {
    'id': 'createdAt',
    'innerHTML': `<b>${convertISOToCustomFormat(orderData['createdAt'], true, true)}</b>`,
    'title': 'Время создания заказа в системе',
  };
  return showData;
}


export const createTableRow = async (rowData) => {
  const tableRow = document.createElement('tr');
  for (let [columnName, columnData] of Object.entries(rowData)) {
    const tableColumn = document.createElement('td');
    tableColumn.id = columnData['id'];
    tableColumn.innerHTML = columnData['innerHTML'];
    tableColumn.title = columnData['title'];
    tableColumn.style.cursor = columnData['cursor'];
    
    if ('classes' in columnData && Array.isArray(columnData['classes'])) {
      tableColumn.classList.add(...columnData['classes']);
    }
    tableRow.appendChild(tableColumn);
  }
  return tableRow;
}


export const createOrderRecord = async (orderData, batchData, placementBanks, adjustColumns = false) => {
  const displayData = await gatherOrderRowData(orderData, batchData, placementBanks);
  const rowElement = await createTableRow(displayData);
  rowElement.id = orderData['_id'];
  // BATCH COLUMN
  rowElement.setAttribute(BASIC_ATTRIBUTES.BATCH_NUMBER, batchData['batchNumber']);
  if (adjustColumns) {
    rowElement.childNodes[0].classList.add('orders-table-hidden');
    rowElement.childNodes[1].classList.add('orders-table-hidden');
  }
  return rowElement;
}
