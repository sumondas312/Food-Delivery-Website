const constants = require('../constants');
const importService = require('../services/importService');
const fs = require('fs');
const axios = require('axios');
const bcrypt = require('bcrypt');
const readXlsxFile = require('read-excel-file/node');
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const moment = require('moment');
const CsvToJson = require('csvtojson');

module.exports.importMainFile = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.file) {
      throw new Error('File not found');
    }
    let extention = req.file.originalname.split('.');
    if (extention[1].toLowerCase() != 'xlsx') {
      throw new Error('File not supported');
    }
    let filePath = '';
    let oldpath = req.file.path;
    let cur_date = new Date();
    let file_date = moment(cur_date).format("DD-MM-YYYY");
    // console.log(oldpath);
    let random_number = Math.floor((Math.random() * 10000000000) + 1);
    filePath = `./uploads/main/ ${random_number}__${file_date}__${req.file.originalname}`;

    fs.rename(oldpath, filePath, function (err) {
      if (err) throw err;
    });

    let num = 0;

    await CsvToJson({ noheader: true, output: "csv" }).fromFile(filePath).then(async (csvRows) => {
    // await readXlsxFile(filePath).then(async (csvRows) => {
      var productItem = {}
      for (var i = 1; i < csvRows.length; i++) {
        num++;
        var csvItem = csvRows[i];
        let main = {
          cust_grp: csvItem[1] ? csvItem[1] : '',
          sales_district: csvItem[2] ? csvItem[2] : '',
          sales_grp: csvItem[3] ? csvItem[3] : '',
          market_segment: csvItem[4] ? csvItem[4] : '',
          customer_grp: csvItem[5] ? csvItem[5] : '',
          sales_doc_type: csvItem[6] ? csvItem[6] : '',
          usage: csvItem[7] ? csvItem[7] : '',
          country_code: csvItem[8] ? csvItem[8] : '',
          area_manager_desg: csvItem[9] ? csvItem[9] : '',
          regional_manager: csvItem[10] ? csvItem[10] : '',
          zonal_manager: csvItem[11] ? csvItem[11] : '',
          national_head: csvItem[12] ? csvItem[12] : '',
          agent_name: csvItem[13] ? csvItem[13] : '',
          agent_agency: csvItem[14] ? csvItem[14] : '',
          agency_area_name: csvItem[15] ? csvItem[15] : '',
          business_area: csvItem[16] ? csvItem[16] : '',
          fso_name: csvItem[17] ? csvItem[17] : '',
          national_head_email: csvItem[18] ? csvItem[18] : '',
          rsm_email: csvItem[19] ? csvItem[19] : '',
          asm_email: csvItem[20] ? csvItem[20] : '',
          zonal_email: csvItem[21] ? csvItem[21] : '',
          agent_email: csvItem[22] ? csvItem[22] : '',
          fso_email: csvItem[23] ? csvItem[23] : '',
          national_head_mobile: csvItem[24] ? csvItem[24] : '',
          rsm_mobile: csvItem[25] ? csvItem[25] : '',
          asm_mobile: csvItem[26] ? csvItem[26] : '',
          zonal_manager_mobile: csvItem[27] ? csvItem[27] : '',
          agent_mobile: csvItem[28] ? csvItem[28] : '',
          fso_mobile: csvItem[29] ? csvItem[29] : '',
          sales_org: csvItem[30] ? csvItem[30] : '',
          unique_key: csvItem[31] ? csvItem[31] : ''
        }
        await importService.insertMainFile(main);

      }
      console.log(`processed data ${num}`);
    })

    response.status = 201;
    response.message = `${num} data insert into main file`;
  } catch (error) {
    console.log('Something went wrong: Controller: importMainFile', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
}

module.exports.importUserMaster = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.file) {
      throw new Error('File not found');
    }
    let extention = req.file.originalname.split('.');
    if (extention[1].toLowerCase() != 'xlsx') {
      throw new Error('File not supported');
    }
    let filePath = '';
    let oldpath = req.file.path;
    let cur_date = new Date();
    let file_date = moment(cur_date).format("DD-MM-YYYY");
    // console.log(oldpath);
    let random_number = Math.floor((Math.random() * 10000000000) + 1);
    filePath = `./uploads/main/ ${random_number}__${file_date}__${req.file.originalname}`;

    fs.rename(oldpath, filePath, function (err) {
      if (err) throw err;
    });

    let num = 0;

    await CsvToJson({ noheader: true, output: "csv" }).fromFile(filePath).then(async (csvRows) => {
    // await readXlsxFile(filePath).then(async (csvRows) => {
      var productItem = {}
      for (var i = 1; i < csvRows.length; i++) {
        let csvItem = csvRows[i];
        let ZONAL;
        let ASM;
        let AGENT;
        //TODO: ZONAL
        if (csvItem[21] && csvItem[21].trim()) {
          let password = await bcrypt.hash('zonal123456', 12);
          let zonal_user = {
            name: csvItem[11],
            zonal_manager_name: csvItem[11],
            // zonal_manager_email: csvItem[21],
            email: csvItem[21],
            zonal_manager_mobile: csvItem[27],
            mobile: csvItem[27],
            password: password,
            user_type: 'zonal_manager',
            status: "Active",
            is_deleted: "n"
          }
          console.warn(`zonal member ${num}----${i}`)
          let find_zonal = await importService.findUserMaster({ email: csvItem[21].trim() });
          if (find_zonal) {
            let exist_zonal = await importService.updateUserMaster({ id: find_zonal[0].id, updateInfo: zonal_user });
            ZONAL = exist_zonal.id;

          } else {
            let zonal = await importService.insertUserMasterFile(zonal_user);
            ZONAL = zonal.id;

          }
        }
        //TODO: ASM

        if (csvItem[20] && csvItem[20].trim() && ZONAL) {
          let password = await bcrypt.hash('asm123456', 12);
          let asm_user = {
            name: csvItem[9],
            asm_name: csvItem[9],
            // asm_email: csvItem[20],
            email: csvItem[20],
            asm_mobile: csvItem[26],
            mobile: csvItem[26],
            password: password,
            user_type: 'asm',
            status: "Active",
            is_deleted: "n",
            zonal_id: ZONAL
          }
          let find_asm = await importService.findUserMaster({ email: csvItem[20].trim() });
          if (find_asm) {
            let exist_asm = await importService.updateUserMaster({ id: find_asm[0].id, updateInfo: asm_user });
            ASM = exist_asm.id;
          } else {
            let asm = await importService.insertUserMasterFile(asm_user);
            ASM = asm.id;

          }
        }
        //TODO: AGENT

        if (csvItem[22] && csvItem[22].trim() && ASM && ZONAL) {
          let password = await bcrypt.hash('agent123456', 12);
          let agent_user = {
            name: csvItem[9],
            asm_name: csvItem[9],
            // asm_email: csvItem[22],
            email: csvItem[22],
            asm_mobile: csvItem[26],
            mobile: csvItem[26],
            password: password,
            user_type: 'asm',
            status: "Active",
            is_deleted: "n",
            zonal_id: ZONAL,
            asm_id: ASM,
          }
          let find_agent = await importService.findUserMaster({ email: csvItem[22].trim() });
          if (find_agent) {
            let exist_agent = await importService.updateUserMaster({ id: find_agent[0].id, updateInfo: agent_user });
            AGENT = exist_agent.id;
          } else {
            let agent = await importService.insertUserMasterFile(agent_user);
            AGENT = agent.id;
          }
        }
        //TODO: BUYER

        // if (csvItem[22] && csvItem[22].trim()) {
        //   let password = await bcrypt.hash('agent123456', 12);
        //   let agent_user = {
        //     name: csvItem[9],
        //     asm_name: csvItem[9],
        //     // asm_email: csvItem[22],
        //     email: csvItem[22],
        //     asm_mobile: csvItem[26],
        //     mobile: csvItem[26],
        //     password: password,
        //     user_type : 'asm',
        //     status: "Active",
        //     is_deleted : "n",
        //     zonal_id: ZONAL,
        //     asm_id: ASM,
        //   }

        //   let agent = await importService.insertUserMasterFile(agent_user);
        //   AGENT = agent.id;
        // }





        // let main = {
        //   cust_grp: csvItem[1] ? csvItem[1] : '',
        //   sales_district: csvItem[2] ? csvItem[2] : '',
        //   sales_grp: csvItem[3] ? csvItem[3] : '',
        //   market_segment: csvItem[4] ? csvItem[4] : '',
        //   customer_grp: csvItem[5] ? csvItem[5] : '',
        //   sales_doc_type: csvItem[6] ? csvItem[6] : '',
        //   usage: csvItem[7] ? csvItem[7] : '',
        //   country_code: csvItem[8] ? csvItem[8] : '',
        //   area_manager_desg: csvItem[9] ? csvItem[9] : '',
        //   regional_manager: csvItem[10] ? csvItem[10] : '',
        //   zonal_manager: csvItem[11] ? csvItem[11] : '',
        //   national_head: csvItem[12] ? csvItem[12] : '',
        //   agent_name: csvItem[13] ? csvItem[13] : '',
        //   agent_agency: csvItem[14] ? csvItem[14] : '',
        //   agency_area_name: csvItem[15] ? csvItem[15] : '',
        //   business_area: csvItem[16] ? csvItem[16] : '',
        //   fso_name: csvItem[17] ? csvItem[17] : '',
        //   national_head_email: csvItem[18] ? csvItem[18] : '',
        //   rsm_email: csvItem[19] ? csvItem[19] : '',
        //   asm_email: csvItem[20] ? csvItem[20] : '',
        //   zonal_email: csvItem[21] ? csvItem[21] : '',
        //   agent_email: csvItem[22] ? csvItem[22] : '',
        //   fso_email: csvItem[23] ? csvItem[23] : '',
        //   national_head_mobile: csvItem[24] ? csvItem[24] : '',
        //   rsm_mobile: csvItem[25] ? csvItem[25] : '',
        //   asm_mobile: csvItem[26] ? csvItem[26] : '',
        //   zonal_manager_mobile: csvItem[27] ? csvItem[27] : '',
        //   agent_mobile: csvItem[28] ? csvItem[28] : '',
        //   fso_mobile: csvItem[29] ? csvItem[29] : '',
        //   sales_org: csvItem[30] ? csvItem[30] : '',
        //   unique_key: csvItem[31] ? csvItem[31] : ''
        // }
        // await importService.insertMainFile(main);
        num++;

      }
      console.log(`processed data ${num}`);
    })

    response.status = 201;
    response.message = `${num} data insert into main file`;
  } catch (error) {
    console.log('Something went wrong: Controller: importUserMaster', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
}

module.exports.importProductFile = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    // let admin_access = false;
    // if (!req.body) throw new Error(`You are not authorised!!!`);
    // const { user_id, user_role } = req.body;
    // if (user_role.toLowerCase() === 'admin') admin_access = true;
    // else throw new Error(`You are not authorised!!!`);
    // if (!admin_access) throw new Error(`You are not authorised!!!`);

    let createFolder = process.env.PHYSICAL_MEDIA_PATH + "product/";
    if (!fs.existsSync(createFolder)) fs.mkdirSync(createFolder);
    if (!req.file) throw new Error('File not found');
    let extention = req.file.originalname.split('.');
    if (extention[1].toLowerCase() != 'csv') throw new Error('File not supported');

    let filePath = '';
    let oldpath = req.file.path;
    let cur_date = new Date();
    let file_date = moment(cur_date).format("DD-MM-YYYY");
    let random_number = Math.floor((Math.random() * 10000000000) + 1);
    filePath = `./uploads/product/ ${random_number}__${file_date}__${req.file.originalname}`;

    fs.rename(oldpath, filePath, function (err) {
      if (err) throw err;
    });
    let num = 0;
    await CsvToJson({ noheader: true, output: "csv" }).fromFile(filePath).then(async (csvRows) => {
      // await readXlsxFile(filePath).then(async (csvRows) => {
      for (let i = 1; i < csvRows.length; i++) {
        num++;
        let csvItem = csvRows[i];
        let ulc_arr = [];
        if (csvItem[11] != 0 && csvItem[11] != null) ulc_arr.push(csvItem[11]);
        if (csvItem[12] != 0 && csvItem[12] != null) ulc_arr.push(csvItem[12]);
        if (csvItem[13] != 0 && csvItem[13] != null) ulc_arr.push(csvItem[13]);
        if (csvItem[14] != 0 && csvItem[14] != null) ulc_arr.push(csvItem[14]);
        if (csvItem[15] != 0 && csvItem[15] != null) ulc_arr.push(csvItem[15]);
        if (csvItem[16] != 0 && csvItem[16] != null) ulc_arr.push(csvItem[16]);
        let ulc_data = ulc_arr.join(',');
        let main = {
          SEASON: csvItem[0] ? csvItem[0] : '',
          YEAR: csvItem[1] ? csvItem[1] : '',
          QUALITY_NO: csvItem[2] ? csvItem[2] : '',
          MATERIAL: csvItem[3] ? csvItem[3] : '',
          SHADE: csvItem[4] ? csvItem[4] : '',
          EXT_MATERIAL_GROUP: csvItem[5] ? csvItem[5] : '',
          MATERIAL_GROUP: csvItem[6] ? csvItem[6] : '',
          MATERIAL_GROUP1: csvItem[7] ? csvItem[7] : '',
          PRODUCT_HIERARCHY: csvItem[8] ? csvItem[8] : '',
          FLC_NO: csvItem[9] ? csvItem[9] : '',
          MATERIAL1: csvItem[10] ? csvItem[10] : '',
          ULC: ulc_data.toString(),
          X_DISTR_CHAIN_STATUS: csvItem[17] ? csvItem[17] : '',
          FINISH_WEIGHT_PER_MTR: csvItem[18] ? csvItem[18] : '',
          FINISH_WEIGHT_PER_MTR1: csvItem[19] ? csvItem[19] : '',
          PRICING_REFERENCE_MATERIAL_ID: csvItem[20] ? csvItem[20] : '',
          PRICING_REF_MATL: csvItem[21] ? csvItem[21] : '',
          ALLOCATION_INDICATOR: csvItem[22] ? csvItem[22] : '',
          COST_PER_MTR: csvItem[23] ? csvItem[23] : '',
          PLAN_COST_PER_MTR: csvItem[24] ? csvItem[24] : '',
          EX_FACTORY_PRICE: csvItem[25] ? csvItem[25] : '',
          PLAN_EX_FACTORY_PRICE: csvItem[26] ? csvItem[26] : '',
          PLAN_QTY: csvItem[27] ? csvItem[27] : '',
          WHOSALE_PRICE: csvItem[28] ? csvItem[28] : '',
          RETAIL_PRICE: csvItem[29] ? csvItem[29] : '',
          DELIVERY_PERIOD: csvItem[30] ? csvItem[30] : '',
          PLANT: csvItem[31] ? csvItem[31] : '',
          GP_NUMBER: csvItem[32] ? csvItem[32] : '',
          SEQUENCE_NUMBER_OF_MATERIAL: csvItem[33] ? csvItem[33] : '',
          MATERIAL_GROUP2: csvItem[34] ? csvItem[34] : '',
          MATERIAL_GROUP7: csvItem[35] ? csvItem[35] : '',
          SPECIAL_FINISH: csvItem[36] ? csvItem[36] : '',
          PIR_QTY: csvItem[37] ? csvItem[37] : '',
          UNASSIGNED_STOCK: csvItem[38] ? csvItem[38] : '',
          TOTAL_AVAILABILITY: csvItem[39] ? csvItem[39] : '',
          DATE: csvItem[40] ? csvItem[40] : '',
          USER_NAME: csvItem[41] ? csvItem[41] : '',
          DELETION_INDICATOR: csvItem[42] ? csvItem[42] : '',
          TRACKING_INDICATOR_FOR_SAMPLE_CARD_PRE: csvItem[43] ? csvItem[43] : '',
          DATE_WHEN_SAMPLE_CARD_UPDATED: csvItem[44] ? csvItem[44] : '',
          USER_NAME2: csvItem[45] ? csvItem[45] : '',
          DATE2: csvItem[46] ? csvItem[46] : '',
          USER_NAME3: csvItem[47] ? csvItem[47] : '',
          DATE3: csvItem[48] ? csvItem[48] : '',
          USER_NAME4: csvItem[49] ? csvItem[49] : '',
          DESCRIPTION: csvItem[50] ? csvItem[50] : '',
          MRP_SL_CL: csvItem[51] ? csvItem[51] : '',
          FORECAST: csvItem[52] ? csvItem[52] : '',
          FASHION: csvItem[53] ? csvItem[53] : '',
          FOCUSED: csvItem[54] ? csvItem[54] : '',
          EXCLUSION: csvItem[55] ? csvItem[55] : '',
          NUMBER_OF_PIECES: csvItem[56] ? csvItem[56] : '',
        }
        console.log(`processed data ${num}`);
        await importService.insertProductFile(main);
      }
      console.log(`Total processed data ${num}`);
    })

    response.status = 201;
    response.message = `${num} data insert into main file`;
  } catch (error) {
    console.log('Something went wrong: Controller: importProductFile', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
}

module.exports.importZsdCustomerDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    // let createFolder = process.env.PHYSICAL_MEDIA_PATH + "customer_details/";
    // if (!fs.existsSync(createFolder)) fs.mkdirSync(createFolder);
    if (!req.file) throw new Error('File not found');
    let extention = req.file.originalname.split('.');
    if (extention[1].toLowerCase() != 'xlsx') throw new Error('File not supported');
    let filePath = '';
    let oldpath = req.file.path;
    let cur_date = new Date();
    let file_date = moment(cur_date).format("DD-MM-YYYY");
    let random_number = Math.floor((Math.random() * 10000000000) + 1);
    filePath = `./uploads/customer_details/ ${random_number}__${file_date}__${req.file.originalname}`;

    fs.rename(oldpath, filePath, (err) => { if (err) throw err; });
    let num = 0;
    await CsvToJson({ noheader: true, output: "csv" }).fromFile(filePath).then(async (csvRows) => {
    // await readXlsxFile(filePath).then(async (csvRows) => {
      for (let i = 1; i < csvRows.length; i++) {
        num++;
        let key = '';
        let csvItem = csvRows[i];
        if (csvItem[15]) {
          let len = csvItem[15].toString().length;
          if (len == 1) csvItem[15] = '0' + csvItem[15];
          key += csvItem[15];
        }
        if (csvItem[13]) {
          let len = csvItem[13].toString().length;
          if (len == 1) csvItem[13] = '0' + csvItem[13];
          key += csvItem[13];
        }
        if (csvItem[24]) key += csvItem[24];
        if (csvItem[26]) key += csvItem[26];
        if (csvItem[14]) key += csvItem[14];
        if (csvItem[48]) key += csvItem[48];
        key.replace(/ /g, "");
        let main = {
          customer_no: csvItem[0] ? csvItem[0] : '',
          buying_group: csvItem[1] ? csvItem[1] : '',
          cust_grp1: csvItem[2] ? csvItem[2] : '',
          customer_group_3: csvItem[3] ? csvItem[3] : '',
          name_2: csvItem[4] ? csvItem[4] : '',
          customer_name: csvItem[5] ? csvItem[5] : '',
          address_1: csvItem[6] ? csvItem[6] : '',
          address_2: csvItem[7] ? csvItem[7] : '',
          city: csvItem[8] ? csvItem[8] : '',
          pincode: csvItem[9] ? csvItem[9] : '',
          contact_person: csvItem[10] ? csvItem[10] : '',
          telephone_no: csvItem[11] ? csvItem[11] : '',
          mobile_phone: csvItem[12] ? csvItem[12] : '',
          sales_group: csvItem[13] ? csvItem[13] : '',
          customer_group: csvItem[14] ? csvItem[14] : '',
          county_code: csvItem[15] ? csvItem[15] : '',
          email_id1: csvItem[16] ? csvItem[16].toLowerCase() : '',
          email_id2: csvItem[17] ? csvItem[17].toLowerCase() : '',
          email_id3: csvItem[18] ? csvItem[18].toLowerCase() : '',
          email_id4: csvItem[19] ? csvItem[19].toLowerCase() : '',
          vat_registration_no: csvItem[20] ? csvItem[20] : '',
          pan_no: csvItem[21] ? csvItem[21] : '',
          date_of_appointment: csvItem[22] ? csvItem[22] : '',
          city_code: csvItem[23] ? csvItem[23] : '',
          sales_district: csvItem[24] ? csvItem[24] : '',
          cust_grp2: csvItem[25] ? csvItem[25] : '',
          customer_group_5: csvItem[26] ? csvItem[26] : '',
          region_description: csvItem[27] ? csvItem[27] : '',
          district: csvItem[28] ? csvItem[28] : '',
          deactivate_date: csvItem[29] ? csvItem[29] : '',
          reactivate_date: csvItem[30] ? csvItem[30] : '',
          tax_no3: csvItem[31] ? csvItem[31] : '',
          distribution_channel: csvItem[32] ? csvItem[32] : '',
          region: csvItem[33] ? csvItem[33] : '',
          central_order_block: csvItem[34] ? csvItem[34] : '',
          central_delivery_block: csvItem[35] ? csvItem[35] : '',
          sales_area_deletion: csvItem[36] ? csvItem[36] : '',
          division: csvItem[37] ? csvItem[37] : '',
          spouse_name: csvItem[38] ? csvItem[38] : '',
          mariiage_date: csvItem[39] ? csvItem[39] : '',
          date_of_birth: csvItem[40] ? csvItem[40] : '',
          gender: csvItem[41] ? csvItem[41] : '',
          marital_status: csvItem[42] ? csvItem[42] : '',
          trading_partner: csvItem[43] ? csvItem[43] : '',
          draft_limit: csvItem[44] ? csvItem[44] : '',
          credit_limit: csvItem[45] ? csvItem[45] : '',
          credit_exposure: csvItem[46] ? csvItem[46] : '',
          sales_org: csvItem[47] ? csvItem[47] : '',
          sales_office: csvItem[48] ? csvItem[48] : '',
          central_deletion_flag: csvItem[49] ? csvItem[49] : '',
          central_billing_block: csvItem[50] ? csvItem[50] : '',
          sa_order_block: csvItem[51] ? csvItem[51] : '',
          sa_deliver_block: csvItem[52] ? csvItem[52] : '',
          sa_billing_block: csvItem[53] ? csvItem[53] : '',
          customer_group_4: csvItem[54] ? csvItem[54] : '',
          unloading_point: csvItem[55] ? csvItem[55] : '',
          credit_ac_no: csvItem[56] ? csvItem[56] : '',
          thane_transporter: csvItem[57] ? csvItem[57] : '',
          chindwara_transporter: csvItem[58] ? csvItem[58] : '',
          vapi_transporter: csvItem[59] ? csvItem[59] : '',
          thane_courier: csvItem[60] ? csvItem[60] : '',
          chindwara_courier: csvItem[61] ? csvItem[61] : '',
          vapi_courier: csvItem[62] ? csvItem[62] : '',
          jalgaon_transporter: csvItem[63] ? csvItem[63] : '',
          created_on: csvItem[64] ? csvItem[64] : '',
          home_city: csvItem[65] ? csvItem[65] : '',
          created_by: csvItem[66] ? csvItem[66] : '',
          customer_classification: csvItem[67] ? csvItem[67] : '',
          cust_pric_proce: csvItem[68] ? csvItem[68] : '',
          recon_acct: csvItem[69] ? csvItem[69] : '',
          ws_custno: csvItem[70] ? csvItem[70] : '',
          ws_name: csvItem[71] ? csvItem[71] : '',
          ws_city: csvItem[72] ? csvItem[72] : '',
          price_group: csvItem[73] ? csvItem[73] : '',
          customer_tax_classification: csvItem[74] ? csvItem[74] : '',
          customer_key: key
        }
        console.log(`processed data ${num}`);
        await importService.insertZsdCustomer(main);
      }
      console.log(`Total processed data ${num}`);
    })

    response.status = 201;
    response.message = `${num} data insert into main file`;
  } catch (error) {
    console.log('Something went wrong: Controller: importZsdCustomerDetails', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.importZmlDesignation = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    // let createFolder = process.env.PHYSICAL_MEDIA_PATH + "zml_designation/";
    // if (!fs.existsSync(createFolder)) fs.mkdirSync(createFolder);
    if (!req.file) throw new Error('File not found');
    let extention = req.file.originalname.split('.');
    if (extention[1].toLowerCase() != 'xlsx') throw new Error('File not supported');
    let filePath = '';
    let oldpath = req.file.path;
    let cur_date = new Date();
    let file_date = moment(cur_date).format("DD-MM-YYYY");
    let random_number = Math.floor((Math.random() * 10000000000) + 1);
    filePath = `./uploads/zml_designation/ ${random_number}__${file_date}__${req.file.originalname}`;

    fs.rename(oldpath, filePath, (err) => { if (err) throw err; });
    let num = 0;
    await CsvToJson({ noheader: true, output: "csv" }).fromFile(filePath).then(async (csvRows) => {
    // await readXlsxFile(filePath).then(async (csvRows) => {
      for (let i = 5; i < csvRows.length; i++) {
        num++;
        let key = '';
        let csvItem = csvRows[i];
        if (csvItem[0]) {
          let len = csvItem[0].toString().length;
          if (len == 1) csvItem[0] = '0' + csvItem[0];
          key += csvItem[0];
        }
        if (csvItem[1]) {
          let len = csvItem[1].toString().length;
          if (len == 1) csvItem[1] = '0' + csvItem[1];
          key += csvItem[1];
        }
        if (csvItem[2]) key += csvItem[2];
        if (csvItem[3]) key += csvItem[3];
        if (csvItem[4]) key += csvItem[4];
        key.replace(/ /g, "");
        let main = {
          county_code: csvItem[0] ? csvItem[0] : '',
          sales_group: csvItem[1] ? csvItem[1] : '',
          sales_district: csvItem[2] ? csvItem[2] : '',
          customer_group_5: csvItem[3] ? csvItem[3] : '',
          customer_group: csvItem[4] ? csvItem[4] : '',
          market_segment: csvItem[5] ? csvItem[5] : '',
          sales_document_type: csvItem[6] ? csvItem[6] : '',
          usage: csvItem[7] ? csvItem[7] : '',
          division: csvItem[8] ? csvItem[8] : '',
          area_manager: csvItem[9] ? csvItem[9] : '',
          regional_manager: csvItem[10] ? csvItem[10] : '',
          zonal_manager: csvItem[11] ? csvItem[11] : '',
          national_head: csvItem[12] ? csvItem[12] : '',
          agent_name: csvItem[13] ? csvItem[13] : '',
          agent_agency: csvItem[14] ? csvItem[14] : '',
          agency_area_name: csvItem[15] ? csvItem[15] : '',
          business_area: csvItem[16] ? csvItem[16] : '',
          fso_name: csvItem[17] ? csvItem[17] : '',
          national_head_email: csvItem[18] ? csvItem[18].toLowerCase() : '',
          rsm_email: csvItem[19] ? csvItem[19].toLowerCase() : '',
          asm_email: csvItem[20] ? csvItem[20].toLowerCase() : '',
          zonal_email: csvItem[21] ? csvItem[21].toLowerCase() : '',
          agent_email: csvItem[22] ? csvItem[22].toLowerCase() : '',
          fso_email: csvItem[23] ? csvItem[23].toLowerCase() : '',
          national_head_number: csvItem[24] ? csvItem[24] : '',
          rsm_number: csvItem[25] ? csvItem[25] : '',
          asm_number: csvItem[26] ? csvItem[26] : '',
          zonal_manger_number: csvItem[27] ? csvItem[27] : '',
          agent_number: csvItem[28] ? csvItem[28] : '',
          fso_number: csvItem[29] ? csvItem[29] : '',
          nh_sap_id: csvItem[30] ? csvItem[30] : '',
          zm_sap_id: csvItem[31] ? csvItem[31] : '',
          rm_sap_id: csvItem[32] ? csvItem[32] : '',
          am_sap_id: csvItem[33] ? csvItem[33] : '',
          agent_sap_id: csvItem[34] ? csvItem[34] : '',
          fso_sap_id: csvItem[35] ? csvItem[35] : '',
          net_flag: csvItem[36] ? csvItem[36] : '',
          customer_key: key + '1000'
        }
        console.log(`processed data ${num}`);
        await importService.insertZmlDesignation(main);
      }
      console.log(`Total processed data ${num}`);
    })

    response.status = 201;
    response.message = `${num} data insert into main file`;
  } catch (error) {
    console.log('Something went wrong: Controller: importZmlDesignation', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
}

module.exports.correctionApi = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    await importService.data_correction_api();

    response.status = 202;
    response.message = `city & area_code mapping in process...`;
  } catch (error) {
    console.log('Something went wrong: Controller: correctionApi', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};