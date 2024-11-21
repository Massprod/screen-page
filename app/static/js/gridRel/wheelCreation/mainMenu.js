import { BACK_URL, BASIC_INFO_MESSAGE_ERROR, BASIC_INFO_MESSAGE_PRESET, BASIC_INFO_MESSAGE_WARNING, WHEEL_STATUSES } from "../../uniConstants.js";
import { postRequest } from "../../utility/basicRequests.js";
import flashMessage from "../../utility/flashMessage/flashMessage.js";
import { assignValidators } from "../../utility/utils.js";
import { createConfirmationMenu } from "../../utility/confirmForm.js";


export const showMenu = (menuElement) => {
  let overlay = document.getElementById('blurOverlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'blurOverlay';
    overlay.classList.add('blur-overlay');
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = '';
  overlay.appendChild(menuElement);
  overlay.style.display = 'flex';
}

export const closeMenu = () => {
  const formOverlay = document.getElementById('blurOverlay');
  formOverlay.remove();
}


const gatherValidateWheelData = (menuElement) => {
  const batchElement = menuElement.querySelector('#batchNumber');
  const productIdElement = menuElement.querySelector('#productId');
  const markedPartElement = menuElement.querySelector('#markedPart');

  const batchValue = batchElement.value.trim();
  const productIdvalue = productIdElement.value.trim();
  const markedPartValue = markedPartElement.value.trim();

  if (!batchValue || !markedPartValue) {
    return null
  }
  const wheelData = {
    'batchNumber': batchValue,
    'productId': productIdvalue,
    'markedPart': markedPartValue,
  }
  return wheelData;
}


const createWheelAction = async (menuElement, wheelData) => {
  const creationDate = new Date();
  const creationDateIso = creationDate.toISOString();
  const wheelBodyData = {
    'wheelId': wheelData['markedPart'],
    'batchNumber': wheelData['batchNumber'],
    'receiptDate': creationDateIso,
    'status': WHEEL_STATUSES.UNPLACED,
    'sqlData': {
      'order_no': wheelData['batchNumber'],
      'year': creationDate.year,
      'product_ID': wheelData['productId'],
      'marked_part_no': wheelData['markedPart'],
      'shuttle_number': 0,
      'stack_number': 0,
      'number_in_stack': 0,
      'timestamp_submit': creationDateIso,
      'mark': 1,
    },
  };
  const reqArgs = {
    'method': 'POST',
    'body': JSON.stringify(wheelBodyData),
  }
  const createWheelURL = `${BACK_URL.POST_CREATE_WHEEL}/`;
  const wheelResp = await postRequest(
    createWheelURL, false, true, reqArgs,
  );
  const respData = await wheelResp.json();
  if (wheelResp.ok) {
    const showMsg = BASIC_INFO_MESSAGE_PRESET
    showMsg.message = `Колесо успешно создано.<br>Номер маркировки: <b>${wheelData['markedPart']}</b>`;
    showMsg.duration = 2000;
    flashMessage.show(showMsg);
    closeMenu();
    return;
  }
  if (409 === wheelResp.status) {
    const showMsg = BASIC_INFO_MESSAGE_WARNING;
    showMsg.message = 'Колесо с предоставленными данными существует.<br>Дубликаты запрещены.';
    showMsg.duration = 3000;
    flashMessage.show(showMsg);
    const productIdElement = menuElement.querySelector('#productId');
    const markedPartElement = menuElement.querySelector('#markedPart');
    const markedElements = []; 
    if (productIdElement.value) {
      productIdElement.classList.add('delete-blink');
    }
    markedPartElement.classList.add('delete-blink');
    markedElements.push(productIdElement, markedPartElement);
    setTimeout(() => {
      markedElements.forEach(element => {
        element.classList.remove('delete-blink');
      })
    }, 1750);
    return;
  }
  const errorMsg = BASIC_INFO_MESSAGE_ERROR;
  errorMsg.message = `Ошибка при создании колеса:<br><b>${respData['detail']}</b>`;
  errorMsg.duration = 4000;
  flashMessage.show(errorMsg);
}


const createMenuElement = (minInputLength = 4, maxInputLength = 20) => {
  const menuContainer = document.createElement('div');
  menuContainer.classList.add('form-container');

  // + TITLE + 
  const menuTitle = document.createElement('h4');
  menuTitle.classList.add('text-center');
  menuTitle.textContent = 'Добавление колеса';
  menuContainer.appendChild(menuTitle);
  // - TITLE -
  // + BATCH CONTAINER +
  const batchContainer = document.createElement('div');
  batchContainer.id = 'batchData';
  batchContainer.classList.add('mb-3');
  const labelBatchNumber = document.createElement('label');
  labelBatchNumber.classList.add('form-label');
  labelBatchNumber.setAttribute('for', 'batchNumber');
  labelBatchNumber.textContent = 'Номер партии';
  const inputBatchNumber = document.createElement('input');
  inputBatchNumber.classList.add('form-control');
  inputBatchNumber.id = 'batchNumber';
  inputBatchNumber.type = 'text';
  inputBatchNumber.required = true;
  inputBatchNumber.pattern = '^[0-9]*$';
  inputBatchNumber.minLength = minInputLength;
  inputBatchNumber.maxLength = maxInputLength;
  inputBatchNumber.setCustomValidity('');
  // assignValidators(inputBatchNumber);
  batchContainer.appendChild(labelBatchNumber);
  batchContainer.appendChild(inputBatchNumber);
  menuContainer.appendChild(batchContainer);
  // - BATCH CONTAINER -
  // + PRODUCT_ID CONTAINER +
  const productIdContainer = document.createElement('div');
  productIdContainer.id = 'productIdData';
  productIdContainer.classList.add('mb-3');
  const labelProductId = document.createElement('label');
  labelProductId.classList.add('form-label');
  labelProductId.setAttribute('for', 'productId');
  labelProductId.textContent = 'Номер изделия';
  const inputProductId = document.createElement('input');
  inputProductId.classList.add('form-control');
  inputProductId.id = 'productId';
  inputProductId.type = 'text';
  inputProductId.pattern = '^[0-9]*$';
  inputProductId.minLength = minInputLength;
  inputProductId.maxLength = maxInputLength;
  inputProductId.setCustomValidity('');
  // assignValidators(inputProductId);
  productIdContainer.appendChild(labelProductId);
  productIdContainer.appendChild(inputProductId);
  menuContainer.appendChild(productIdContainer);
  // - PRODUCT_ID CONTAINER -
  // + MARKED_PART_NO CONTAINER +
  const markedPartContainer = document.createElement('div');
  markedPartContainer.id = 'markedPartData';
  markedPartContainer.classList.add('mb-3');
  const labelMarkedPart = document.createElement('label');
  labelMarkedPart.classList.add('form-label');
  labelMarkedPart.setAttribute('for', 'markedPart');
  labelMarkedPart.textContent = 'Номер маркировки';
  const inputMarkedPart = document.createElement('input');
  inputMarkedPart.classList.add('form-control');
  inputMarkedPart.id = 'markedPart';
  inputMarkedPart.type = 'text';
  inputMarkedPart.required = true;
  inputMarkedPart.pattern = '^[0-9]*$';
  inputMarkedPart.minLength = minInputLength;
  inputMarkedPart.maxLength = maxInputLength;
  inputMarkedPart.setCustomValidity('');
  // assignValidators(inputMarkedPart);
  markedPartContainer.appendChild(labelMarkedPart);
  markedPartContainer.appendChild(inputMarkedPart);
  menuContainer.appendChild(markedPartContainer);
  // - MARKED_PART_NO CONTAINER -
  const validateInputs = [inputMarkedPart, inputBatchNumber, inputProductId]
  // + BUTTONS GROUP +
  const buttonsGroup = document.createElement('div');
  buttonsGroup.classList.add('d-flex', 'justify-content-between', 'gap-1');
  //  + CREATE BUTTON +
  const createButton = document.createElement('button');
  createButton.classList.add('btn', 'btn-warning');
  createButton.textContent = 'Добавить колесо';
  createButton.addEventListener('click', event => {
    for (let element of validateInputs) {
      if (!element.reportValidity()) {
        return;
      };
    }
    const wheelData = gatherValidateWheelData(menuContainer);
    if (!wheelData) {
      const showMsg = BASIC_INFO_MESSAGE_WARNING;
      showMsg.message = 'Заполните обязательные поля:<br><b>Номер партии</b> и <b>Номер маркировки</b>';
      showMsg.duration = 3000;
      flashMessage.show(showMsg);
      return;
    }
    createWheelAction(menuContainer, wheelData);
  })
  buttonsGroup.appendChild(createButton);
  //  - CREATE BUTTON -
  //  + CANCEL BUTTON +
  const cancelButton = document.createElement('button');
  cancelButton.classList.add('btn', 'btn-secondary');
  cancelButton.textContent = 'Отменить';
  cancelButton.addEventListener('click', event => {
    closeMenu();
  });
  buttonsGroup.appendChild(cancelButton);
  //  - CANCEL BUTTON -
  menuContainer.appendChild(buttonsGroup);
  // - BUTTONS GROUP -
  return menuContainer;
}


export const openWheelCreationMenu = async () => {
  const wheelMenu = createMenuElement();
  showMenu(wheelMenu);
}
