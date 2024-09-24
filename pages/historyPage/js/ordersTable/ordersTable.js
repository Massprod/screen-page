import {
    PLACEMENT_TYPES,
    LABORATORY_NAME,
    EXTRA_ELEMENT_NAME,
    STORAGE_NAME,
    BACK_URLS,
} from "../../../managerPage/js/constants.js";
import { getRequest } from "../../../utility/basicRequests.js";


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
