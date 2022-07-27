const constants = require('../constants');
const complaintService = require('../services/complaintService');
const userService = require("../services/userLoginService");
const fs = require("fs");

const axios = require('axios');
const bcrypt = require('bcrypt');
const moment = require('moment');
const jwt = require("jsonwebtoken");


module.exports.insertComplaint = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let createFolder = process.env.PHYSICAL_MEDIA_PATH + "complaints/";
        if (!fs.existsSync(createFolder)) fs.mkdirSync(createFolder);
        const { description, selected_complaint, priority } = req.body;

        if (!description && !selected_complaint && !priority) throw new Error('Please fill all fields!!!');

        let access_request = false;
        if (!req.body) throw new Error(`You are not authorised!!!`);
        const { user_id, user_role } = req.body;
        let authorised_access = ['zonal_manager', 'rsm', 'asm', 'agent', 'buyer', 'national_head', 'special_login'];
        if (authorised_access.includes(user_role)) access_request = true;
        else throw new Error(`You are not authorised!!!`);
        if (!access_request) throw new Error(`You are not authorised!!!`);

        let key = await complaintService.uniqueCodeGeneratorForComplain()

        let info = {
            description: description,
            selected_complaint: selected_complaint,
            status: 'Active',
            priority: priority,
            submitted_by: user_id,
            user_type: user_role,
            ticket_no: key
        }
        if (req.file) {
            let filePath = '';
            let oldpath = req.file.path;
            let cur_date = new Date();
            let file_date = moment(cur_date).format("DD-MM-YYYY");
            let random_number = Math.floor((Math.random() * 10000000000) + 1);
            filePath = `./uploads/complaints/ ${random_number}__${file_date}__${req.file.originalname}`;

            fs.rename(oldpath, filePath, function (err) {
                if (err) throw err;
            });
            info['file'] = filePath;
        }
        let data = await complaintService.insert_complaint(info);
        if (data) {
            response.status = 201;
            response.message = `Your complaint registered`;
            response.body = { data: key };
        } else {
            response.status = 202;
            response.message = `Please try again.`;
        }
    } catch (error) {
        console.log('Something went wrong: Controller: insertComplaint', error);
        response.message = error.message;
    }
    return res.status(response.status).send(response);
};