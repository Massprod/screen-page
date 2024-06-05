import ZoomAndDrag from "../../utility/zoomDrag.js";
import BasePlatformManager from "../components/basePlatform/js/basePlatformManager.js";
import GridManager from "../components/grid/js/gridManager.js";

document.addEventListener('DOMContentLoaded', () => {

    const topSideContainer = document.getElementsByClassName('top-half');
    const topHalf = topSideContainer[0];
    const platformManager = new BasePlatformManager(topHalf);
    const mainViewport = document.getElementsByClassName('viewport');
    const gridViewport = mainViewport[0]
    const gridManager = new GridManager(gridViewport);
    const zoomer = new ZoomAndDrag({
        'viewport': gridViewport,
        'grid': gridManager.element,
        // 'zoomableZone': gridManager.element,
        // 'gridContainer': gridViewport,
        // 'maxScale': 1.4,
        // 'initialScale': 0.4,
    })
})