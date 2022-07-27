const MainFile = require("../database/models/mainFileModel");
const UserMaster = require("../database/models/userMasterModel");
const UserMapping = require("../database/models/userMappingModel");
const ZsdCustomer = require("../database/models/zsdCustomerDetailsModel");
const ZmlDesignation = require("../database/models/zmlDesignationModel");
const { formatMongoData, checkObjectId } = require("../helpers/dbHelper");
const constants = require("../constants/index");
const bcrypt = require("bcrypt");
const REQUEST = require("../database/models/profileUpdateRequestModel");

let uniqueCodeGenerator = async () => {
  try {
    function randomString(length, chars) {
      let result = "";
      for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
    }
    let existCheck = async ({ code }) => {
      let exist = await UserMaster.findOne({ customer_id: code });
      if (exist) {
        let code = randomString(8, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        return await existCheck({ code });
      } else {
        return code;
      }
    };
    return (code = await existCheck({ code: randomString(8, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ") }));
  } catch (error) {
    console.log("Something went wrong: Service: uniqueCodeGenerator", error);
    throw new Error(error);
  }
};

module.exports.uniqueCodeGeneratorForCustomerId = async () => {
  try {
    function randomString(length, chars) {
      let result = "";
      for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
    }
    let existCheck = async ({ code }) => {
      let exist = await UserMaster.findOne({ customer_id: code });
      if (exist) {
        let code = randomString(8, "0123456789");
        return await existCheck({ code });
      } else {
        return code;
      }
    };
    return (code = await existCheck({ code: randomString(8, "0123456789") }));
  } catch (error) {
    console.log("Something went wrong: Service: uniqueCodeGeneratorForCustomerId", error);
    throw new Error(error);
  }
};

module.exports.uniqueCodeGeneratorForRequest = async () => {
  try {
    function randomString(length, chars) {
      let result = "";
      for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
    }
    let existCheck = async ({ code }) => {
      let exist = await REQUEST.findOne({ request_no: code });
      if (exist) {
        let code = randomString(12, "0123456789");
        return await existCheck({ code: "REQ" + code });
      } else {
        return code;
      }
    };
    return (code = await existCheck({ code: "REQ" + randomString(12, "0123456789") }));
  } catch (error) {
    console.log("Something went wrong: Service: uniqueCodeGeneratorForRequest", error);
    throw new Error(error);
  }
};

module.exports.user_login_service = async ({ email, password, temp_user_id }) => {
  try {
    let info = { email: email.toLowerCase(), status: "Active", is_deleted: "n" };
    // let info = { email: eval('{ $regex: /' + email + '/i }'), status: "Active", is_deleted: "n" };
    let user = await UserMaster.findOne(info);
    if (!user) {
      return { status: false, message: constants.userMessage.USER_NOT_FOUND };
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { status: false, message: constants.userMessage.INVALID_PASSWORD };
    }
    let userDetail = await UserMaster.findOneAndUpdate(
      {
        _id: user.id,
      },
      { last_login: new Date() },
      {
        new: true,
        useFindAndModify: false,
      }
    );

    return { status: true, message: "success", data: formatMongoData(userDetail) };
  } catch (error) {
    console.log("Something went wrong: Service: user_login_service", error);
    return { status: false, message: error };
  }
};

module.exports.searchLoginUser = async ({ id = "" }) => {
  try {
    checkObjectId(id);
    const user = await UserMaster.findById({ _id: id }).sort({ _id: -1 });

    if (user) {
      if (user.status === "Active" && user.is_deleted === "n") return formatMongoData(user);
      else return false;
    } else return false;
  } catch (error) {
    console.log("Something went wrong: Service: searchLoginUser", error);
    return { status: false, message: error };
  }
};

module.exports.searchUsersWithOutRegex = async ({
  id = "",
  rsm_id = "",
  national_id = "",
  zonal_id = "",
  asm_id = "",
  agent_id = "",
  user_type = "",
  name = "",
  customer_no = "",
  email = "",
  all_users = false,
  count = false,
  status = "",
  skip = 0,
  limit = 0,
}) => {
  try {
    let match = { is_deleted: "n" };

    if (id) match["_id"] = id;
    if (rsm_id) match["rsm_id"] = rsm_id;
    if (national_id) match["national_id"] = national_id;
    if (zonal_id) match["zonal_id"] = zonal_id;
    if (asm_id) match["asm_id"] = asm_id;
    if (agent_id) match["agent_id"] = agent_id;
    if (user_type) match["user_type"] = user_type;
    if (name) match["name"] = name;
    if (all_users) match["user_type"] = { $in: ["zonal_manager", "rsm", "asm", "agent", "buyer", "national_head", "special_login"] };
    if (customer_no) match["customer_id"] = customer_no;
    if (email) match["email"] = email;
    if (status) match["status"] = status;

    if (count) return await UserMaster.countDocuments(match);

    let user = await UserMaster.find(match, { password: 0 }).sort({ _id: -1 }).skip(parseInt(skip)).limit(parseInt(limit));

    if (user.length) return formatMongoData(user);
    else return [];
  } catch (error) {
    console.log("Something went wrong: Service: searchUsersWithOutRegex", error);
    return {
      status: false,
      message: error,
    };
  }
};

module.exports.searchUsers = async ({
  id = "",
  rsm_id = "",
  national_id = "",
  zonal_id = "",
  asm_id = "",
  agent_id = "",
  user_type = "",
  name = "",
  customer_no = "",
  email = "",
  all_users = false,
  count = false,
  status = "",
  skip = 0,
  limit = 0,
}) => {
  try {
    let match = { is_deleted: "n" };

    if (id) match["_id"] = id;
    if (rsm_id) match["rsm_id"] = rsm_id;
    if (national_id) match["national_id"] = national_id;
    if (zonal_id) match["zonal_id"] = zonal_id;
    if (asm_id) match["asm_id"] = asm_id;
    if (agent_id) match["agent_id"] = agent_id;
    if (user_type) match["user_type"] = user_type;
    if (name) match["name"] = eval("{ $regex: /" + name + "/gi }");
    if (all_users) match["user_type"] = { $in: ["zonal_manager", "rsm", "asm", "agent", "buyer", "national_head", "special_login"] };
    if (customer_no) match["customer_id"] = eval("{ $regex: /" + customer_no + "/gi }");
    if (email) match["email"] = eval("{ $regex: /" + email + "/gi }");
    if (status) match["status"] = eval("{ $regex: /" + status + "/gi }");

    if (count) return await UserMaster.countDocuments(match);

    let user = await UserMaster.find(match, { password: 0 }).sort({ _id: -1 }).skip(parseInt(skip)).limit(parseInt(limit));

    if (user.length) return formatMongoData(user);
    else return [];
  } catch (error) {
    console.log("Something went wrong: Service: searchUsers", error);
    return {
      status: false,
      message: error,
    };
  }
};

module.exports.searchUsersFromUserMapping = async ({
  id = "",
  customer_no = "",
  agent_email = "",
  asm_email = "",
  rsm_email = "",
  zsm_email = "",
  nh_email = "",
  sales_org_type = "",
  sales_org_no = "",
  county_code = "",
  buyer_id = "",
  count = false,
  unique_agent = false,
  unique_asm = false,
  unique_rsm = false,
  unique_zsm = false,
  unique_nh = false,
  unique_buyer = false,
  buyer_data = false,
  skip = 0,
  limit = 0,
}) => {
  try {
    let match = {};
    let field = "";
    let filter_pipe = {};
    if (id) match["_id"] = id;
    if (customer_no) match["customer_no"] = customer_no;
    if (agent_email) match["agent_email"] = agent_email;
    if (asm_email) match["asm_email"] = asm_email;
    if (rsm_email) match["rsm_email"] = rsm_email;
    if (zsm_email) match["zsm_email"] = zsm_email;
    if (nh_email) match["nh_email"] = nh_email;
    if (sales_org_type) match["sales_org_type"] = sales_org_type;
    if (sales_org_no) match["sales_org_no"] = sales_org_no;
    if (county_code) match["county_code"] = county_code;
    if (buyer_id) match["buyer_id"] = buyer_id;
    if (buyer_data) match["customer_no"] = { $exists: true };

    if (unique_nh) {
      filter_pipe = {
        $group: {
          _id: "",
          uniqueCount: { $addToSet: "$nh_email" },
        },
      };
    }
    if (unique_asm) {
      filter_pipe = {
        $group: {
          _id: "",
          uniqueCount: { $addToSet: "$asm_email" },
        },
      };
    }
    if (unique_rsm) {
      filter_pipe = {
        $group: {
          _id: "",
          uniqueCount: { $addToSet: "$rsm_email" },
        },
      };
    }
    if (unique_zsm) {
      filter_pipe = {
        $group: {
          _id: "",
          uniqueCount: { $addToSet: "$zsm_email" },
        },
      };
    }
    if (unique_agent) {
      filter_pipe = {
        $group: {
          _id: "",
          uniqueCount: { $addToSet: "$agent_email" },
        },
      };
    }
    if (unique_buyer) {
      filter_pipe = {
        $group: {
          _id: "",
          uniqueCount: { $addToSet: "$customer_no" },
        },
      };
    }

    if (count) return await UserMapping.countDocuments(match);

    console.log(match, "--search key to search users from UserMapping");

    if (filter_pipe && Object.keys(filter_pipe).length !== 0) {
      let user = await UserMapping.aggregate([{ $match: match }, { $sort: { _id: -1 } }, filter_pipe]);
      if (user.length) return user;
      else return [];
    } else if (buyer_data) {
      let user = await UserMapping.find(match)
        .populate({ path: "buyer_id", select: ['customer_id', 'city', 'name', 'mobile', 'email'] })
        .sort({ _id: -1 })
        .lean()
        .skip(parseInt(skip))
        .limit(parseInt(limit));
      if (user.length) return user;
      else return [];
    } else {
      let user = await UserMapping.find(match).sort({ _id: -1 }).lean().skip(parseInt(skip)).limit(parseInt(limit));
      if (user.length) return user;
      else return [];
    }
  } catch (error) {
    console.log("Something went wrong: Service: searchUsersFromUserMapping", error);
    return {
      status: false,
      message: error,
    };
  }
};

module.exports.updateUser = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);

    let userDetail = await UserMaster.findOneAndUpdate(
      {
        _id: id,
      },
      updateInfo,
      {
        new: true,
        useFindAndModify: false,
      }
    );

    return formatMongoData(userDetail);
  } catch (error) {
    console.log("Something went wrong: Service: updateUser", error);
    return { status: false, message: error };
  }
};

module.exports.userMapping = async () => {
  try {
    let num = 0;
    // let cursor = await ZsdCustomer.find({ customer_no: '10606', data_processed: { $ne: true } }).limit(1).cursor();
    let cursor = await ZsdCustomer.find({ data_processed: { $ne: false } }).cursor();
    cursor.next(function fn(err, item) {
      if (err || !item) return;

      setImmediate(fnAction, item, function () {
        cursor.next(fn);
      });
    });
    async function fnAction(item, callback) {
      item = formatMongoData(item);
      num++;
      if (item.customer_key) {
        let zml_data = await ZmlDesignation.findOne({ customer_key: item.customer_key }).sort({ _id: -1 });
        if (zml_data) {
          let info = {
            customer_no: item.customer_no,
            customer_name: item.customer_name,
          };
          if (zml_data.agent_name) info["agent_name"] = zml_data.agent_name;
          if (zml_data.agent_email) info["agent_email"] = zml_data.agent_email;
          if (zml_data.agent_agency) info["agent_agency"] = zml_data.agent_agency;
          if (zml_data.area_manager) info["asm_name"] = zml_data.area_manager;
          if (zml_data.asm_email) info["asm_email"] = zml_data.asm_email;
          if (zml_data.regional_manager) info["rsm_name"] = zml_data.regional_manager;
          if (zml_data.rsm_email) info["rsm_email"] = zml_data.rsm_email;
          if (zml_data.zonal_manager) info["zsm_name"] = zml_data.zonal_manager;
          if (zml_data.zonal_email) info["zsm_email"] = zml_data.zonal_email;
          if (zml_data.national_head) info["nh_name"] = zml_data.national_head;
          if (zml_data.national_head_email) info["nh_email"] = zml_data.national_head_email;

          if (item.sales_office && item.sales_org) {
            let sales_type;
            let CUSTOMER_NO = item.customer_no.toString();
            let arr = CUSTOMER_NO.split("");
            if (item.sales_org == "1000" && (arr[0] === "1" || arr[0] === "2")) {
              sales_type = "suiting";
            }
            if (item.sales_org == "1900" && arr[0] === "8") {
              sales_type = "shirting";
            }
            if (sales_type) info["sales_org_type"] = sales_type;
            if (sales_type) info["sales_org_no"] = item.sales_org;
          }
          if (zml_data.county_code) info["county_code"] = zml_data.county_code;
          let map_data = await UserMapping.findOne({ customer_no: item.customer_no }).sort({ _id: -1 });
          if (!map_data) {
            let mapping = new UserMapping(info);
            await mapping.save();
          } else {
            await UserMapping.findOneAndUpdate({ _id: map_data.id }, info, { new: true, useFindAndModify: false });
          }
          // end mapping
          //insert in user master start
          if (zml_data.national_head_email) {
            let user_data4 = {
              is_deleted: "n",
              status: "Active",
              password: "$2b$12$t1ERHiS05YmXWWs/LFr3HuswPSCLU3iIGKhtsvft7imp6lBpd4t6y",
            };
            user_data4["format_type"] = "6073fccb1996fceb11d1a960"; // default value of WHS
            user_data4["multiple_user_login"] = false;
            user_data4["name"] = zml_data.national_head;
            user_data4["user_type"] = "national_head";
            if (zml_data.national_head_number) user_data4["mobile"] = zml_data.national_head_number;
            user_data4["email"] = zml_data.national_head_email;
            let USER = await UserMaster.findOne({ email: zml_data.national_head_email });
            user_data4["customer_id"] = await uniqueCodeGenerator();
            if (USER) {
              await UserMaster.findOneAndUpdate({ _id: USER.id }, { multiple_user_login: true }, { new: true, useFindAndModify: false });
            } else {
              let user = new UserMaster(user_data4);
              await user.save();
            }
          }
          if (zml_data.zonal_email) {
            let user_data3 = {
              is_deleted: "n",
              status: "Active",
              password: "$2b$12$t1ERHiS05YmXWWs/LFr3HuswPSCLU3iIGKhtsvft7imp6lBpd4t6y",
            };
            user_data3["format_type"] = "6073fccb1996fceb11d1a960"; // default value of WHS
            user_data3["multiple_user_login"] = false;
            user_data3["name"] = zml_data.zonal_manager;
            user_data3["user_type"] = "zonal_manager";
            if (zml_data.zonal_manger_number) user_data3["mobile"] = zml_data.zonal_manger_number;
            user_data3["email"] = zml_data.zonal_email;
            let USER = await UserMaster.findOne({ email: zml_data.zonal_email });
            user_data3["customer_id"] = await uniqueCodeGenerator();
            if (USER) {
              // let arr = [];
              // arr.push(USER.user_type);
              // arr.push(USER.user_type);
              await UserMaster.findOneAndUpdate({ _id: USER.id }, { multiple_user_login: true }, { new: true, useFindAndModify: false });
            } else {
              let user = new UserMaster(user_data3);
              await user.save();
            }
          }
          if (zml_data.rsm_email) {
            let user_data2 = {
              is_deleted: "n",
              status: "Active",
              password: "$2b$12$t1ERHiS05YmXWWs/LFr3HuswPSCLU3iIGKhtsvft7imp6lBpd4t6y",
            };
            user_data2["format_type"] = "6073fccb1996fceb11d1a960"; // default value of WHS
            user_data2["multiple_user_login"] = false;
            user_data2["name"] = zml_data.regional_manager;
            user_data2["user_type"] = "rsm";
            if (zml_data.rsm_number) user_data2["mobile"] = zml_data.rsm_number;
            user_data2["email"] = zml_data.rsm_email;
            let USER = await UserMaster.findOne({ email: zml_data.rsm_email });
            user_data2["customer_id"] = await uniqueCodeGenerator();
            if (USER) {
              await UserMaster.findOneAndUpdate({ _id: USER.id }, { multiple_user_login: true }, { new: true, useFindAndModify: false });
            } else {
              let user = new UserMaster(user_data2);
              await user.save();
            }
          }
          if (zml_data.asm_email) {
            let user_data1 = {
              is_deleted: "n",
              status: "Active",
              password: "$2b$12$t1ERHiS05YmXWWs/LFr3HuswPSCLU3iIGKhtsvft7imp6lBpd4t6y",
            };
            user_data1["format_type"] = "6073fccb1996fceb11d1a960"; // default value of WHS
            user_data1["multiple_user_login"] = false;
            user_data1["name"] = zml_data.area_manager;
            user_data1["user_type"] = "asm";
            if (zml_data.asm_number) user_data1["mobile"] = zml_data.asm_number;
            user_data1["email"] = zml_data.asm_email;
            let USER = await UserMaster.findOne({ email: zml_data.asm_email });
            user_data1["customer_id"] = await uniqueCodeGenerator();
            if (USER) {
              await UserMaster.findOneAndUpdate({ _id: USER.id }, { multiple_user_login: true }, { new: true, useFindAndModify: false });
            } else {
              let user = new UserMaster(user_data1);
              await user.save();
            }
          }
          if (zml_data.agent_email) {
            let user_data = { is_deleted: "n", status: "Active", password: "$2b$12$t1ERHiS05YmXWWs/LFr3HuswPSCLU3iIGKhtsvft7imp6lBpd4t6y" };
            user_data["format_type"] = "6073fccb1996fceb11d1a960"; // default value of WHS
            user_data["multiple_user_login"] = false;
            user_data["name"] = zml_data.agent_name;
            user_data["email"] = zml_data.agent_email;
            user_data["agent_agency"] = zml_data.agent_agency;
            if (zml_data.county_code) user_data["agent_county_code"] = zml_data.county_code;
            user_data["user_type"] = "agent";
            if (zml_data.agent_number) user_data["mobile"] = zml_data.agent_number;
            let USER = await UserMaster.findOne({ email: zml_data.agent_email });
            user_data["customer_id"] = await uniqueCodeGenerator();
            if (USER) {
              await UserMaster.findOneAndUpdate({ _id: USER.id }, { multiple_user_login: true }, { new: true, useFindAndModify: false });
            } else {
              let user = new UserMaster(user_data);
              await user.save();
            }
          }
          console.log(`${num} data processed successfully.`);
        }
      }
      await ZsdCustomer.findOneAndUpdate({ _id: item.id }, { data_processed: true }, { new: true, useFindAndModify: false });
      return callback();
    }
  } catch (error) {
    console.log("Something went wrong: Service: userMapping", error);
    throw new Error(error);
  }
};

module.exports.userMasterDataSync = async () => {
  try {
    let num = 0;
    let cursor = await UserMaster.find().cursor();
    // let cursor = await UserMaster.find({ user_type: "agent" }).cursor();
    cursor.next(function fn(err, item) {
      if (err || !item) return;

      setImmediate(fnAction, item, function () {
        cursor.next(fn);
      });
    });
    async function fnAction(item, callback) {
      item = formatMongoData(item);
      num++;
      if (item.user_type.toLowerCase() === "zonal_manager") {
        let MASTER = await UserMapping.find({ zsm_email: item.email }).sort({ _id: -1 });
        if (MASTER.length) {
          let distinct_array_nh = await [...new Set(MASTER.map((x) => x.nh_email))];
          let distinct_array_nh1 = [];
          distinct_array_nh.filter((item) => {
            if (item != undefined && item != null) distinct_array_nh1.push(item);
          });
          if (distinct_array_nh1.length) {
            for (let data of distinct_array_nh1) {
              let NH = await UserMaster.findOne({ email: data, user_type: "national_head" });
              if (NH) await UserMaster.findOneAndUpdate({ _id: item.id }, { national_id: NH.id }, { new: true, useFindAndModify: false });
            }
          }
        }
      }
      if (item.user_type.toLowerCase() === "rsm") {
        let MASTER = await UserMapping.find({ rsm_email: item.email }).sort({ _id: -1 });
        if (MASTER.length) {
          let distinct_array_nh = await [...new Set(MASTER.map((x) => x.nh_email))];
          let distinct_array_zonal = await [...new Set(MASTER.map((x) => x.zsm_email))];
          let distinct_array_zonal1 = [];
          let distinct_array_nh1 = [];
          distinct_array_zonal.filter((item) => {
            if (item != undefined && item != null) distinct_array_zonal1.push(item);
          });
          distinct_array_nh.filter((item) => {
            if (item != undefined && item != null) distinct_array_nh1.push(item);
          });
          if (distinct_array_nh1.length) {
            for (let data of distinct_array_nh1) {
              let NH = await UserMaster.findOne({ email: data, user_type: "national_head" });
              if (NH) await UserMaster.findOneAndUpdate({ _id: item.id }, { national_id: NH.id }, { new: true, useFindAndModify: false });
            }
          }
          if (distinct_array_zonal1.length) {
            for (let data of distinct_array_zonal1) {
              let ZONAL = await UserMaster.findOne({ email: data, user_type: "zonal_manager" });
              if (ZONAL)
                await UserMaster.findOneAndUpdate({ _id: item.id }, { zonal_id: ZONAL.id }, { new: true, useFindAndModify: false });
            }
          }
        }
      }
      if (item.user_type.toLowerCase() === "asm") {
        let MASTER = await UserMapping.find({ asm_email: item.email }).sort({ _id: -1 });
        if (MASTER.length) {
          let distinct_array_rsm = await [...new Set(MASTER.map((x) => x.rsm_email))];
          let distinct_array_nh = await [...new Set(MASTER.map((x) => x.nh_email))];
          let distinct_array_zonal = await [...new Set(MASTER.map((x) => x.zsm_email))];

          let distinct_array_zonal1 = [];
          let distinct_array_rsm1 = [];
          let distinct_array_nh1 = [];
          distinct_array_zonal.filter((item) => {
            if (item != undefined && item != null) distinct_array_zonal1.push(item);
          });
          distinct_array_rsm.filter((item) => {
            if (item != undefined && item != null) distinct_array_rsm1.push(item);
          });
          distinct_array_nh.filter((item) => {
            if (item != undefined && item != null) distinct_array_nh1.push(item);
          });

          if (distinct_array_nh1.length) {
            for (let data of distinct_array_nh1) {
              let NH = await UserMaster.findOne({ email: data, user_type: "national_head" });
              if (NH) await UserMaster.findOneAndUpdate({ _id: item.id }, { national_id: NH.id }, { new: true, useFindAndModify: false });
            }
          }
          if (distinct_array_rsm1.length) {
            for (let data of distinct_array_rsm1) {
              let RSM = await UserMaster.findOne({ email: data, user_type: "rsm" });
              if (RSM) await UserMaster.findOneAndUpdate({ _id: item.id }, { rsm_id: RSM.id }, { new: true, useFindAndModify: false });
            }
          }
          if (distinct_array_zonal1.length) {
            for (let data of distinct_array_zonal1) {
              let ZONAL = await UserMaster.findOne({ email: data, user_type: "zonal_manager" });
              if (ZONAL)
                await UserMaster.findOneAndUpdate({ _id: item.id }, { zonal_id: ZONAL.id }, { new: true, useFindAndModify: false });
            }
          }
        }
      }
      if (item.user_type.toLowerCase() === "agent") {
        let MASTER = await UserMapping.find({ agent_email: item.email }).sort({ _id: -1 });
        if (MASTER.length) {
          let distinct_array_rsm = await [...new Set(MASTER.map((x) => x.rsm_email))];
          let distinct_array_nh = await [...new Set(MASTER.map((x) => x.nh_email))];
          let distinct_array_zonal = await [...new Set(MASTER.map((x) => x.zsm_email))];
          let distinct_array_asm = await [...new Set(MASTER.map((x) => x.asm_email))];

          let distinct_array_zonal1 = [];
          let distinct_array_rsm1 = [];
          let distinct_array_nh1 = [];
          let distinct_array_asm1 = [];
          distinct_array_zonal.filter((item) => {
            if (item != undefined && item != null) distinct_array_zonal1.push(item);
          });
          distinct_array_rsm.filter((item) => {
            if (item != undefined && item != null) distinct_array_rsm1.push(item);
          });
          distinct_array_nh.filter((item) => {
            if (item != undefined && item != null) distinct_array_nh1.push(item);
          });
          distinct_array_asm.filter((item) => {
            if (item != undefined && item != null) distinct_array_asm1.push(item);
          });
          console.log(distinct_array_zonal1, "distinct_array_zonal1", item.email);
          if (distinct_array_nh1.length) {
            for (let data of distinct_array_nh1) {
              let NH = await UserMaster.findOne({ email: data, user_type: "national_head" });
              if (NH) await UserMaster.findOneAndUpdate({ _id: item.id }, { national_id: NH.id }, { new: true, useFindAndModify: false });
            }
          }
          if (distinct_array_rsm1.length) {
            for (let data of distinct_array_rsm1) {
              let RSM = await UserMaster.findOne({ email: data, user_type: "rsm" });
              if (RSM) await UserMaster.findOneAndUpdate({ _id: item.id }, { rsm_id: RSM.id }, { new: true, useFindAndModify: false });
            }
          }
          if (distinct_array_zonal1.length) {
            for (let data of distinct_array_zonal1) {
              let ZONAL = await UserMaster.findOne({ email: data, user_type: "zonal_manager" });
              if (ZONAL)
                await UserMaster.findOneAndUpdate({ _id: item.id }, { zonal_id: ZONAL.id }, { new: true, useFindAndModify: false });
            }
          }
          if (distinct_array_asm1.length) {
            for (let data of distinct_array_asm1) {
              let ASM = await UserMaster.findOne({ email: data, user_type: "asm" });
              if (ASM) await UserMaster.findOneAndUpdate({ _id: item.id }, { asm_id: ASM.id }, { new: true, useFindAndModify: false });
            }
          }
        }
      }
      if (item.user_type.toLowerCase() === "buyer") {
        let MASTER = await UserMapping.find({ customer_no: item.email }).sort({ _id: -1 });
        if (MASTER.length) {
          let distinct_array_rsm = await [...new Set(MASTER.map((x) => x.rsm_email))];
          let distinct_array_nh = await [...new Set(MASTER.map((x) => x.nh_email))];
          let distinct_array_zonal = await [...new Set(MASTER.map((x) => x.zsm_email))];
          let distinct_array_asm = await [...new Set(MASTER.map((x) => x.asm_email))];
          let distinct_array_agent = await [...new Set(MASTER.map((x) => x.agent_email))];

          let distinct_array_zonal1 = [];
          let distinct_array_rsm1 = [];
          let distinct_array_nh1 = [];
          let distinct_array_asm1 = [];
          let distinct_array_agent1 = [];
          distinct_array_zonal.filter((item) => {
            if (item != undefined && item != null) distinct_array_zonal1.push(item);
          });
          distinct_array_rsm.filter((item) => {
            if (item != undefined && item != null) distinct_array_rsm1.push(item);
          });
          distinct_array_nh.filter((item) => {
            if (item != undefined && item != null) distinct_array_nh1.push(item);
          });
          distinct_array_asm.filter((item) => {
            if (item != undefined && item != null) distinct_array_asm1.push(item);
          });
          distinct_array_agent.filter((item) => {
            if (item != undefined && item != null) distinct_array_agent1.push(item);
          });
          if (distinct_array_nh1.length) {
          }
          for (let data of distinct_array_nh1) {
            let NH = await UserMaster.findOne({ email: data, user_type: "national_head" });
            if (NH) await UserMaster.findOneAndUpdate({ _id: item.id }, { national_id: NH.id }, { new: true, useFindAndModify: false });
          }
          if (distinct_array_rsm1.length) {
            for (let data of distinct_array_rsm1) {
              let RSM = await UserMaster.findOne({ email: data, user_type: "rsm" });
              if (RSM) await UserMaster.findOneAndUpdate({ _id: item.id }, { rsm_id: RSM.id }, { new: true, useFindAndModify: false });
            }
          }
          if (distinct_array_zonal1.length) {
            for (let data of distinct_array_zonal1) {
              let ZONAL = await UserMaster.findOne({ email: data, user_type: "zonal_manager" });
              if (ZONAL)
                await UserMaster.findOneAndUpdate({ _id: item.id }, { zonal_id: ZONAL.id }, { new: true, useFindAndModify: false });
            }
          }
          if (distinct_array_asm1.length) {
            for (let data of distinct_array_asm1) {
              let ASM = await UserMaster.findOne({ email: data, user_type: "asm" });
              if (ASM) await UserMaster.findOneAndUpdate({ _id: item.id }, { asm_id: ASM.id }, { new: true, useFindAndModify: false });
            }
          }
          if (distinct_array_agent1.length) {
            for (let data of distinct_array_agent1) {
              let AGENT = await UserMaster.findOne({ email: data, user_type: "agent" });
              if (AGENT)
                await UserMaster.findOneAndUpdate({ _id: item.id }, { agent_id: AGENT.id }, { new: true, useFindAndModify: false });
            }
          }
        }
      }
      console.log(`${num} data processed successfully`);
      return callback();
    }
  } catch (error) {
    console.log("Something went wrong: Service: userMasterDataSync", error);
    throw new Error(error);
  }
};

module.exports.buyerDataMappingInUserMaster = async () => {
  try {
    let num = 0;
    let err_count = 0;
    let update_count = 0;
    let cursor = await UserMapping.find({ customer_no: { $exists: true } }).cursor();
    cursor.next(function fn(err, item) {
      if (err || !item) return;

      setImmediate(fnAction, item, function () {
        cursor.next(fn);
      });
    });
    async function fnAction(item, callback) {
      item = formatMongoData(item);
      num++;
      let ZSD = await ZsdCustomer.findOne({ customer_no: item.customer_no }).sort({ _id: -1 });
      if (ZSD && ZSD.customer_name && ZSD.customer_no) {
        let BUYER_ID;
        let USER = await UserMaster.findOne({ email: item.customer_no, customer_id: item.customer_no });
        let user_data = { is_deleted: "n", status: "Active", password: "$2b$12$t1ERHiS05YmXWWs/LFr3HuswPSCLU3iIGKhtsvft7imp6lBpd4t6y" };
        user_data["format_type"] = "6073fccb1996fceb11d1a960"; // default value of WHS
        user_data["name"] = ZSD.customer_name;
        user_data["user_type"] = "buyer";
        user_data["city"] = ZSD.city ? ZSD.city : "";
        user_data["area_code"] = ZSD.sales_group;
        if (ZSD.mobile_phone && ZSD.mobile_phone.length >= 10) user_data["mobile"] = ZSD.mobile_phone.slice(-10);
        user_data["customer_id"] = item.customer_no;
        user_data["email"] = item.customer_no;
        user_data["multiple_user_login"] = false;

        if (item.nh_email) {
          let buyer_info = await UserMaster.findOne({ email: item.nh_email, user_type: "national_head" }).sort({ _id: -1 });
          if (buyer_info) user_data["national_id"] = buyer_info.id;
        }
        if (item.zsm_email) {
          let buyer_info = await UserMaster.findOne({ email: item.zsm_email, user_type: "zonal_manager" }).sort({ _id: -1 });
          if (buyer_info) user_data["zonal_id"] = buyer_info.id;
        }
        if (item.rsm_email) {
          let buyer_info = await UserMaster.findOne({ email: item.rsm_email, user_type: "rsm" }).sort({ _id: -1 });
          if (buyer_info) user_data["rsm_id"] = buyer_info.id;
        }
        if (item.asm_email) {
          let userData = await UserMaster.findOne({ email: item.asm_email, user_type: "asm" }).sort({ _id: -1 });
          if (userData) user_data["asm_id"] = userData.id;
        }
        if (item.agent_email) {
          let userData = await UserMaster.findOne({ email: item.agent_email, user_type: "agent" }).sort({ _id: -1 });
          if (userData) user_data["agent_id"] = userData.id;
        }
        let new_buyer;
        if (USER) {
          await UserMaster.findOneAndUpdate({ _id: USER.id }, user_data, { new: true, useFindAndModify: false });
        } else {
          let user = new UserMaster(user_data);
          new_buyer = await user.save();
        }
        BUYER_ID = USER ? USER.id : new_buyer.id;
        if (BUYER_ID && BUYER_ID != undefined && BUYER_ID != null) {
          let USER_INFO = {
            buyer_area_code: ZSD.sales_group,
            buyer_customer_no: item.customer_no,
            buyer_city: ZSD.city,
            buyer_name: ZSD.customer_name,
            buyer_id: BUYER_ID,
          };
          await UserMapping.findOneAndUpdate({ _id: item.id }, USER_INFO, { new: true, useFindAndModify: false });
          update_count++;
        } else {
          err_count++;
        }
        console.log(`${num} data processed successfully. Update Mapping count - ${update_count}. Error count - ${err_count}`);
      }
      return callback();
    }
  } catch (error) {
    console.log("Something went wrong: Service: buyerDataMappingInUserMaster", error);
    throw new Error(error);
  }
};

module.exports.insertUserUpdateRequest = async (serviceData) => {
  try {
    let data = new REQUEST({ ...serviceData });
    let user = await data.save();
    return formatMongoData(user);
  } catch (error) {
    console.log("Something went wrong: Service: insertUserUpdateRequest", error);
    throw new Error(error);
  }
};

// module.exports.userMasterMultipleAccessProvider = async () => {
//   try {
//     let num = 0;
//     let cursor = await UserMaster.find().cursor();
//     cursor.next(function fn(err, item) {
//       if (err || !item) return;

//       setImmediate(fnAction, item, function () {
//         cursor.next(fn);
//       });
//     });
//     async function fnAction(item, callback) {
//       item = formatMongoData(item);
//       num++;
//       if (item.national_id) {
//         if (item.user_type === 'buyer') {
//           let ZONAL;
//           let RSM;
//           let ASM;
//           let AGENT;
//           if (item.national_id) { ZONAL = item.national_id }
//           if (!item.zonal_id) {
//             await UserMaster.findOneAndUpdate(
//               { _id: item.id },
//               { zonal_id: ZONAL },
//               { new: true, useFindAndModify: false }
//             );
//             console.log('---------------------------------------', item, ZONAL, 'ZONAL');
//             return;
//           } else RSM = item.zonal_id;
//           if (!item.rsm_id) {
//             await UserMaster.findOneAndUpdate(
//               { _id: item.id },
//               { rsm_id: RSM },
//               { new: true, useFindAndModify: false }
//             );
//             console.log('---------------------------------------', item, RSM, 'RSM');
//             return;
//           } else ASM = item.rsm_id;
//           // return;
//           if (!item.asm_id) {
//             await UserMaster.findOneAndUpdate(
//               { _id: item.id },
//               { asm_id: ASM },
//               { new: true, useFindAndModify: false }
//             );
//           } else AGENT = item.asm_id;
//           if (!item.agent_id) {

//             await UserMaster.findOneAndUpdate(
//               { _id: item.id },
//               { agent_id: AGENT },
//               { new: true, useFindAndModify: false }
//             );
//             console.log('---------------------------------------', item, AGENT, "AGENT");
//             return;
//           }
//         }
//         // if (item.user_type === 'agent') {
//         //   let ZONAL;
//         //   let RSM;
//         //   let ASM;
//         //   if (item.national_id) { ZONAL = item.national_id }
//         //   if (!item.zonal_id) {
//         //     await UserMaster.findOneAndUpdate(
//         //       { _id: item.id },
//         //       { zonal_id: ZONAL },
//         //       { new: true, useFindAndModify: false }
//         //     );
//         //   } else RSM = item.zonal_id;
//         //   if (!item.rsm_id) {
//         //     await UserMaster.findOneAndUpdate(
//         //       { _id: item.id },
//         //       { rsm_id: RSM },
//         //       { new: true, useFindAndModify: false }
//         //     );
//         //   } else ASM = item.rsm_id;
//         //   if (!item.asm_id) {
//         //     await UserMaster.findOneAndUpdate(
//         //       { _id: item.id },
//         //       { asm_id: ASM },
//         //       { new: true, useFindAndModify: false }
//         //     );
//         //   }
//         // }
//         // if (item.user_type === 'asm') {
//         //   let ZONAL;
//         //   let RSM;
//         //   if (item.national_id) { ZONAL = item.national_id }
//         //   if (!item.zonal_id) {
//         //     await UserMaster.findOneAndUpdate(
//         //       { _id: item.id },
//         //       { zonal_id: ZONAL, multiple_user_login: true },
//         //       { new: true, useFindAndModify: false }
//         //     );
//         //   } else RSM = item.zonal_id;
//         //   if (!item.rsm_id) {
//         //     await UserMaster.findOneAndUpdate(
//         //       { _id: item.id },
//         //       { rsm_id: RSM, multiple_user_login: true },
//         //       { new: true, useFindAndModify: false }
//         //     );
//         //   }
//         // }
//         // if (item.user_type === 'rsm') {
//         //   let ZONAL;
//         //   if (item.national_id) { ZONAL = item.national_id }
//         //   if (!item.zonal_id) {
//         //     await UserMaster.findOneAndUpdate(
//         //       { _id: item.id },
//         //       { zonal_id: ZONAL, multiple_user_login: true },
//         //       { new: true, useFindAndModify: false }
//         //     );
//         //   }
//         // }
//         // if (item.user_type === 'zonal_manager') {
//         //   if (item.national_id) {
//         //     await UserMaster.findOneAndUpdate(
//         //       { _id: item.id },
//         //       { zonal_id: item.national_id, multiple_user_login: true },
//         //       { new: true, useFindAndModify: false }
//         //     );
//         //   }
//         // }
//       }
//       console.log(`${num} data processed successfully.`);
//       return callback();
//     }
//   } catch (error) {
//     console.log('Something went wrong: Service: userMasterMultipleAccessProvider', error);
//     throw new Error(error);
//   }
// };

module.exports.conversion_email_lowercase = async () => {
  try {
    let num = 0;
    let cursor = await UserMaster.find({ user_type: { $ne: "buyer" } }).cursor();
    cursor.next(function fn(err, item) {
      if (err || !item) return;

      setImmediate(fnAction, item, function () {
        cursor.next(fn);
      });
    });
    async function fnAction(item, callback) {
      item = formatMongoData(item);
      num++;
      if (item.email) {
        let email_lower_case = item.email.toLowerCase();
        let userDetail = await UserMaster.findOneAndUpdate(
          {
            _id: item.id,
          },
          { email: email_lower_case },
          {
            new: true,
            useFindAndModify: false,
          }
        );
      }
      console.log(`${num} data processed successfully.`);
      return callback();
    }
  } catch (error) {
    console.log("Something went wrong: Service: conversion_email_lowercase", error);
    throw new Error(error);
  }
};
