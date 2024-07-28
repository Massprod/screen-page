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


let platformManager = null;
let gridManager = null;
let hoverCoord = new CellHoverCoordinate("cell");
let ordersContextMenu = new OrdersContextMenu(
    BACK_URLS.GET_ORDER_DATA_BY_ID,
    true,
    false,
    false,
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


})

export { platformManager, gridManager, ordersContextMenu }
