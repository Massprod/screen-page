import {
    getRequest,
    patchRequest,
} from "../utility/basicRequests.js";
import { getShiftedFromCurrent} from "../utility/timeConvert.js";
import { convertISOToCustomFormat } from "../utility/convertToIso.js";
import {
    AUTH_COOKIE_NAME,
    BACK_URL,
    LAB_PAGE_ROLES,
    LAB_PERSONAL_ROLE,
    loginPage,
    NAV_BUTTONS,
    RESTRICTED_TO_THIS_ROLE,
    USER_ROLE_COOKIE_NAME,
    USER_ROLE_COOKIE_UPDATE_INTERVAL,
    BASIC_COOKIES,
} from "../uniConstants.js";
import NavigationButton from "../utility/navButton/navButton.js";
import {
    keepAuthCookieFresh,
    getCookie,
    clearRedirect,
    validateRoleCookie,
} from "../utility/roleCookies.js";


// COOKIE CHECK
keepAuthCookieFresh(AUTH_COOKIE_NAME);
const redirectUrl = `${loginPage}?message=${RESTRICTED_TO_THIS_ROLE}`;
const userRole = await getCookie(USER_ROLE_COOKIE_NAME);
if (!userRole || !(userRole in LAB_PAGE_ROLES)) {
    clearRedirect(BASIC_COOKIES, redirectUrl);
}
setInterval( async () => {
    validateRoleCookie(USER_ROLE_COOKIE_NAME, LAB_PAGE_ROLES, redirectUrl);    
}, USER_ROLE_COOKIE_UPDATE_INTERVAL);
// ---
// NAV BUTTON
const navPosition = {
    top: '2%',
    left: 'auto',
    right: '2%',
    bottom: 'auto',
}
const roleNavButtons = NAV_BUTTONS[userRole];
const clearCookies = [USER_ROLE_COOKIE_NAME, AUTH_COOKIE_NAME];
const navButton = new NavigationButton(
    navPosition, roleNavButtons, clearCookies,
)
// ---
const statusChangeRequest = async (batchNumber, result) => {
    const statusUpdateURL = `${BACK_URL.POST_BATCH_STATUS_UPDATE}/${batchNumber}?laboratory_passed=${result}`;
    const resp = await patchRequest(statusUpdateURL, true, true);
    return resp;
}


const batchNumberDataRequest = async (batchNumber) => {
    const getDataURL = `${BACK_URL.GET_BATCH_DATA}/${batchNumber}`;
    const response = await getRequest(getDataURL, true, true);
    const respData = await response.json();
    return respData;
}


const createBatchRow = async (batchData) => {
    const batchRow = document.createElement('tr');
    batchRow.className = 'batch-row fw-bold';
    // BATCH NAME
    const batchNumberCell = document.createElement('td');
    batchNumberCell.textContent = batchData['batchNumber'];
    batchRow.appendChild(batchNumberCell);
    // BATCH LAST TEST DATE
    const lastTestDateCell = document.createElement('td');
    const lastTestDate = batchData['laboratoryTestDate'];
    if (!lastTestDate) {
        lastTestDateCell.textContent = 'Не производились';
    } else {
        const corDate = convertISOToCustomFormat(lastTestDate, false, true);
        lastTestDateCell.textContent = corDate;
    };
    batchRow.appendChild(lastTestDateCell);
    // RESULT IMAGE
    const resultImageCell = document.createElement('td');
    const resultImage = document.createElement('img');
    resultImage.classList.add('result-image');
    if (!lastTestDate) {
        resultImage.src = "static/images/notTested.png";
        resultImage.alt = "Not Tested"
    } else if (batchData['laboratoryPassed']) {
        resultImage.src = "static/images/approved.png";
        resultImage.alt = "Approved";
    } else {
        resultImage.src = "static/images/disapproved.png"
        resultImage.alt = "Disapproved";
    }
    resultImageCell.appendChild(resultImage);
    batchRow.appendChild(resultImageCell);
    batchRow.id = batchData['batchNumber'];
    return batchRow;
}


