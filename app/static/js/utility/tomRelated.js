

export const updateOptions = (tomSelector, options, disableEmpty = false) => {
  if (0 === options.length && disableEmpty) {
    tomSelector.disable();
  } else {
    tomSelector.enable();
  }
  tomSelector.addOptions(options);
};


export const clearSelectorOptions = (tomSelector, options) => {
  options.forEach(option => {
    tomSelector.removeOption(option);
  });
};
