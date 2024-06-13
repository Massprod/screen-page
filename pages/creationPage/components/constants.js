export const CLASS_NAMES = {
  WHEEL_STACK_ELEMENT: {
    WHEEL_STACK: 'wheel-stack',
    WHEEL_STACK_IDENTIFIER: 'wheel-stack-identifier', 
    WHEEL_STACK_WHITESPACE: 'wheel-stack-whitespace',
    WHEEL_STACK_CONTEXT_MENU: 'wheel-stack-context-menu',
    WHEEL_STACK_CONTEXT_MENU_HIDDEN: 'wheel-stack-context-menu-hidden',
    WHEEL_STACK_BASE_PLATFORM: 'wheel-stack-base-platform',
    WHEEL_STACK_ORDER_BLOCK: 'wheel-stack-order-block',
    WHEEL_STACK_CELL_ORDER_BLOCK: 'wheel-stack-cell-order-block',

    WHEEL_STACK_ROW: 'wheel-stack-row',
  },
  BASE_PLATFORM: 'base-platform',
  GRID: 'grid',
  TOOLTIP: 'tooltip',
}

export const BACK_URLS = {
  GET_BASE_PLATFORM_URL: 'http://127.0.0.1:8000/platform/',
  GET_WHEELSTACK_DATA_URl: 'http://127.0.0.1:8000/wheelstacks/',
  GET_GRID_URL: 'http://127.0.0.1:8000/grid/',
  GET_WHEEL_DATA_URL: 'http://127.0.0.1:8000/wheels/',
  POST_ORDER_WHOLE_STACK_URL: 'http://127.0.0.1:8000/orders/move',
}


export const SETTINGS = {
  BASE_PLATFORM_UPDATE_TIME: 500,  // ms
  GRID_UPDATE_TIME: 500,  // ms
}

export const BACK_GRID_NAMES = {
  BASE_PLATFORM: 'basePlacement',
  GRID: 'grid',
}

export const ORDER_MOVE_TYPES = {
  WHOLE_STACK: 'moveWholeStack',
  TOP_WHEEL: 'moveTopWheel',
  TO_LABORATORY: 'moveToLaboratory',
  MERGE_STACKS: 'mergeWheelStacks',
}

export const ORDER_BUTTONS_TEXT = {
  WHOLE_STACK_INACTIVE: 'Переместить',
  WHOLE_STACK_ACTIVE: 'Подтвердить',
  WHEEL_STACK_BLOCKED: 'Ожидает заказ',
}


export const TEMPO_CONSTS = {
  CONTEXT_MENU_CLASS: 'context-menu',
  CONTEXT_MENU_OPTION: 'context-menu-option',
  WHEEL_CONTEXT_MENU_CLASS: 'wheel-details-menu',
  WHEEL_CONTEXT_MENU_MOVE_WHEELSTACK_BUTTON: 'context-menu-move-wheelstack-button',
  CONTEXT_MENU_ALLOWED_STYLES: {
    'context-menu': true,
    // 'wheel-stack': true,
    'context-menu-option': true,
    'wheel-details-menu': true,
    'wheel-details-row': true,
    'wheel-details-row-name': true,
    'wheel-details-row-header': true,
    'wheel-details-row-data': true,
    'context-menu-move-wheelstack-button': true,
    'context-menu-cancel-move-wheelstack-button': true,
  },
  WHEEL_CONTEXT_MENU_ALLOWED_STYLES: {
    'wheel-details-menu': true,
    'wheel-details-row': true,
  }
}