const createBatchDetails = async (batchData) => {
    const detailsRow = document.createElement('tr');
    const detailsCell = document.createElement('td');
    detailsCell.setAttribute('colspan', '3');
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'batch-details';
    const lastTestResult = document.createElement('p');
    if (batchData['laboratoryPassed']) {
        lastTestResult.innerHTML = `Результат последнего тестирования: <b>Пройдено</b>`;
    } else {
        lastTestResult.innerHTML = `Результат последнего тестирования: <b>Не пройдено</b>`;
    };
    detailsContainer.appendChild(lastTestResult);
    const creationDate = document.createElement('p');
    const corDate = convertISOToCustomFormat(batchData['createdAt'], false, true, true);
    creationDate.innerHTML = `Дата поступления партии: <b>${corDate}</b>`;
    detailsContainer.appendChild(creationDate);
    if (LAB_PERSONAL_ROLE === userRole) {
        if (!batchData['laboratoryPassed']) {
            const changeToPassedButton = document.createElement('button');
            changeToPassedButton.className = 'btn btn-success me-2';
            changeToPassedButton.textContent = 'Пройдено';
            changeToPassedButton.onclick = async () => {
                const response = await statusChangeRequest(batchData['batchNumber'], true);
                const recordNewData = await batchNumberDataRequest(batchData['batchNumber']);
                updateCreatedRecord(batchData['batchNumber'], recordNewData);
            }
            detailsContainer.appendChild(changeToPassedButton);
        }
        const changeToFailedButton = document.createElement('button');
        changeToFailedButton.className = 'btn btn-danger';
        changeToFailedButton.textContent = 'Не пройдено';
        changeToFailedButton.onclick = async () => {
            const response = await statusChangeRequest(batchData['batchNumber'], false);
            const recordNewData = await batchNumberDataRequest(batchData['batchNumber']);
            updateCreatedRecord(batchData['batchNumber'], recordNewData);
        }
        detailsContainer.appendChild(changeToFailedButton);    
    }
    detailsCell.appendChild(detailsContainer);
    detailsRow.appendChild(detailsCell);
    return detailsRow;
}


const generateBatchRows = async (batchesData) =>  {
    createdRows = {};
    const tableBody = document.getElementById('batchesTableBody');
    tableBody.innerHTML = "";
    if (0 === batchesData.length) {
        const noDataRow = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.setAttribute('colspan', '3');
        noDataCell.classList.add('text-center');
        noDataCell.textContent = 'Не найдено ни одной партии за указанный период';
        noDataRow.appendChild(noDataCell);
        tableBody.appendChild(noDataRow);
        return;
    }
    for (let batchData of batchesData) {
        const batchNumber = batchData['batchNumber'];
        if (!(batchNumber in createdRows)) {
            createdRows[batchNumber] = {
                'currentData': batchData,
            };
        }
        // ROW
        const batchRow = await createBatchRow(batchData);
        createdRows[batchNumber]['mainRow'] = batchRow;
        tableBody.appendChild(batchRow);
        // DETAILS
        const detailsRow = await createBatchDetails(batchData);
        createdRows[batchNumber]['detailsRow'] = detailsRow;
        tableBody.appendChild(detailsRow);
        batchRow.addEventListener('click', () => {
            const batchDetails = detailsRow.childNodes[0].childNodes[0]; 
            batchDetails.style.display = batchDetails.style.display === 'none' || batchDetails.style.display === '' ? 'block': 'none';
        })
    }
}


var createdRows  = {};
var startDate = null;
var endDate = null;
var batchDataURL = `${BACK_URL.GET_BATCHES_DATA_PERIOD}?period_start=${startDate}&period_end=${endDate}`;
var rowsUpdatingInterval = null;
// true == ascending | false == descending 
var batchesSorted = false;
var batchColumn = document.body.querySelector('#batchColumn');
batchColumn.addEventListener('click', async event => {
    if (!createdRows) {
        return;
    }
    var newOrder = Object.keys(createdRows);
    if (!batchesSorted) {
        newOrder.sort( (a, b) => {
            return a.localeCompare(b);
        })
        batchesSorted = true;
    } else {
        newOrder.sort( (a, b) => {
            return b.localeCompare(a);
        })
        batchesSorted = false;
    }
    let orderedData = [];
    for (let batchNumber of newOrder) {
        orderedData.push(createdRows[batchNumber]['currentData']);
    }
    await generateBatchRows(orderedData);
})


