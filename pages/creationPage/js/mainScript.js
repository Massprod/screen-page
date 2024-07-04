import ZoomAndDrag from "../../utility/zoomDrag.js";
import BasePlatformManager from "../components/basePlatform/js/basePlatformManager.js";
import GridManager from "../components/grid/js/gridManager.js";
import { BACK_URLS, TEMPO_CONSTS } from '../components/constants.js';
import OrderManager from "../components/orderManager/js/orderManager.js";
import TablesContainerManager from "../components/ordersContainer/tablesContainer/js/tablesContainerManager.js";
import ColorManager from "../../utility/colorManager.js";

let platformManager = null;
let gridManager = null;
// let colorManager = null;


document.addEventListener('DOMContentLoaded', () => {
    // colorManager = new ColorManager('#3d48af', 15);
    const topSideContainer = document.getElementsByClassName('top-half');
    const topHalf = topSideContainer[0];
    platformManager = new BasePlatformManager(topHalf);
    const mainViewport = document.getElementsByClassName('viewport');
    const gridViewport = mainViewport[0]
    gridManager = new GridManager(gridViewport);
    const zoomer = new ZoomAndDrag({
        'viewport': gridViewport,
        'grid': gridManager.element
    })


    // tempo Zone for tabless

    // change to some constant function or w.e
    // active
    const orderTableManager = new TablesContainerManager(
        topHalf,
        platformManager,
        gridManager,
    );
    orderTableManager.addNewtable(
        `active`, 
        {
            // '_id': {
            //     'columnName': 'Номер заказа',
            //     'columnStyle': 'th',
            //     'cellStyle': 'td',
            // },
            'createdAt':  {
                'columnName': 'Поступил',
                'columnStyle': 'th',
                'cellStyle': 'td',
            },
            'orderType':  {
                'columnName': 'Тип',
                'columnStyle': 'th',
                'cellStyle': 'td',
            },
            'source':  {
                'columnName': 'Откуда',
                'columnStyle': 'th',
                'cellStyle': 'td',
            },
            'destination':  {
                'columnName': 'Куда',
                'columnStyle': 'th',
                'cellStyle': 'td',
            } 
        }
    )
    orderTableManager.addNewSwitchButton('active', 'Активные');
    orderTableManager.assignedTables['active'].updateTable(BACK_URLS.GET_ALL_ACTIVE_ORDERS_URL);
    orderTableManager.setTableUpdating('active', 500, BACK_URLS.GET_ALL_ACTIVE_ORDERS_URL);
    orderTableManager.assignedButtons['active'].showAssignedTable();
    // ---
    
    // completed
    orderTableManager.addNewtable(
        'completed',
        {
            'createdAt':  {
                'columnName': 'Поступил',
                'columnStyle': 'th',
                'cellStyle': 'td',
            },
            'completedAt': {
                'columnName': 'Выполнен',
                'columnStyle': 'th',
                'cellStyle': 'td',
            },
            'orderType':  {
                'columnName': 'Тип',
                'columnStyle': 'th',
                'cellStyle': 'td',
            },
            'source':  {
                'columnName': 'Откуда',
                'columnStyle': 'th',
                'cellStyle': 'td',
            },
            'destination':  {
                'columnName': 'Куда',
                'columnStyle': 'th',
                'cellStyle': 'td',
            }
        }
    );
    orderTableManager.addNewSwitchButton('completed', 'Выполненные');
    // orderTableManager.assignedTables['completed'].updateTable(BACK_URLS.GET_ALL_COMPLETED_ORDERS_URL);
    // orderTableManager.setTableUpdating('completed', 500, BACK_URLS.GET_ALL_COMPLETED_ORDERS_URL);
    // ---
    // canceled
    orderTableManager.addNewtable(
        'canceled',
        {
            'createdAt': {
                'columnName': 'Поступил',
                'columnStyle': 'th',
                'cellStyle': 'td',
            },
            'canceledAt': {
                'columnName': 'Отменён',
                'columnStyle': 'th',
                'cellStyle': 'td',
            },
            'orderType': {
                'columnName': 'Тип',
                'columnStyle': 'th',
                'cellStyle': 'td',
            },
            'source': {
                'columnName': 'Откуда',
                'columnStyle': 'th',
                'cellStyle': 'td',
            },
            'destination': {
                'columnName': 'Куда',
                'columnStyle': 'th',
                'cellStyle': 'td',
            }
        }
    );
    orderTableManager.addNewSwitchButton('canceled', 'Отменённые');
    // orderTableManager.assignedTables['canceled'].updateTable(BACK_URLS.GET_ALL_CANCELED_ORDERS_URL);
    // orderTableManager.setTableUpdating('canceled', 500, BACK_URLS.GET_ALL_CANCELED_ORDERS_URL);
    // ---
    // -----
    
})

export { platformManager, gridManager }
