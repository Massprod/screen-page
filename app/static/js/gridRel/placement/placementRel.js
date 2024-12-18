import {
  ACTIVE_USERNAME_COOKIE_NAME,
  BACK_URL,
  PLACEMENT_TYPES,
  SAVED_GRID_COOKIE_NAME,
  SAVED_PLATFORM_COOKIE_NAME,
} from "../../uniConstants.js";
import { getRequest } from "../../utility/basicRequests.js";
import { setCookie, getCookie } from "../../utility/roleCookies.js";



export const getPlacementData = async (placementInd, placementType, useName = false) => {
  let dataURL = null;
  if (PLACEMENT_TYPES.BASE_PLATFORM === placementType) {
    if (useName) {
      dataURL = `${BACK_URL.GET_PLATFORM_STATE_BY_NAME}`
    } else {
      dataURL = `${BACK_URL.GET_PLATFORM_STATE}`;
    }  
  } else if (PLACEMENT_TYPES.GRID === placementType) {
    if (useName) {
      dataURL = `${BACK_URL.GET_GRID_STATE_BY_NAME}`;
    } else {
      dataURL = `${BACK_URL.GET_GRID_STATE}`;
    }
  }
  dataURL = `${dataURL}/${placementInd}?includeWheelstacks=false`;
  const resp = await getRequest(dataURL, true, true);
  const respData = await resp.json()
  return respData;
}

export const selectPlacementButtonAction = async (
  selectorElement, placement, showElements,
  hideElements, viewState, viewButton, useIdentifiers, placementNameSpan = null,
) => {
  if (!selectorElement.value) {
      flashMessage.show({
          'message': 'Выберите расположение',
      })
      return viewState;
  };
  const optionValue = JSON.parse(selectorElement.value);
  let placementId = null;
  let presetId = null;
  if ('name' in optionValue) {
    const placementData = await getPlacementData(optionValue['name'], placement.placementType, true);
    placementId = placementData['_id'];
    presetId = placementData['preset'];
  } else {
    placementId = optionValue['_id'];
    presetId = optionValue['presetId'];
  }
  // + PLACEMENT NAME +
  if (placementNameSpan) {
    let placementName = selectorElement.querySelector(`#${CSS.escape(placementId)}`);
    placementNameSpan.innerHTML = placementName.textContent;
  }
  // - PLACEMENT NAME -
  // + SAVE PLACEMENT COOKIE +
  const placementCookie = `${placementId};${presetId}`;
  const activeUser = await getCookie(ACTIVE_USERNAME_COOKIE_NAME);
  if (PLACEMENT_TYPES.GRID === placement.placementType) {
    setCookie(`${activeUser}-${SAVED_GRID_COOKIE_NAME}`, placementCookie);
  } else if (PLACEMENT_TYPES.BASE_PLATFORM === placement.placementType) {
    setCookie(`${activeUser}-${SAVED_PLATFORM_COOKIE_NAME}`, placementCookie);
  };
  // - SAVE PLACEMENT COOKIE -
  await preparePlacement(presetId, placement, useIdentifiers);
  await switchView(hideElements, showElements);
  viewButton.classList.remove('hidden');
  return placementId;
}

export const preparePlacement = async (presetId, placement, useIdentifiers) => {
  const presetDataURL = `${BACK_URL.GET_PRESET_DATA}/${presetId}`;
  const response = await getRequest(presetDataURL, true, true);
  const presetData = await response.json();
  placement.buildPreset(presetData, useIdentifiers);
}

export const switchView = async (activeElements, inActiveElements) => {
  activeElements.forEach( element => {
      element.classList.add('hidden');
  })
  inActiveElements.forEach( element => {
      element.classList.remove('hidden');
  })
}