var datesColumn = document.body.querySelector('#dateColumn');
var datesSorted = false;
datesColumn.addEventListener('click', async event => {
    if (!createdRows) {
        return;
    }
    var newOrder = [];
    var emptyRecords = [];
    for (let key in createdRows) {
        const laboratoryTestDate = createdRows[key]['currentData']['laboratoryTestDate'];
        if (!laboratoryTestDate) {
            emptyRecords.push(
                {
                    'batchNumber': key,
                }
            )
            continue;
        }
        newOrder.push(
            {
                'laboratoryTestDate': laboratoryTestDate,
                'batchNumber': key,
            }
        );
    }
    if (!datesSorted) {
        newOrder.sort( (a, b) => {
            let dateA = a.laboratoryTestDate;
            if (!dateA) {
                dateA = new Date(8640000000000000);
            } else {
                dateA = new Date(dateA);
            }

            let dateB = b.laboratoryTestDate;
            if (!dateB) {
                dateB = new Date(8640000000000000);
            } else {
                dateB = new Date(dateB);
            }
            return dateA - dateB;
        })
        datesSorted = true;
    } else {
        newOrder.sort( (a, b) => {
            let dateA = a.laboratoryTestDate;
            if (!dateA) {
                dateA = new Date(-8640000000000000);
            } else {
                dateA = new Date(dateA);
            }
            let dateB = b.laboratoryTestDate;
            if (!dateB) {
                dateB = new Date(-8640000000000000);
            } else {
                dateB = new Date(dateB);
            }
            return dateB - dateA;
        })
        datesSorted = false;
    }
    let orderedData = [];
    for (let record of newOrder) {
        const batchNumber = record['batchNumber'];
        orderedData.push(createdRows[batchNumber]['currentData']);
    }
    for (let record of emptyRecords) {
        const batchNumber = record['batchNumber']
        orderedData.push(createdRows[batchNumber]['currentData']);
    }
    await generateBatchRows(orderedData);
})


document.getElementById('fetchBatchesBtn').addEventListener('click', async (event) => {
    const startElement = document.getElementById('startDate');
    const endElement = document.getElementById('endDate');
    let startDate = startElement.value;
    let endDate = endElement.value;
    let currentDate = getShiftedFromCurrent(0);
    if (!startDate) {
        startDate = getShiftedFromCurrent(-7);
        startElement.value = startDate;
    }
    if (!endDate) {
        endDate = currentDate;
        endElement.value = endDate;
    } else {
        // We need to include chosen day.
        endDate = new Date(endDate);
        endDate.setDate(endDate.getDate() + 1);
        const year = endDate.getFullYear();
        const month = String(endDate.getMonth() + 1).padStart(2, '0');
        const day = String(endDate.getDate()).padStart(2, '0');
        endDate = `${year}-${month}-${day}`;
    }
    if (startDate > endDate) {
        alert(
            'Дата начала периода не может быть позже конца периода. \
             Если не выбран конец периода, он равен текущему дню.');
        return;
    }
    batchDataURL = `${BACK_URL.GET_BATCHES_DATA_PERIOD}?period_start=${startDate}&period_end=${endDate}`;
    const authCookie = await getCookie(AUTH_COOKIE_NAME);
    const args = {
        'method': "GET",
        'headers': {
            'Authorization': `Bearer ${authCookie}`,
            'Content-Type': 'application/json',
            'accept': 'application/json',
        }
    }
    const response = await getRequest(batchDataURL, true, true);
    const data = await response.json()
    await generateBatchRows(data);
    startUpdating();
})

