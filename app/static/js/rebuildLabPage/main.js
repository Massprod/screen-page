import {
  postRequest
} from "../utility/basicRequests.js"
import flashMessage, {
  
} from "../utility/flashMessage/flashMessage.js";
import {
  LAB_PAGE_ROLES,
  RESTRICTED_TO_THIS_ROLE,
  AUTH_COOKIE_NAME,
  loginPage,
  USER_ROLE_COOKIE_NAME,
  BASIC_COOKIES,
  USER_ROLE_COOKIE_UPDATE_INTERVAL,
  NAV_BUTTONS,
  ACTIVE_USERNAME_COOKIE_NAME,
  BACK_URL,
  BASIC_INFO_MESSAGE_ERROR,
  LAB_PAGE_ACTION_ROLES,
  WHEEL_STATUSES,
  WHEELSTACK_MENU_UPDATE_INTERVAL,
  BASIC_INFO_MESSAGE_WARNING,
 } from '../uniConstants.js';
import { columnSettings } from './settings.js';
import NavigationButton from '../utility/navButton/navButton.js';
import {
  keepAuthCookieFresh,
  clearRedirect,
  validateRoleCookie,
  getCookie,
} from "../utility/roleCookies.js";


// #region pageSetup
// #region darkMode
const savedTheme = localStorage.getItem('theme');
const prefers = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const html = document.querySelector('html');

// Apply the initial theme
html.classList.add(prefers);
html.setAttribute('data-bs-theme', prefers);

const toggleThemeButton = document.getElementById('darkModeToggle'); // Assume the button has this ID
toggleThemeButton.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.classList.remove(currentTheme);
    html.classList.add(newTheme);
    html.setAttribute('data-bs-theme', newTheme);
    
    localStorage.setItem('theme', newTheme);
});
// #endregion darkMode
// #region cookies
keepAuthCookieFresh(AUTH_COOKIE_NAME);
const redirectUrl = `${loginPage}?message=${RESTRICTED_TO_THIS_ROLE}`
const activeUserRole = await getCookie(USER_ROLE_COOKIE_NAME);
if (!activeUserRole || !(activeUserRole in LAB_PAGE_ROLES)) {
    clearRedirect(BASIC_COOKIES, redirectUrl);
}
setInterval( async () => {
    validateRoleCookie(USER_ROLE_COOKIE_NAME, LAB_PAGE_ROLES, redirectUrl);    
}, USER_ROLE_COOKIE_UPDATE_INTERVAL);
// ---
// NAV BUTTON
const navPosition = {
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
}
const roleNavButtons = NAV_BUTTONS[activeUserRole];
const clearCookies = [USER_ROLE_COOKIE_NAME, AUTH_COOKIE_NAME];
const navButton = new NavigationButton(
    navPosition, roleNavButtons, clearCookies,
)
const header = document.querySelector('#header');
const navBut = navButton.navButton;
navBut.style.position = 'static';
header.appendChild(navBut);

const activeUsername = await getCookie(ACTIVE_USERNAME_COOKIE_NAME);
// #endregion cookies
// #endregion pageSetup


const tableDataURL = BACK_URL.LAB_TABLES_DATA;


const createExpandableRows = (batchNumber, parentColumns = 4) => {
  return `
  <div class="flex-row justify-content-center">
    <table id="expandable-rows-${batchNumber}" class="table  table-bordered">
      <tr>
        <td id="test-wheels-${batchNumber}" class="expandable-row" colspan="${parentColumns}" data-target-wheels="onTest" data-batch-number="${batchNumber}">Колёса отправленные в ОКК</td>
      </tr>
      <tr>
        <td id="all-wheels-${batchNumber}" class="expandable-row" colspan="${parentColumns}" data-target-wheels="all" data-batch-number="${batchNumber}">Все колёса партии</td>
      </tr>
    </table>
  </div>
  `;  
};


const createExpandedTableHTML = (tableId) => {
  return `
    <div class="expanded-table-container" style="width: 95%; margin: auto;">
      <table id="${tableId}" class="table table-responsive-xxl table-active table-hover table-striped table-bordered" style="width:100%">
        <thead class="align-middle">
        </thead>
      </table>
    </div>`;
};


