import {
  BASIC_ATTRIBUTES,
  BASIC_INFO_MESSAGE_WARNING,
  EXTRA_ORDER_TYPES_TRANSLATE_TABLE,
  PLACEMENT_TYPES,
  WHEELSTACK_MENU_UPDATE_INTERVAL,
  ORDER_MOVE_TO_LABORATORY,
  USER_ROLE_COOKIE_NAME,
  OPERATOR_ROLE,
} from "../../uniConstants.js";
import updateMenuPosition from "../../utility/adjustContainerPosition.js";
import { createBatchMenu } from "../batchMenu/batchMenu.js";
import { assignBatchExpandableButtons } from "../../rebuildGrid/js/main.js";
import { createOrderMenu } from "../orderMenu/orderMenu.js";
import { focusTableOrder } from "../ordersTable/orderRecords.js";
import flashMessage from "../../utility/flashMessage/flashMessage.js";
import { createLaboratoryOrderGrid, createOrderMoveWholestackFromBaseGrid, createProRejOrderBulk, createProRejOrderGrid } from "../../utility/ordersCreation.js";
import { createOption } from "../../utility/utils.js";
import { getCookie } from "../../utility/roleCookies.js";


const menuCloser = async (event, openerElement, menuElement, subMenus, boundCloser, force = false) => {
  if (!force) {
    if (event.target === menuElement || menuElement.contains(event.target)) {
      return;
    }
    for (let subMenu of Object.values(subMenus)) {
      if (subMenu && subMenu.contains(event.target)) {
        return;
      }
    }  
  }
  if (wheelstackMenuUpdatingInterval) {
    clearInterval(wheelstackMenuUpdatingInterval);
    wheelstackMenuUpdatingInterval = null;
  }
  subMenus = {};
  menuElement.classList.add('hide');
  document.body.removeEventListener('mousedown', boundCloser);
  document.body.removeEventListener('touchstart', boundCloser);
  menuElement.remove();
  setTimeout(() => {
      openerElement.classList.remove('menu-active');
  }, 75);
}

var forceMenuClose = null;