const updateCreatedRecord = async (batchNumber, newData)  => {
    if (!(batchNumber in createdRows)) {
        return;
    }
    const recordData = createdRows[batchNumber];
    createdRows[batchNumber]['currentData'] = newData;
    const lastTestDateCell = recordData['mainRow'].childNodes[1];
    const newDate = convertISOToCustomFormat(newData['laboratoryTestDate'], false, true);
    lastTestDateCell.textContent = newDate;
    const resultImage = recordData['mainRow'].childNodes[2].childNodes[0];
    if (newData['laboratoryPassed']) {
        resultImage.src = 'static/images/approved.png';
        resultImage.alt = 'Approved';
    } else {
        resultImage.src = 'static/images/disapproved.png';
        resultImage.alt = 'Disapproved';
    }
    const detailsElement = recordData['detailsRow'].childNodes[0].childNodes[0];
    const lastTestResult = detailsElement.childNodes[0];
    if (newData['laboratoryPassed']) {
        lastTestResult.innerHTML = `Результат последнего тестирования: <b>Пройдено</b>`;
    } else {
        lastTestResult.innerHTML = `Результат последнего тестирования: <b>Не пройдено</b>`;
    };
    const buttons = detailsElement.querySelectorAll('.btn');
    buttons.forEach( element => {
        element.remove();
    })
    if (LAB_PERSONAL_ROLE === userRole) {
        if (!newData['laboratoryPassed']) {
            const changeToPassedButton = document.createElement('button');
            changeToPassedButton.className = 'btn btn-success me-2';
            changeToPassedButton.textContent = 'Пройдено';
            changeToPassedButton.onclick = async () => {
                const response = await statusChangeRequest(newData['batchNumber'], true);
                const recordNewData = await batchNumberDataRequest(newData['batchNumber']);
                updateCreatedRecord(newData['batchNumber'], recordNewData);
            }
            detailsElement.appendChild(changeToPassedButton);
        }
        const changeToFailedButton = document.createElement('button');
        changeToFailedButton.className = 'btn btn-danger';
        changeToFailedButton.textContent = 'Не пройдено';
        changeToFailedButton.onclick = async () => {
            const response = await statusChangeRequest(newData['batchNumber'], false);
            const recordNewData = await batchNumberDataRequest(newData['batchNumber']);
            updateCreatedRecord(newData['batchNumber'], recordNewData);
        }
        detailsElement.appendChild(changeToFailedButton);
    }
}


const updateCreatedRows = async () => {
    if (!createdRows) {
        return;
    }
    const tableBody = document.getElementById('batchesTableBody');
    const response = await getRequest(batchDataURL, true, true);
    const newBatchesData = await response.json();
    for (let batchData of newBatchesData) {
        const batchNumber = batchData['batchNumber'];
        if (batchNumber in createdRows) {
            const createdData = createdRows[batchNumber];
            const lastUpdate = batchData['laboratoryTestDate'];
            const currentUpdate = createdData['currentData']['laboratoryTestDate'];
            if (lastUpdate > currentUpdate) {
                updateCreatedRecord(batchNumber, batchData);
            }
            continue;
        }
        const newBatchRow = await createBatchRow(batchData);
        tableBody.appendChild(newBatchRow);
        const newBatchRowDetails = await createBatchDetails(batchData);
        tableBody.appendChild(newBatchRowDetails);
        createdRows[batchData['batchNumber']] = {
            'currentData': batchData,
            'mainRow': newBatchRow,
            'detailsRow': newBatchRowDetails,
        }
        newBatchRow.addEventListener('click', () => {
            const batchDetails = newBatchRowDetails.childNodes[0].childNodes[0]; 
            batchDetails.style.display = batchDetails.style.display === 'none' || batchDetails.style.display === '' ? 'block': 'none';
        })
    }
}

const startUpdating = async () => {
    if (rowsUpdatingInterval) {
        return;
    }
    rowsUpdatingInterval = setInterval(async () => {
        updateCreatedRows();
    }, 600);
}

const stopUpdating = async () => {
    if (!rowsUpdatingInterval) {
        return;
    }
    clearInterval(rowsUpdatingInterval);
    rowsUpdatingInterval = null;
}