// #region Requests
const approveWheelTest = async (butElement, batchNumber, testResult) => {
  const butData = butElement.data();
  const wheelObjectId = butData['wheelObjectId'];
  const reqURL = `${BACK_URL.POST_BATCH_STATUS_UPDATE_WHEEL}`;
  const reqData = {
    'batchNumber': String(batchNumber),
    'wheelObjectId': String(wheelObjectId),
    'testResult': testResult,
  };
  const reqArgs = {
    'body': JSON.stringify(reqData),
    'method': 'POST',
  };
  try {
    const response = await postRequest(
      reqURL, false, true, reqArgs
    );
    if (404 === response.status) {
      const msgStr = { ...BASIC_INFO_MESSAGE_ERROR};
      msgStr.message = 'Использованы <b>устаревшие данные</b><br><b>Таблица обновлена</b>';
      msgStr.duration = 4500;
      flashMessage.show(msgStr);
    };
  } catch (error) {
    console.error(error);
  };
};


const checkRole = (role) => {
  if (!(role in LAB_PAGE_ACTION_ROLES)) {
    noAccessMessage();
    return false;
  };
  return true;
}


const noAccessMessage = () => {
  const showMsg = {...BASIC_INFO_MESSAGE_WARNING};
  const message = `Вы не имеете прав доступа для выполнения действия.`;
  showMsg.message = message;
  showMsg.duration = 2500;
  flashMessage.show(showMsg);
};
// #endregion Requests


const tableErrorsHandle = function (xhr, error, thrown, table) {
  console.error("Error loading data:", xhr.responseText || error);

  const showMsg = {...BASIC_INFO_MESSAGE_ERROR};
  showMsg.message = `Ошибка при получении данных сервиса: <b>${thrown}</b><br>Статус ошибки: ${xhr.status}`;
  showMsg.duration = 6500;
  flashMessage.show(showMsg);

  table.clear();
  $('.dataTables_processing').hide();
};