const assignCloser = async (openerElement, menuElement, subMenus = {}) => {
  const mainCloser = (event, force = false) => menuCloser(event, openerElement, menuElement, subMenus, mainCloser, force);
  forceMenuClose = (event, force) => {
    if (wheelstackMenuUpdatingInterval) {
      clearInterval(wheelstackMenuUpdatingInterval);
      wheelstackMenuUpdatingInterval = null;
    }
    mainCloser(event, force)
  }
  document.body.addEventListener('mousedown', mainCloser);
  document.body.addEventListener('touchstart', mainCloser);
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

const clearBlockedInfoField = (infoElement) => {
  infoElement.id = 'blockOrderField';
  infoElement.removeAttribute(BASIC_ATTRIBUTES.BLOCKING_ORDER);
}

const updateInfoRecord = (infoRecord, newId, newText, newTitle, blockingId = null) => {
  // TODO: wtf these IFs :)
  if (newId) {
    infoRecord.id = newId;
  }
  if (newTitle) {
    infoRecord.title = newTitle;
  }
  if (blockingId) {
    infoRecord.classList.add('blocked')
    infoRecord.setAttribute(BASIC_ATTRIBUTES.BLOCKING_ORDER, blockingId);
  } else {
    infoRecord.classList.remove('blocked');
    infoRecord.removeAttribute(BASIC_ATTRIBUTES.BLOCKING_ORDER);
  }
  if (newText) {
    infoRecord.innerHTML  = newText;
  }
}

const getBatchStatusClass = (batchData) => {
  let statusClass = null;
  if (!batchData['laboratoryTestDate']) {
    statusClass = 'not-tested';
  } else if (batchData['laboratoryPassed']) {
    statusClass = 'passed';
  } else {
    statusClass = 'not-passed';
  }
  return statusClass;
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


const updateWheelRecord = async (wheelRecord, wheelData, blocked = false) => {
  wheelRecord.id = wheelData['_id'];
  wheelRecord.classList.remove('blocked');
  if (blocked) {
    wheelRecord.classList.add('blocked');
    wheelRecord.title = `Ожидает переноса в лабораторию`;
  };
  wheelRecord.textContent = wheelData['wheelId'];
  wheelRecord.setAttribute(BASIC_ATTRIBUTES.WHEELS, wheelData['wheelId']);
  return wheelRecord;
}


const clearWheelRecord = async (wheelElement) => {
  wheelElement.classList.remove('blocked', 'expand-ind');
  wheelElement.classList.add('empty-record');
  wheelElement.id = 'emptyWheel';
  wheelElement.title = 'Пустая позиция';
  wheelElement.textContent = '-----------';
  wheelElement.removeAttribute('data-wheels');
}


const changeExpandableStatus = (elements = []) => {
  elements.forEach( element => {
    if (element.classList.contains('open')) {
      element.classList.remove('open');
    } else {
      element.classList.add('open');
    }
  });
}


const wheelRecordAssignExpandable = (wheelRecord) => {
  wheelRecord.classList.add('expand-ind');
  const expandable = document.createElement('li');
  expandable.classList.add('expandable', 'fs-5');
  expandable.innerHTML = 'Отправить в лабораторию';
  return expandable;
}

const labMoveHandler = (expandableRecord, wheelstackData, wheelObjectId, destinationId) => {
  expandableRecord.addEventListener('click', () => {
    expandableRecord.classList.add('clicked');
    setTimeout(() => {
      expandableRecord.classList.remove('clicked');
    }, 200);
    createLaboratoryOrderGrid(
      wheelstackData, wheelObjectId, destinationId
    );
  });
}


const checkExtraMenuOpened = (menuName, allMenus) => {
  let menu = allMenus[menuName];3
  if (menu && menu.isConnected) {
    menu.remove();
    delete allMenus[menuName];
    menu = undefined
    return true;
  } else if (menu && !menu.isConnected) {
    menu.remove();
    delete allMenus[menuName];
  }
  return false;
}

const clearMarkEventHandlers = (eventHandlers, openerElement, extraCalls = []) => {
  extraCalls.forEach( callback => {
    callback();
  })
  openerElement.classList.remove('active-move-select');
  moveSelectActive = false;
  if (moveMarkUpdateInterval) {
    clearInterval(moveMarkUpdateInterval);
    moveMarkUpdateInterval = null;
  };
  eventHandlers.forEach((handlerData, element) => {
    Object.keys(handlerData).forEach(eventType => {
      element.removeEventListener(eventType, handlerData[eventType]);
    })
    if (document !== element) {
      element.classList.remove('move-possible');
    }
  });
}


const showHideElements = (showElements, container, hideClass = 'd-none') => {
  container.childNodes.forEach( element => {
    if (showElements.has(element)) {
      element.classList.remove(hideClass);
      return;
    }
    element.classList.add(hideClass);
  });
}


var moveSelectActive = false;
var markEventHandlers = new Map();

var moveMarkUpdateInterval = null;
var wheelstackMenuUpdatingInterval = null;
// ! OUTSIDE FOR UPDATE, better to refactor but fine !
var blockingOrderData = null;
var blockingOrderId = null;
var wheelstackData = null;
var wheelstackId = null;
var selectRelated = [];
var blockedRelated = [];
var activeUserRole = null;
var openedPlacementId = null;
// --
export const createWheelstackMenu = async (
  event, openerElement, dataBanks = {}, markers = {}, ordersTable = null, placement, sourcePlacement) => {
  if (!('wheelstacks' in dataBanks)) {
    throw new Error('`wheelstacks` data bank is not provided');
  }
  if (!('orders' in dataBanks)) {
    throw new Error('`orders` data bank is not provided');
  }
  if (!('wheels' in dataBanks)) {
    throw new Error('`wheels` data bank is not provided');
  }
  if (moveSelectActive && !openerElement.classList.contains('active-move-select')) {
    if (!openerElement.classList.contains('move-possible')) {
      const warnMessage = BASIC_INFO_MESSAGE_WARNING;
      warnMessage.message = 'Закончите выбор перемещения';
      warnMessage.duration = 1500;
      flashMessage.show(warnMessage);
    }
    return;
  }
  if (wheelstackMenuUpdatingInterval) {
    forceMenuClose(null, true);
  }
  // + USER ROLE +
  activeUserRole = await getCookie(USER_ROLE_COOKIE_NAME);
  // - USER ROLE -
  blockingOrderId = openerElement.getAttribute(BASIC_ATTRIBUTES.BLOCKING_ORDER);
  if (blockingOrderId) {
    blockingOrderData = dataBanks['orders'][blockingOrderId];
  }
  wheelstackData = null;
  wheelstackId = openerElement.getAttribute(BASIC_ATTRIBUTES.WHEELSTACK_ID)
  if (wheelstackId) {
    wheelstackData = dataBanks['wheelstacks'][wheelstackId];
  }
  if (!wheelstackData && !wheelstackId) {
    if (blockingOrderId) {
      if (!blockingOrderData) {
        const warnMessage = BASIC_INFO_MESSAGE_WARNING;
        warnMessage.message = '<b>Отсутствуют</b> данные для заказа данной клетки<br><b>Попробуйте снова через период.</b>';
        warnMessage.duration = 2000;
        flashMessage.show(warnMessage);
      } else {
        createOrderMenu(
          event, openerElement, blockingOrderData, false
        );
      }
    };
    return;
  }
  openedPlacementId = placement.placementId;
  const wheelsData = dataBanks['wheels'];
  var menus = {};
  // + WHEELSTACK MENU +
  openerElement.classList.add('menu-active');
  const menu = document.createElement('div');
  menu.id = wheelstackData['_id'];
  menu.classList.add('wheelstack-menu');
  // TODO: complete rebuild :)
  // + MOVE FIELD +
  let clearMarks = null
  //  + FIRST MOVE CONTAINER +
  //  + MOVE INSIDE BUTTON +
  if (OPERATOR_ROLE !== activeUserRole) {
    const moveButtonsField = document.createElement('div');
    if (wheelstackData['blocked']) {
      moveButtonsField.classList.add('d-none');
    }
    selectRelated.push(moveButtonsField);
    moveButtonsField.classList.add('wheelstack-buttons');
    moveButtonsField.id = 'moveActionsField';
    const moveInsideButton = document.createElement('button');
    moveInsideButton.classList.add('btn', 'btn-dark', 'd-none', 'w-100');
    moveInsideButton.id = 'moveInsideButton';
    moveInsideButton.innerHTML = 'Переместить';
    moveButtonsField.appendChild(moveInsideButton);
    // - MOVE INSIDE BUTTON -
    // + MOVE OUTSIDE BUTTON +
    const moveOutsideButton = document.createElement('button');
    moveOutsideButton.classList.add('btn', 'btn-light', 'd-none', 'w-100');
    moveOutsideButton.id = 'moveOutsideButton';
    moveOutsideButton.innerHTML = 'Выгрузить';
    moveButtonsField.appendChild(moveOutsideButton);
    // - MOVE OUTSIDE BUTTON -
    // + CANCEL MOVE SELECT BUTTON +
    const cancelMoveSelectButton = document.createElement('button');
    cancelMoveSelectButton.classList.add('btn', 'btn-danger', 'm-2', 'd-none', 'w-75', 'h-75');
    cancelMoveSelectButton.id = 'cancelMoveSelectButton';
    cancelMoveSelectButton.innerHTML = 'Отменить выбор';
    moveButtonsField.appendChild(cancelMoveSelectButton);
    // - CANCEL MOVE SELECT BUTTON -
    // `firstStateShow` <- first button to activate
    // `selectActiveSHow` <- cancel of move selection
    const firstStateShow = new Set([
      moveInsideButton, moveOutsideButton
    ]);
    const selectActiveShow = new Set([
      cancelMoveSelectButton
    ]);
    if (moveSelectActive) {
      showHideElements(selectActiveShow, moveButtonsField);
    } else {
      showHideElements(firstStateShow, moveButtonsField);
    };
    clearMarks = () => {
      clearMarkEventHandlers(markEventHandlers, openerElement, [() => showHideElements(firstStateShow, moveButtonsField)]);
    }
    // + MOVE INSIDE ACTIONS +
    moveInsideButton.addEventListener('click', event => {
      if (moveSelectActive) {
        return;
      }
      showHideElements(selectActiveShow, moveButtonsField);
      openerElement.classList.add('active-move-select')
      
      const markMovePossible = (placement) => {
        moveSelectActive = true;
        const emptyCells = placement.element.querySelectorAll('.placement-cell-empty:not(.blocked):not(.move-possible)');
        if (0 === emptyCells.length && moveSelectActive) {
          const markedCells = placement.element.querySelectorAll('.placement-cell.move-possible');
          // NO new empty to mark, but we're still having some we can use.
          if (0 !== markedCells.length) {
            return;
          }
          const emptyMessage = BASIC_INFO_MESSAGE_WARNING;
          emptyMessage.message = 'В приямке нет свободных ячеек';
          flashMessage.show(emptyMessage);
          clearMarks();
          return;
        }
        const createMoveOrder = (element) => {
          return (event) => {
            if (element.classList.contains('move-possible') && moveSelectActive) {
              let [destinationRow, destinationCol ] = element.id.split('|');;
              const destinationData = {
                'destinationId': placement.placementId,
                'destinationType': placement.placementType,
                'destinationRow': destinationRow,
                'destinationCol': destinationCol,
              }
              createOrderMoveWholestackFromBaseGrid(wheelstackData, destinationData);
              clearMarks();
            }
          }
        }

        emptyCells.forEach(element => {
          if (element.classList.contains('move-possible')) {
            return;
          }
          const moveOrderHandler = createMoveOrder(element);
          element.classList.add('move-possible');
          markEventHandlers.set(
            element, {
              'click': moveOrderHandler
            });
          element.addEventListener('click', moveOrderHandler);
        })
      };

      moveMarkUpdateInterval = setInterval( () => {
        markMovePossible(placement);
        // Not canceling move actions until we return to our source placement (if wheelstack is not anymore present).
        // We will allow to use move action, but it will return an error == canceled by default.
        if (openedPlacementId !== placement.placementId) {
          return;
        }
        const openerWheelstackId = openerElement.getAttribute(BASIC_ATTRIBUTES.WHEELSTACK_ID);
        // SAME for closing menu
        const openerBlockingOrder = openerElement.getAttribute(BASIC_ATTRIBUTES.BLOCKING_ORDER);
        if (wheelstackId !== openerWheelstackId || openerBlockingOrder) {
          clearMarks();
        }
      }, 100);
      // cancelMoveSelect
      let lastTapTimeMoveSelect = 0;
      const cancelDblClickTouchHandler = (event) => {
        const currentTime = new Date().getTime();
        const tapInterval = currentTime - lastTapTimeMoveSelect;
        if (tapInterval < 275 && tapInterval > 0) {
          clearMarks();
        }
        lastTapTimeMoveSelect = currentTime;
      };
      const cancelDblClickHandler = (event) => {
        clearMarks();
      };
      markEventHandlers.set(
        document, {
          'touchstart': cancelDblClickTouchHandler,
          'dblclick': cancelDblClickHandler,
        });
      document.addEventListener('touchstart', cancelDblClickTouchHandler);
      document.addEventListener('dblclick', cancelDblClickHandler);
    });
    // - MOVE INSIDE ACTIONS -
    // + CANCEL MOVE SELECT ACTIONS +
    cancelMoveSelectButton.addEventListener('click', event => {
      clearMarks();
    });
    // - CANCEL MOVE SELECT ACTIONS -
    // - FIRST MOVE CONTAINER -
    menu.appendChild(moveButtonsField);
    // + MOVE OUTSIDE BUTTONS +
    //  + RETURN SELECT VIEW +
    const moveOutsideReturnButton = document.createElement('button');
    moveOutsideReturnButton.id = 'returnView';
    moveOutsideReturnButton.classList.add('d-none', 'return-view', 'btn', 'btn-light');
    const moveOutsideButtonImg = document.createElement('img');
    moveOutsideButtonImg.src = '/static/images/cancelBut.png';
    moveOutsideButtonImg.alt = 'Вернуть выбор способа переноса';
    moveOutsideReturnButton.appendChild(moveOutsideButtonImg);
    moveOutsideReturnButton.addEventListener('click', event => {
      showHideElements(firstStateShow, moveButtonsField);
    })
    moveButtonsField.appendChild(moveOutsideReturnButton);
    //  + OUTSIDE ELEMENT SELECTOR +
    const moveOutsideSelector = document.createElement('select');
    moveOutsideSelector.classList.add('d-none', 'form-select', 'centered', 'w-50', 'm-2', 'fs-5', 'h-75', 'mt-4');
    for (let extraEl of Object.keys(placement.placementExtraRows)) {
      if ( PLACEMENT_TYPES.LABORATORY === extraEl) {
        continue;
      }
      const newOption = await createOption(extraEl, extraEl);
      moveOutsideSelector.appendChild(newOption);
    }
    moveButtonsField.appendChild(moveOutsideSelector);
    //  - OUTSIDE ELEMENT SELECTOR -
    //  + OUTSIDE BATCH CHECKBOX +
    const batchCheckbox = document.createElement('input');
    batchCheckbox.id = 'selectWholeBatch';
    batchCheckbox.type = 'checkbox';
    batchCheckbox.classList.add('d-none', 'batch-checkbox', );
    moveButtonsField.appendChild(batchCheckbox);
    const batchCheckboxLabel = document.createElement('label');
    batchCheckboxLabel.classList.add('d-none', 'text-muted', 'small', 'batch-checkbox-label')
    batchCheckboxLabel.innerHTML = 'Выбор всей партии';
    moveButtonsField.appendChild(batchCheckboxLabel);
    //  - OUTSIDE BATCH CHECKBOX -
    const moveOutsideButtonsContainer = document.createElement('div');
    moveOutsideButtonsContainer.classList.add('d-none', 'w-100', 'h-100', 'd-flex', 'flex-row', 'align-items-center', 'gap-2');
    //  + OUTSIDE PROCESS BUTTON +
    const moveOutsideMoveProcess = document.createElement('button');
    moveOutsideMoveProcess.classList.add('btn', 'process', 'fs-6', 'w-50', 'h-100', 'p-1', 'm-1');
    moveOutsideMoveProcess.innerHTML = 'Обработка';
    const creationHandler = async (process) => {
      const destElement = moveOutsideSelector.value;
      const destId = placement.placementId;
      if (batchCheckbox && batchCheckbox.checked) {
        await createProRejOrderBulk(
          wheelstackData, destElement, process, destId, false
        );
      } else {
        await createProRejOrderGrid(
          wheelstackData, destElement, process, destId
        );
      }
    }
    moveOutsideMoveProcess.addEventListener('click', event => {
      creationHandler(true)
    })
    moveOutsideButtonsContainer.appendChild(moveOutsideMoveProcess);
    const moveOutsideMoveReject = document.createElement('button');
    moveOutsideMoveReject.classList.add('btn', 'reject', 'fs-6', 'w-50', 'h-100', 'p-1', 'm-1');
    moveOutsideMoveReject.innerHTML = 'Отказ';
    moveOutsideMoveReject.addEventListener('click', event => {
      creationHandler(false)
    })
    moveOutsideButtonsContainer.appendChild(moveOutsideMoveReject);
    //  - OUTSIDE PROCESS BUTTON -
    moveButtonsField.appendChild(moveOutsideButtonsContainer);
    const moveOutsideActiveShow = new Set([
      moveOutsideReturnButton, moveOutsideSelector,
      moveOutsideButtonsContainer, batchCheckbox, batchCheckboxLabel
    ]);
    moveOutsideButton.addEventListener('click', event => {
      if (PLACEMENT_TYPES.GRID !== sourcePlacement.placementType) {
        const showMes = BASIC_INFO_MESSAGE_WARNING;
        showMes.message = '<b>Выгрузка с платформ запрещена</b><br>Сначало перенесите стопу в <b>Приямок</b>';
        showMes.duration = 3000;
        flashMessage.show(showMes);
        return;
      }
      showHideElements(moveOutsideActiveShow, moveButtonsField);
    });
    // - MOVE OUTSIDE BUTTONS -
    // - MOVE FIELD -
  }
  // + ORDER BLOCK FIELD +
  // TODO: refactor this cringe fiesta with `if`, but for now all I care is to set updating.
  let orderText = 'empty'
  if (wheelstackData['blocked']) {
    orderText = `<b>Ожидает</b><br>${EXTRA_ORDER_TYPES_TRANSLATE_TABLE[blockingOrderData['orderType']]}`;
  }
  const orderTitle = 'Ожидает выполнения заказа';
  const orderRecord = await createInfoRecord('blockOrderField', orderText, orderTitle, true);
  if (wheelstackData['blocked']) {
    orderRecord.setAttribute(BASIC_ATTRIBUTES.BLOCKING_ORDER, blockingOrderId);
  }
  if (!wheelstackData['blocked']) {
    orderRecord.classList.add('d-none');
  }
  blockedRelated.push(orderRecord);
  menu.appendChild(orderRecord);
  if (ordersTable) {
    orderRecord.addEventListener('dblclick', event => {
      focusTableOrder(blockingOrderId, ordersTable);
    });
    let lastTapTime = 0;
    orderRecord.addEventListener('touchstart', event => {
      const currentTime = new Date().getTime();
      const tapInterval = currentTime - lastTapTime;
      if (tapInterval < 700 && tapInterval > 0) {
          focusTableOrder(blockingOrderId, ordersTable);
      }
      lastTapTime = currentTime;
    });
  }
  orderRecord.addEventListener('click', async event => {
    if (checkExtraMenuOpened('orderMenu', menus)) {
      return;
    }
    let orderMenu = await createOrderMenu(event, orderRecord, blockingOrderData, false);
    menus['orderMenu'] = orderMenu
  });
  // }
  // - ORDER BLOCK FIELD -
  // + BATCH FIELD +
  const batchNumber = wheelstackData['batchNumber'];
  const batchData = dataBanks['batches'][batchNumber];
  const batchStatusClass = getBatchStatusClass(batchData);
  const batchFieldText = `<b>Номер партии</b><br>${batchNumber}`;
  const batchTitle = `Номер партии колёс стопы`;
  const batchRecord = await createInfoRecord('batchField', batchFieldText, batchTitle);
  batchRecord.setAttribute(BASIC_ATTRIBUTES.BATCH_NUMBER, batchNumber);
  batchRecord.classList.add(`batch-indicator`, batchStatusClass);
  batchRecord.addEventListener('click', async event => {
    // TODO: rebuild `assignBatchExpandableButtons`.
    if (checkExtraMenuOpened('batchMenu', menus)) {
      return;
    };
    let batchMenu = await createBatchMenu(
        event, batchRecord, batchData, markers['batchMarker'], dataBanks['batches'] 
    )
    if (OPERATOR_ROLE !== activeUserRole) {
      assignBatchExpandableButtons(batchMenu);
    }
    menus['batchMenu'] = batchMenu
  })
  menu.appendChild(batchRecord);
  // - BATCH FIELD -
  // + WHEELS +
  const wheelsList = document.createElement('ul');
  wheelsList.id = 'wheelsField';
  let blockedWheelObjectId = null;
  if (wheelstackData['blocked'] && (ORDER_MOVE_TO_LABORATORY === blockingOrderData['orderType'])) {
    blockedWheelObjectId = blockingOrderData['affectedWheels']['source'][0];
  }
  for (let wheelIndex = 5; wheelIndex > -1; wheelIndex -= 1) {
    const wheelObjectId = wheelstackData['wheels'][wheelIndex];
    const wheelData = wheelsData[wheelObjectId];
    let wheelRecord = null;
    if (wheelObjectId === blockedWheelObjectId) {
      wheelRecord = await createWheelRecord(wheelData, true);
    } else {
      wheelRecord = await createWheelRecord(wheelData);
    }
    wheelsList.appendChild(wheelRecord);
    if (!wheelData || blockingOrderId) {
      continue;
    };
    if (PLACEMENT_TYPES.BASE_PLATFORM !== sourcePlacement.placementType && OPERATOR_ROLE !== activeUserRole) {
      const expElement = wheelRecordAssignExpandable(wheelRecord);
      wheelRecord.addEventListener('click', event => {
        changeExpandableStatus([wheelRecord, expElement]);
      });
      labMoveHandler(expElement, wheelstackData, wheelObjectId, placement.placementId);
      wheelsList.appendChild(expElement);
    };
  }
  menu.appendChild(wheelsList);
  // - WHEELS -
  assignCloser(openerElement, menu, menus);
  document.body.appendChild(menu);
  updateMenuPosition(event, menu);
  menu.classList.add('show');
  if (wheelstackMenuUpdatingInterval) {
    clearInterval(wheelstackMenuUpdatingInterval);
    wheelstackMenuUpdatingInterval = null;
  }
  wheelstackMenuUpdatingInterval = setInterval( () => {
    updateMenu(
      openerElement,
      menu,
      dataBanks,
      placement,
      sourcePlacement,
    );  
  }, WHEELSTACK_MENU_UPDATE_INTERVAL);
  return menu;
}


const switchMoveBlocked = (blocked = false) => {
  blockedRelated.forEach( element => {
    if (blocked) {
      element.classList.remove('d-none');
    } else {
      element.classList.add('d-none');
    }
  });
  selectRelated.forEach( element => {
    if (blocked) {
      element.classList.add('d-none');
    } else {
      element.classList.remove('d-none');
    }
  });
}

const updateMenu = async (
  openerElement, wheelstackMenu, dataBanks, placement, sourcePlacement
) => {
  const openerWheelstackId = openerElement.getAttribute(BASIC_ATTRIBUTES.WHEELSTACK_ID);
  if (!openerElement || !openerElement.isConnected || openerWheelstackId !== wheelstackMenu.id  || !wheelstackMenu.isConnected) {
    forceMenuClose(null, true);
    return;
  }
  wheelstackData = dataBanks['wheelstacks'][wheelstackId];
  if (!wheelstackData) {
    forceMenuClose(null, true);
    const showMes = BASIC_INFO_MESSAGE_WARNING;
    showMes.message = '<b>Отсутствуют</b> данные стопы для открытого меню.<br>Исключительное закрытие меню';
    showMes.duration = 3000;
    flashMessage.show(showMes);
    if (wheelstackMenuUpdatingInterval) {
      clearInterval(wheelstackMenuUpdatingInterval);
      wheelstackMenuUpdatingInterval = null;
    };
    return;
  };
  // If it's blocked, only option we're going to have is to show what's blocking it. And which wheel is blocked.
  // When block will be lifted, we're going to reset wheels and show new data.
  // So, all we care is to delete expandable and show what's blocked.
  if (wheelstackData['blocked']) {
    const newBlocked = wheelstackData['lastOrder'];
    if (blockingOrderId && newBlocked === blockingOrderId && blockingOrderData) {
      return;
    }
    blockingOrderId = wheelstackData['lastOrder'];
    blockingOrderData = dataBanks['orders'][blockingOrderId];
    if (!blockingOrderData) {
      return;
    }
    // removeExpandables + removeEventListeners on wheels
    const orderType = blockingOrderData['orderType'];
    let blockedWheel = null;
    if (ORDER_MOVE_TO_LABORATORY === orderType) {
      blockedWheel = blockingOrderData['affectedWheels']['source'][0];  // only 1 wheel at all times.
    }
    const wheelsContainer = wheelstackMenu.querySelector('#wheelsField');
    const wheels = wheelsContainer.querySelectorAll(':not(.expandable)');
    const expandables = wheelsContainer.querySelectorAll('.expandable');
    wheels.forEach( wheelElement => {
      const newWheelElement = wheelElement.cloneNode(true);
      newWheelElement.classList.remove('expand-ind', 'open');
      if (newWheelElement.id === blockedWheel) {
        newWheelElement.classList.add('blocked');
      };
      wheelElement.replaceWith(newWheelElement);
    })
    expandables.forEach( expandable => {
      expandable.remove();
    });
    const blockOrderField = wheelstackMenu.querySelector('#blockOrderField');
    const newBlockText = `<b>Ожидает</b><br>${EXTRA_ORDER_TYPES_TRANSLATE_TABLE[orderType]}`;
    const newBlockTitle = 'Ожидает выполнения заказа';
    updateInfoRecord(blockOrderField, null, newBlockText, newBlockTitle, blockingOrderId);
    switchMoveBlocked(true);
  // `wheelstack` not blocked, but we still have previoud `id` set == reset everything
  } else if (blockingOrderId) {
    blockingOrderId = null;
    blockingOrderData = null;
    const blockOrderField = wheelstackMenu.querySelector('#blockOrderField');
    clearBlockedInfoField(blockOrderField);
    // TODO: very bad looking, and works only if we're not getting more wheels in the `wheelstack`.
    //    Which is correct rule, but we can do better...
    // returnExpandables + returnEventListeners on wheels
    const wheelsContainer = wheelstackMenu.querySelector('#wheelsField');
    const wheels = wheelsContainer.querySelectorAll(':not(.expandable)');
    // This one just appends `expandable` after itself.
    // + CLEAR WHEELS +
    for (let index = 0; index <= wheels.length - 1; index += 1) {
      const wheelElement = wheels[5 - index];
      const newWheelId = wheelstackData['wheels'][index];
      wheelElement.classList.remove('blocked');
      if (!newWheelId) {
        clearWheelRecord(wheelElement);
        continue;
      }
      if (sourcePlacement.placementType !== PLACEMENT_TYPES.BASE_PLATFORM && OPERATOR_ROLE !== activeUserRole) {
        const newExpandable = wheelRecordAssignExpandable(wheelElement);
        wheelElement.addEventListener('click', event => {
          changeExpandableStatus([wheelElement, newExpandable]);
        });
        // Last wheels, appends as extra element.
        if (index === 0) {
          wheelsContainer.appendChild(newExpandable);
        } else {
          wheelsContainer.insertBefore(newExpandable, wheels[(5 - index) + 1]);
        };
        labMoveHandler(newExpandable, wheelstackData, newWheelId, placement.placementId);
      };
      if (wheelElement.id !== newWheelId) {
        const wheelData = dataBanks['wheels'][newWheelId];
        updateWheelRecord(wheelElement, wheelData, false);
      };
    };
    // - CLEAR WHEELS -
    switchMoveBlocked(false);
  }
}
