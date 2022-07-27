const mongoose = require('mongoose');
const constants = require('../constants');
module.exports.formatMongoData = (data) => {
  if (Array.isArray(data)) {
    let newDataList = [];
    for (value of data) {
      newDataList.push(value.toObject());
    }
    return newDataList;
  }
  return data.toObject();
}

module.exports.checkObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(constants.databaseMessage.INVALID_ID);
  }
}
module.exports.checkValidId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }else{
    return true;
  }
}
module.exports.uniqueId = () => {
  return  Math.floor(100000 + Math.random() * 900000);
}

module.exports.hasDuplicates = (arr)=> {
  return new Set(arr).size !== arr.length; 
}