const assignTable = (expandedId, tableId, batchNumber, wheelTypes) => {

  if ('onTest' === wheelTypes) {
    const corColumns = [...Object.values(columnSettings.testWheels.columns)]; 
    // #region resultColumn
    const resultColumn = corColumns[corColumns.length - 1];

    resultColumn.render = (columnData, type, rowData, settings) => {
      if ('display' === type) {
        if (columnData === null) {
          if (activeUserRole in LAB_PAGE_ACTION_ROLES) {
            const butHeight = '16px';
            const butWidth = '32px';  
            const container = `
              <div class="col fs-6">
                <button id="approveButton" class="btn btn-success btn-sm me-2 p-0" style="height: ${butHeight}; width: ${butWidth}; font-size: 10px;" data-wheel-object-id="${rowData['_id']}">✓</button>
                <button id="disapproveButton" class="btn btn-danger btn-sm p-0" style="height: ${butHeight}; width: ${butWidth}; font-size: 10px;" data-wheel-object-id="${rowData['_id']}">𐄂</button>
              </div>`
            return container;
          } else {
            return 'Ожидает';
          }
        };
        return columnData ? 'Прошло' : 'Не прошло';
      };
      return columnData;
    };
    // #endregion resultColumn
    const expandedTable = $(`#${tableId}`).DataTable({
      serverSide: true,
      processing: true,
      scrollY: '50vh',
      scrollCollapse: true,
      language: {
        url: '/static/js/rebuildLabPage/ru.json'
      },
      ajax: {
        url: `${tableDataURL}/test_wheels`,
        type: "GET",
        dataSrc: "data",
        data: (payload) => {
          const startDate = $(`#${expandedId}StartDate`).val();
          const endDate = $(`#${expandedId}EndDate`).val();
          const filterByArrivalDate = $(`#${expandedId}dateFieldToggle`).is(':checked');
          if (startDate) payload.startDate = startDate;
          if (endDate) payload.endDate = endDate;
          payload.arrivalDatePeriod = filterByArrivalDate;
          payload.batchNumber = batchNumber;
        },
        error: (xhr, error, thrown) => {
          tableErrorsHandle(xhr, error, thrown, expandedTable);
        },
      },
      order: [[1, 'desc']],
      columns: corColumns,
      dom: '<"row"<"col-md-7"B><"col-md-5"f>>' +
           '<"row"<"col-md-12"tr>>' +
           '<"row"<"col-md-4 pt-1"i><"col-md-8  pt-1 justify-content-end pagination-sm"p>>' +
           '<"row"<"col-md-3 pt-2"l>>',
      buttons: [
        {
          text: 'Обновить',
          className: 'btn btn-light btn-outline-dark btn-sm',
          action: function (e, dt, node, config) {
            dt.draw();
          },
        },
      ],
      initComplete: () => {
        const buttonsContainer = $(`#${expandedId} .dt-buttons`);
        buttonsContainer.append(`
          <div class="d-inline-block mx-2">
            <input type="date" id="${expandedId}StartDate" class="form-control form-control-sm" placeholder="Начало периода">
          </div>
          <div class="d-inline-block mx-2">
            <input type="date" id="${expandedId}EndDate" class="form-control form-control-sm" placeholder="Конец периода">
          </div>
          <div class="form-check d-inline-block mx-2">
            <label class="form-check-label" for="${expandedId}dateFieldToggle">
              <input class="form-check-input" type="checkbox" id="${expandedId}dateFieldToggle">
              Период поступления
            </label>
          </div>
        `);
        $(`#${expandedId}StartDate, #${expandedId}EndDate`).on('change', () => {
          expandedTable.draw();
        });
      },
      createdRow: (row, data) => {
        row.setAttribute('_id', data['_id']);
      },
    });
    expandedTable.on('click', '#approveButton', async function() {
      if (!checkRole(activeUserRole)) {
        return;
      };
      const butElement = $(this);
      await approveWheelTest(butElement, batchNumber, true);
      expandedTable.draw(false);
    });
    expandedTable.on('click', '#disapproveButton', async function() {
      if (!checkRole(activeUserRole)) {
        return;
      };
      const butElement = $(this);
      await approveWheelTest(butElement, batchNumber, false);
      expandedTable.draw(false);
    });
  } else if ('all' === wheelTypes) {
    const allWheelsColumns = Object.values(columnSettings['allWheels']['columns']);
    const statusColumn = allWheelsColumns[allWheelsColumns.length - 1];
    statusColumn.render = statusColumnHandler;

    const expandedTable = $(`#${tableId}`).DataTable({
      serverSide: true,
      processing: true,
      scrollY: '50vh',
      scrollCollapse: true,
      language: {
        url: '/static/js/rebuildLabPage/ru.json'
      },
      ajax: {
        url: `${tableDataURL}/all_wheels`,
        type: "GET",
        dataSrc: "data",
        data: (payload) => {
          const startDate = $(`#${expandedId}StartDate`).val();
          const endDate = $(`#${expandedId}EndDate`).val();
          if (startDate) payload.startDate = startDate;
          if (endDate) payload.endDate = endDate;
        },
        error: (xhr, error, thrown) => {
          tableErrorsHandle(xhr, error, thrown, expandedTable);
        },
      },
      order: [[1, 'desc']],
      columns: allWheelsColumns,
      dom: '<"row"<"col-md-7"B><"col-md-5"f>>' +
           '<"row"<"col-md-12"tr>>' +
           '<"row"<"col-md-4 pt-1"i><"col-md-8  pt-1 justify-content-end pagination-sm"p>>' +
           '<"row"<"col-md-3 pt-2"l>>',
      buttons: [
        {
          text: 'Обновить',
          className: 'btn btn-light btn-outline-dark btn-sm',
          action: function (e, dt, node, config) {
            dt.draw(false);
          },
        },
      ],
      initComplete: () => {
        const buttonsContainer = $(`#${expandedId} .dt-buttons`);
        buttonsContainer.append(`
          <div class="d-inline-block mx-2">
            <input type="date" id="${expandedId}StartDate" class="form-control form-control-sm" placeholder="Начало периода">
          </div>
          <div class="d-inline-block mx-2">
            <input type="date" id="${expandedId}EndDate" class="form-control form-control-sm" placeholder="Конец периода">
          </div>`
        );
        $(`#${expandedId}StartDate, #${expandedId}EndDate`).on('change', () => {
          expandedTable.draw();
        });
      },
      createdRow: (row, data) => {
        row.setAttribute('_id', data['_id']);
      },
    })
    expandedTable.on('click', '#requestWheel', async function () {
      if (!checkRole(activeUserRole)) {
        return;
      };
      const targetWheel = this.getAttribute('data-wheel-object-id');
      const requestWheelURL = `${BACK_URL.POST_BATCH_REQUEST_WHEEL}?wheelObjectId=${targetWheel}`;
      const response = await postRequest(requestWheelURL, false, true);
      if (403 === response.status) {
        const showMsg = {...BASIC_INFO_MESSAGE_ERROR};
        showMsg.message = 'Не удалось <b>создать</b> запрос на перемещение.<br>Стопа содержащая колесо заблокирована.';
        showMsg.duration = 4500;
        flashMessage.show(showMsg);
      };
      expandedTable.draw(false);
    });
  };
};

