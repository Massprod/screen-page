import BasePlatformManager from "./components/basePlatform/basePlatform.js";
import ZoomAndDrag from "../../utility/zoomDrag.js";
import CellHoverCoordinate from "../../utility/cellHover/cellHoverCoordinate.js";
import {
    BASIC_PRESET_NAMES,
    TEST_GRID_NAME,
    TEST_PLATFORM_NAME,
    BACK_URLS,
} from "./constants.js";
import GridManager from "./components/grid/grid.js";
import OrdersContextMenu from "./components/ordersContextMenu/ordersContextMenu.js";
import OrdersTable from "./components/ordersTable/ordersTable.js";
import BatchesContextMenu from "./components/batchesContextMenu/batchesContextMenu.js";
import StoragesManager from "./components/storages/storagesManager.js";
import BatchesExpandedContainer from "./components/storages/batchesContainer.js";
import WheelstackContextMenu from "./components/wheelstackContextMenu/wheelstackContextMenu.js";
import {
    BASIC_COOKIES,
    GRID_PAGE_ROLES,
    loginPage,
    NAV_BUTTONS,
    USER_ROLE_COOKIE_NAME,
    RESTRICTED_TO_THIS_ROLE,
    USER_ROLE_COOKIE_UPDATE_INTERVAL,
} from "../../uniConstants.js";
import NavigationButton from "../../utility/navButton/navButton.js";
import { AUTH_COOKIE_NAME } from "../../uniConstants.js";
import {
    keepAuthCookieFresh,
    getCookie,
    clearRedirect,
    validateRoleCookie,
} from "../../utility/roleCookies.js";


// COOKIE CHECK
keepAuthCookieFresh(AUTH_COOKIE_NAME);
const redirectUrl = `${loginPage}?message=${RESTRICTED_TO_THIS_ROLE}`
const userRole = await getCookie(USER_ROLE_COOKIE_NAME);
if (!userRole || !(userRole in GRID_PAGE_ROLES)) {
    clearRedirect(BASIC_COOKIES, redirectUrl);
}
setInterval( async () => {
    validateRoleCookie(USER_ROLE_COOKIE_NAME, GRID_PAGE_ROLES, redirectUrl);    
}, USER_ROLE_COOKIE_UPDATE_INTERVAL);
// ---
// NAV BUTTON
const navPosition = {
    top: '92%',
    left: 'auto',
    right: '3%',
    bottom: 'auto',
}
const roleNavButtons = NAV_BUTTONS[userRole];
const clearCookies = [USER_ROLE_COOKIE_NAME, AUTH_COOKIE_NAME];
const navButton = new NavigationButton(
    navPosition, roleNavButtons, clearCookies,
)
// ---

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
let batchesContextMenu = new BatchesContextMenu(
    "batch-row",
    BACK_URLS.GET_BATCH_NUMBER_DATA_BY_ID,
)

// let cellsContextMenu = null;
let storagesManager = null;
let batchesExpandedElements = null;
let wheelstackContextMenu = new WheelstackContextMenu();;


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
    platformManager.updatePlatformCells();
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
    gridManager.updateGridCells();
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

    // cellsContextMenu = new CellsContextMenu(
    //     "cell",
    //     BACK_URLS.CREATE_MOVE_WHOLE_ORDER,
    // );
    await ordersTable.updateActiveOrders();
    ordersTable.startUpdating();
    storagesManager = new StoragesManager(extraElementsContainer);
    batchesExpandedElements = new BatchesExpandedContainer();
})


export {
    platformManager, gridManager, ordersContextMenu, wheelstackContextMenu,
    batchesContextMenu, batchesExpandedElements,
}
