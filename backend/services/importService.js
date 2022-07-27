
const MainFile = require('../database/models/mainFileModel');
const UserMaster = require('../database/models/userMasterModel');
const Product = require('../database/models/productModel');
const ZsdCustomer = require('../database/models/zsdCustomerDetailsModel');
const ZmlDesignation = require('../database/models/zmlDesignationModel');
const { formatMongoData, checkObjectId } = require('../helpers/dbHelper');




module.exports.insertMainFile = async (serviceData) => {
    try {
        let data = new MainFile({ ...serviceData });
        await data.save();
        return true;
    } catch (error) {
        console.log('Something went wrong: Service: insertMainFile', error);
        throw new Error(error);
    }
}
module.exports.insertUserMasterFile = async (serviceData) => {
    try {
        let data = new UserMaster({ ...serviceData });
        let user = await data.save();
        return formatMongoData(user);
    } catch (error) {
        console.log('Something went wrong: Service: insertUserMasterFile', error);
        throw new Error(error);
    }
}

module.exports.findUserMaster = async ({ email = '', count = false }) => {
    try {
      let find = { is_active: "1" };
      if (email) {
        find["email"] = email
      }
      if(count){
          return await UserMaster.countDocuments(find);
      }
      let users = await UserMaster.find(find).sort({ _id : -1 });

      if (users.length) return formatMongoData(users);
      else return [];
      
    } catch (error) {
      console.log('Something went wrong: Service: findUserMaster', error);
      throw new Error(error);
    }
  };


  module.exports.updateUserMaster = async ({ id, updateInfo }) => {
    try {
      checkObjectId(id);
      let store = await UserMaster.findOneAndUpdate(
        { store_id: id },
        updateInfo,
        { new: true, useFindAndModify: false }
      )

      if (!store) return false;
      else return formatMongoData(store);
    } catch (error) {
      console.log('Something went wrong: Service: updateUserMaster', error);
      throw new Error(error);
    }
  };




module.exports.updateUserMaster = async ({ id, updateInfo }) => {
    try {
      checkObjectId(id);
      let user = await UserMaster.findOneAndUpdate(
        { _id: id },
        updateInfo,
        { new: true, useFindAndModify: false }
      )
      
      if (!user) return false;
      else return formatMongoData(user);
    } catch (error) {
      console.log('Something went wrong: Service: updateUserMaster', error);
      throw new Error(error);
    }
  }

  module.exports.insertProductFile = async (serviceData) => {
    try {
        let data = new Product({ ...serviceData });
        await data.save();
        return true;
    } catch (error) {
        console.log('Something went wrong: Service: insertProductFile', error);
        throw new Error(error);
    }
};

module.exports.insertZsdCustomer = async (serviceData) => {
  try {
    let data = new ZsdCustomer({ ...serviceData });
    await data.save();
    return true;
  } catch (error) {
    console.log('Something went wrong: Service: insertZsdCustomer', error);
    throw new Error(error);
  }
};

module.exports.insertZmlDesignation = async (serviceData) => {
  try {
    let data = new ZmlDesignation({ ...serviceData });
    await data.save();
    return true;
  } catch (error) {
    console.log('Something went wrong: Service: insertZmlDesignation', error);
    throw new Error(error);
  }
};

module.exports.data_correction_api = async () => {
  try {
    let num = 0;
    let cursor = await UserMaster.find({ user_type: 'buyer' }).cursor();
    cursor.next(function fn(err, item) {
      if (err || !item) return;

      setImmediate(fnAction, item, function () {
        cursor.next(fn);
      });
    });
    async function fnAction(item, callback) {
      item = formatMongoData(item);
      num++;
      let ZSD = await ZsdCustomer.findOne({ customer_no: item.customer_id }).sort({ _id: -1 });
      if (ZSD) {
        await UserMaster.findOneAndUpdate({ _id: item.id }, {
          area_code: ZSD.sales_group,
          city: ZSD.city,
        }, { new: true, useFindAndModify: false });
        console.log(`${num} data processed successfully.`);
      }
      return callback();
    }
  } catch (error) {
    console.log('Something went wrong: Service: data_correction_api', error);
    throw new Error(error);
  }
};