// #region extraHandlers
const wheelsTableHandler = (element) => {
  // JQuery `.data()` converts all `data-*` fields into camelcase `-` <= breakpoint.
  const targetExpandable = $(element);
  const targetBatchNumber = targetExpandable.data("batchNumber");
  const wheelTypes = targetExpandable.data("targetWheels");
  const expandedRowId = `expandedRow-${targetBatchNumber}-${wheelTypes}`;
  if (targetExpandable.hasClass('expanded')) {
    $(`#${expandedRowId}`).remove();
    targetExpandable.removeClass('expanded');
    return;
  };
  targetExpandable.addClass('expanded');
  const expandedTableId = `expandedTable-${targetBatchNumber}-${wheelTypes}`;
  const expandedTableHTML = createExpandedTableHTML(`${expandedTableId}`);
  const expandableRowHtml = `<tr id="${expandedRowId}"><td colspan="4">${expandedTableHTML}</td></tr>`
  targetExpandable.parent().after(expandableRowHtml);
  assignTable(expandedRowId, expandedTableId, targetBatchNumber, wheelTypes);
};

// #region allWheelsStatus
const gridElement = (data) => {
  const wheelPosition = data['wheelStack']['wheelStackPosition'] + 1;
  
  const placementName = data['wheelStack']['placementName']['grid'][0]['name'];
  
  const wheelstackData = data['wheelStack']['wheelstackData'][0];
  const wheelstackRow = wheelstackData['rowPlacement'];
  const wheelstackCol = wheelstackData['colPlacement'];
  const wheelstackBlocked = wheelstackData['blocked'];
  const wheelstackLimit = wheelstackData['maxSize'];

  const columnString = `Приямок: <b>${placementName}</b> <b>Ряд</b> - <b>${wheelstackRow}</b> | <b>Колонна</b> - <b>${wheelstackCol}</b> Позиция в стопе: <b>${wheelPosition}/${wheelstackLimit}</b>`;
  const blockedStr = wheelstackBlocked ? `<br>Стопа <b>ожидает</b> перемещения` : `Стопа <b>доступна</b> к перемещению`;
  const wheelString = columnString + ' ' + blockedStr;

  const requestButtonHTML = wheelstackBlocked ? '': `<button id="requestWheel" class="btn btn-secondary btn-sm" data-wheel-object-id=${data['_id']}>Запросить</button>`;
  let htmlEl =  `<div class="row align-items-center"><div class="col">${wheelString}</div></div>`;
  if (!wheelstackBlocked) {
    htmlEl = `<div class="row row-lg-12 align-items-center"><div class="col-lg-9 col-md-8 col-sm-12">${wheelString}</div><div class="col-lg-3 col-md-4 col-sm-12">${requestButtonHTML}</div></div>`;  
  };
  return htmlEl;
};


const platformElement = (data) => {
  const wheelPosition = data['wheelStack']['wheelStackPosition'] + 1;
  
  const placementName = data['wheelStack']['placementName']['basePlatform'][0]['name'];

  const wheelstackData = data['wheelStack']['wheelstackData'][0];
  const wheelstackRow = wheelstackData['rowPlacement'];
  const wheelstackCol = wheelstackData['colPlacement'];
  const wheelstackBlocked = wheelstackData['blocked'];
  const wheelstackLimit = wheelstackData['maxSize'];

  const columnString = `Челнок: <b>${placementName}</b> <b>Ряд</b> - <b>${wheelstackRow}</b> | <b>Колонна</b> - <b>${wheelstackCol}</b> Позиция в стопе: <b>${wheelPosition}/${wheelstackLimit}</b>`;
  const blockedStr = wheelstackBlocked ? `<br>Стопа <b>ожидает</b> перемещения` : `<br>Стопа <b>доступна</b> к перемещению`;
  const htmlEl = columnString + ' ' + blockedStr;
  return htmlEl;
};


const shippedElement = (data) => {
  const shipStatus = data['status'];
  let htmlEl = '';
  if (WHEEL_STATUSES.REJECTED === shipStatus) {
    htmlEl = `Колесо выгружено из приямка в виде несоответствующей продукии`;
  } else {
    htmlEl = `Колесо выгружно из приямка на дальнейшую обработку`;
  };
  return htmlEl;
};


const labElement = (data) => {
  const htmlEl = `Колесо выгружено в ОКК`;
  return htmlEl;
};


const unplacedElement = (data) => {
  const htmlEl = `Колесо не находится в составе <b>стопы</b>`;
  return htmlEl;
};


const storageElement = (data) => {  
  const htmlEl = `Колесо находится во временном хранилище`;
  return htmlEl;
};


