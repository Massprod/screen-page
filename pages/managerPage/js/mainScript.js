import BasePlatformManager from "./components/basePlatform/basePlatform.js";
import ZoomAndDrag from "../../utility/zoomDrag.js";
import CellHoverCoordinate from "../../utility/cellHover/cellHoverCoordinate.js";
import {
    BASIC_PRESET_NAMES,
    TEST_GRID_NAME,
    TEST_PLATFORM_NAME,
    BACK_URLS
} from "./constants.js";
import GridManager from "./components/grid/grid.js";
import OrdersContextMenu from "./components/ordersContextMenu/ordersContextMenu.js";
import flashMessage from "../../utility/flashMessage.js";
import OrdersTable from "./components/ordersTable/ordersTable.js";
import ColumnResizer from "../../utility/columnsResize/resizer.js";
import CellsContextMenu from "./components/cellsContextMenu/cellsContextMenu.js";



let platformManager = null;
let gridManager = null;
let hoverCoord = new CellHoverCoordinate("cell");
let ordersContextMenu = new OrdersContextMenu(
    BACK_URLS.GET_ORDER_DATA_BY_ID,
    true,
    false,
    false,
    BACK_URLS.COMPLETE_ORDER_BY_ID,
    BACK_URLS.CANCEL_ORDER_BY_ID,
);



// TODO: Think about CLASS_NAMES, because if we change class name in CSS.
//  It's going to be changed only here, can we store it as styleContants?
//  If we can, we can at least guarantee consistency in CSS, but what about JS?
//  How we can geet var() from css styling to JS, if I remember correctly we can't.
//  So, it's either use them as plain text or I need to make more research.

document.addEventListener('DOMContentLoaded', async () => {
    // +++ basePlatform SETUP
    const platformsContainer = document.getElementById("platformsContainer");
    const platformPresetName = BASIC_PRESET_NAMES.PMK_PLATFORM;
    platformManager = new BasePlatformManager(
        platformsContainer
    );
    await platformManager.updatePreset(platformPresetName);
    platformManager.platformName = TEST_PLATFORM_NAME;
    await platformManager.buildPlatform();
    await platformManager.updatePlatformCells();
    platformManager.startUpdating();
    // basePlatform SETUP ---
    // +++ GRID SETUP
    const gridsContainer = document.getElementById("gridsContainer");
    const gridPresetName = BASIC_PRESET_NAMES.PMK_GRID;
    const extraElementsContainer = document.getElementById("botContainer");
    gridManager = new GridManager(
        gridsContainer, extraElementsContainer,
    );
    await gridManager.updatePreset(gridPresetName);
    const zoomer = new ZoomAndDrag({
        'viewport': gridsContainer,
        'grid': gridManager.element,
    })
    gridManager.gridName = TEST_GRID_NAME;
    await gridManager.buildGrid();
    await gridManager.updateGridCells();
    gridManager.startUpdating();
    // GRID SETUP ---
    // +++ ORDERS TABLE
    const ordersTableContainer = document.getElementById('orderTablesContainer');
    const ordersTable = new OrdersTable(
        ordersTableContainer,
        [platformManager.platformId],
        [gridManager.gridId],
        BACK_URLS.GET_ALL_ORDERS_DATA,
        ["batchNumber", "orderId", "orderType", "source", "destination", "createdAt"],
    )
    
    let cellsContextMenu = new CellsContextMenu(
        "cell",
        BACK_URLS.CREATE_MOVE_WHOLE_ORDER,
    );

    // ORDERS TABLE ---
    // TODO: MAYBE finish and apply it. But it was just an experiment and we don't need it.
    // +++ TABLE RESIZER 
    // const table = document.querySelector('.orders-table-content table');
    // const tableHeaders = document.querySelectorAll('.orders-table-header th');

    // const columnResizer = new ColumnResizer(table, tableHeaders, 80, 350);
    // TABLE RESIZER ---
    ordersTable.startUpdating();


    // const tableBody = document.querySelector('.orders-table-content tbody');

    // for (let i = 1; i <= 500; i++) {
    //     const row = document.createElement('tr');

    //     const partyNumberCell = document.createElement('td');
    //     partyNumberCell.textContent = `12345678901234567890123${i}`;
    //     row.appendChild(partyNumberCell);

    //     const orderNumberCell = document.createElement('td');
    //     orderNumberCell.textContent = `12345678901234567890123`;
    //     row.appendChild(orderNumberCell);

    //     const orderTypeCell = document.createElement('td');
    //     orderTypeCell.innerHTML = `<b>Тип</b> Перенос стопки в Приямок`;
    //     row.appendChild(orderTypeCell);

    //     const sourceCell = document.createElement('td');
    //     sourceCell.innerHTML = `<b>ID</b>=12345678901234567890123<br><b>Ряд</b>:D  <b>Колонна</b>:58${i}`;
    //     row.appendChild(sourceCell);

    //     const destinationCell = document.createElement('td');
    //     destinationCell.innerHTML = `<b>ID</b>=12345678901234567890123<br><b>Ряд</b>:D  <b>Колонна</b>:58${i}`;
    //     row.appendChild(destinationCell);

    //     const timeCell = document.createElement('td');
    //     timeCell.textContent = new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 30))).toLocaleString();
    //     row.appendChild(timeCell);

    //     // columnResizer.applyColumnSizesToNewRow(row);

    //     tableBody.appendChild(row);

    // }
    
})

export { platformManager, gridManager, ordersContextMenu }
