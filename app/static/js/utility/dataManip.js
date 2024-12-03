

export const combineObjectsData = (combined, toGather = [], toIgnore = [], overRide = false) => {
  toGather.forEach( objectToCombine => {
    Object.keys(objectToCombine).forEach( record => {
      if (record in combined && !overRide) {
        return;
      }
      combined[record] = objectToCombine[record];
    })
  })
  Object.keys(combined).forEach( record => {
    let notPresent = true;
    let ignore = false;
    for (let bank of toGather) {
      // TODO: think about rebuilding banks.
      for (let ignore of toIgnore) {
        const ignoreStorage = toIgnore[0];
        const ignoreKey = toIgnore[1];
        if (record in ignoreStorage[ignoreKey]) {
          ignore = true;
          notPresent = false;
          break;
        }
      };
      if (ignore) {
        break;
      };
      // ---
      if (record in bank) {
        notPresent = false;
        break;
      }
    }
    if (notPresent) {
      delete combined[record];
    }
  })
  
}


export const combineSetsData = (combined, toGather = []) => {
  toGather.forEach(setToCombine => {
    setToCombine.forEach( element => {
      if (combined.has(element)) {
        return;
      }
      combined.add(element);
    })
  })
  combined.forEach( record => {
    let notPresent = true;
    for (let bank of toGather) {
      if (bank.has(record)) {
        notPresent = false;
        break;
      }
    }
    if (notPresent) {
      combined.delete(record);
    }
  })
}


export const updateSetBank = (dataBank, newData) => {
  newData.forEach( element => {
    if (!(dataBank.has(element))) {
      dataBank.add(element);
    }
  })
  dataBank.forEach( element => {
    if (!(newData.has(element))) {
      dataBank.delete(element);
    }
  })
}


export const updateObjBank = (dataBank, newData) => {
  Object.keys(newData).forEach( element => {
    if (!(element in dataBank)) {
      dataBank[element] = newData[element];
    }
  })
  Object.keys(dataBank).forEach( element => {
    if (!(element in newData)) {
      delete dataBank[element];
    }
  })
}
