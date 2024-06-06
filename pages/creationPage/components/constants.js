export const CLASS_NAMES = {
  WHEEL_STACK_ELEMENT: {
    WHEEL_STACK: 'wheel-stack',
    WHEEL_STACK_IDENTIFIER: 'wheel-stack-identifier', 
    WHEEL_STACK_WHITESPACE: 'wheel-stack-whitespace',
    WHEEL_STACK_CONTEXT_MENU: 'wheel-stack-context-menu',
    WHEEL_STACK_CONTEXT_MENU_HIDDEN: 'wheel-stack-context-menu-hidden',
    
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
}


export const SETTINGS = {
  BASE_PLATFORM_UPDATE_TIME: 500,  // ms
  GRID_UPDATE_TIME: 500,  // ms
}


export const TEMPO_CONSTS = {
  CONTEXT_MENU_CLASS: 'context-menu',
  CONTEXT_MENU_OPTION: 'context-menu-option',
  WHEEL_CONTEXT_MENU_CLASS: 'wheel-details-menu',
  CONTEXT_MENU_ALLOWED_STYLES: {
    'context-menu': true,
    'wheel-stack': true,
    'context-menu-option': true,
    'wheel-details-menu': true,
    'wheel-details-row': true,
  },
  WHEEL_CONTEXT_MENU_ALLOWED_STYLES: {
    'wheel-details-menu': true,
    'wheel-details-row': true,
  }
}