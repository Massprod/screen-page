

export const createPlacementRecord = async (placementData) => {
  const placementType = placementData['placementType'];
  const placementId = placementData['placementId'];
  const placementRow = placementData['rowPlacement'];
  const placementCol = placementData['columnPlacement'];
  let assignFocus = '';
  let placementRecord = "";
  if (placementCol === LABORATORY_NAME) {
      placementRecord = `<b>${PLACEMENT_TYPES[placementCol]}</b>`;
  } else if (placementRow === EXTRA_ELEMENT_NAME) {
      placementRecord = `<b>${PLACEMENT_TYPES[placementType]}</b><br><b>${placementCol}</b>`;
  } else if (placementType !== STORAGE_NAME) {
      placementRecord = `<b>${PLACEMENT_TYPES[placementType]}</b><br>Р: <b>${placementRow}</b> | К: <b>${placementCol}</b>`;
  } else if (placementType === STORAGE_NAME) {
      const storageGetNoDataURL = `${BACK_URLS.GET_STORAGE}/?storage_id=${placementId}&include_data=false`;
      const storageResp = await getRequest(storageGetNoDataURL, true, true);
      const storageData = await storageResp.json();
      const storageName = storageData['name'];
      placementRecord = `${PLACEMENT_TYPES[placementType]}<br><b>${storageName}</b>`;
  }
  return placementRecord;
}


export const gatherOrderRowData = async (
  orderData, wheelstacksData, batchesData
) => {
  const showData = {};
  const wheelstackId = orderData['affectedWheelStacks']['source'];
  const wheelstackData = wheelstacksData[wheelstackId];
  const batchData = batchesData[wheelstackData['batchNumber']];

  let columnClasses = ['batch-indicator'];
  if (!batchData['laboratoryTestDate']) {
    columnClasses.push('not-tested');
  } else if (batchData['laboratoryPassed']) {
    columnClasses.push('passed');
  } else if (!batchData['laboratoryPassed']) {
    columnClasses.push('not-passed');
  }
  showData['batchNumber'] = {
    'innerHTML': `${batchData['batchNumber']}`,
    'title': `Номер партии | Нажмите для выделения всей партии`,
    'cursor': 'pointer',
    'classes': columnClasses,
  };
  showData['orderId'] = {
    'innerHTML': orderData['_id'],
    'title': `Номер заказа для идентификации`,
  };
  showData['orderType'] = {
    'innerHTML': ORDER_TYPES_TRANSLATE_TABLE[orderData['orderType']],
    'title': 'Тип заказа | Нажмите для выделения используемых элементов, в активном приямке и платформе',
    'cursor': 'pointer',
  };
  showData['source'] = {
    'innerHTML': await createPlacementRecord(orderData['source']),
    'title': 'Исходная позиция для перемещения | Нажмите для выделения используемого элемента, в активном приямке и платформе',
    'cursor': 'pointer',
  };
  showData['destination'] = {
    'innerHTML': await createPlacementRecord(orderData['destination']),
    'title': 'Конечная позиция для перемещения | Нажмите для выделения используемого элемента, в активном приямке и платформе',
    'cursor': 'pointer',
  };
  showData['createdAt'] = {
    'innerHTML': `<b>${convertISOToCustomFormat(orderData['createdAt'], true, true)}</b>`,
    'title': 'Время создания заказа в системе',
  };
  return showData;
}


export const createTableRow = async (rowData) => {
  const tableRow = document.createElement('tr');
  for (let [columnName, columnData] of Object.entries(rowData)) {
    const tableColumn = document.createElement('td');
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


const createOrderRecords = async (targetTable, allData) => {
  const orderElements = {};
  const ordersData = allData['orders'];
  const wheelstacksData = allData['wheelstacks'];
  const batchesData = allData['batches'];
  ordersData.
}