const statusColumnHandler = (columnData, type, rowData, settings) => {
  if (columnData === WHEEL_STATUSES.GRID) {
    return gridElement(rowData);
  } else if (columnData === WHEEL_STATUSES.PLATFORM) {
    return platformElement(rowData);
  } else if (columnData === WHEEL_STATUSES.REJECTED || columnData === WHEEL_STATUSES.SHIPPED) {
    return shippedElement(rowData);
  } else if (columnData === WHEEL_STATUSES.WH_LABORATORY) {
    return labElement(rowData);
  } else if (columnData === WHEEL_STATUSES.UNPLACED) {
    return unplacedElement(rowData);
  } else if (columnData === WHEEL_STATUSES.STORAGE) {
    return storageElement(rowData);
  };
  return columnData;
};
// #endregion allWheelsStatus
// #endregion extraHandlers

const addExpandableRowListeners = (parentTable) => {
  parentTable.on('click', 'tr.clickable-row', function (event) {
    // In JQuery, event delegation provides context `this` of the element triggered event.
    // But, we can't use arrow function, it will lose context.
    const targetRow = $('#mainTable').DataTable().row(this);
    if (targetRow.child.isShown()) {
      targetRow.child.hide();
      this.classList.remove('highlight');
      return;
    } 
    this.classList.add('highlight');
    const targetBatchNumber = targetRow.data().batchNumber;
    const expandableRowsRawHTML = createExpandableRows(targetBatchNumber);
    targetRow.child(expandableRowsRawHTML).show();
    // #region testWheels
    $(`#test-wheels-${targetBatchNumber}`).on('click', function () {
      const target = $(this);
      if (target.hasClass('highlight')) {
        target.removeClass('highlight');
      } else {
        target.addClass('highlight');
      };
      wheelsTableHandler(this);
    });
    // #endregion testWheels
    // #region allWheels
    $(`#all-wheels-${targetBatchNumber}`).on('click', function () {
      const target = $(this);
      if (target.hasClass('highlight')) {
        target.removeClass('highlight');
      } else {
        target.addClass('highlight');
      };
      wheelsTableHandler(this);
    });
    // #endregion allWheels
  });
};


// #region mainTable
$(document).ready(() => {
  let mainTable = null;
  
  const initializeMainTable = () => {
    mainTable = $('#mainTable').DataTable({
      serverSide: true,
      processing: true,
      responsive: true,
      scrollY: '75vh',
      scrollCollapse: true,
      language: {
        url: '/static/js/rebuildLabPage/ru.json',
      },
      ajax: {
        url: `${tableDataURL}/batch_main`,
        type: "GET",
        dataSrc: "data",
        data: (payload) => {
          const startDate = $('#MainStartDate').val();
          const endDate = $('#MainEndDate').val();
          const filterByCreatedAt = $('#dateFieldToggle').is(':checked');
          if (startDate) payload.startDate = startDate;
          if (endDate) payload.endDate = endDate;
          payload.createdAtPeriod = filterByCreatedAt;
        },
        error: (xhr, error, thrown) => {
          tableErrorsHandle(xhr, error, thrown, mainTable);
        },
      },
      columns: [...Object.values(columnSettings.main.columns)],
      order: [[1, 'desc']],
      dom: '<"row"<"col-md-7"B><"col-md-5"f>>' +
           '<"row"<"col-md-12"tr>>' +
           '<"row"<"col-md-4 pt-1"i><"col-md-8 pt-1 justify-content-end pagination-sm"p>>' +
           '<"row"<"col-md-3 pt-2"l>>',
      buttons: [
        {
          text: 'Обновить',
          className: 'btn btn-light btn-outline-dark btn-sm',
          action: function (e, dt, node, config) {
            dt.draw();
          }
        },
      ],
      initComplete: function () {
        const buttonsContainer = $('.dt-buttons');
        buttonsContainer.append(`
          <div class="d-inline-block mx-2">
            <input type="date" id="MainStartDate" class="form-control form-control-sm" placeholder="Начало периода">
          </div>
          <div class="d-inline-block mx-2">
            <input type="date" id="MainEndDate" class="form-control form-control-sm" placeholder="Конец периода">
          </div>
          <div class="form-check d-inline-block mx-2">
            <label class="form-check-label" for="dateFieldToggle">
              <input class="form-check-input" type="checkbox" id="dateFieldToggle">
              Период поступления
            </label>
          </div>
        `);
      },
      createdRow: function (row, data, dataIndex) {
        // `row` <- dom element
        // `data` <- current data of the row
        // `dataIndex` <- index of the row in tbody
        $(row).addClass('clickable-row');
        row.setAttribute('batchNumber', data['batchNumber']);
      },
    });
  
    $('#MainStartDate, #MainEndDate').on('change', function () {
      mainTable.draw();
    });
  };
  
  initializeMainTable();
  addExpandableRowListeners(mainTable);
});
// #endregion mainTable
