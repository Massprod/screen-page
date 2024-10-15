

export const combineObjectsData = (combined, toGather = []) => {
  toGather.forEach( objectToCombine => {
    Object.keys(objectToCombine).forEach( record => {
      if (record in combined) {
        return;
      }
      combined[record] = objectToCombine[record];
    })
  })
  Object.keys(combined).forEach( record => {
    let notPresent = true;
    for (let bank of toGather) {
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
