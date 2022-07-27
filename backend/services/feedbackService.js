const constants = require('../constants');
const { formatMongoData } = require('../helpers/dbHelper');
const Feedback = require('../database/models/feedbackModel');
const Tradefeedback = require('../database/models/tradefeedbackModel');
const Tradefeedbacksuiting = require('../database/models/tradefeedbacksuitingModel');
const Gmbfeedback = require('../database/models/gmbFeedbackModel');
const Apparelfeedback = require('../database/models/apparelfeedbackModel');
const http = require('http');
let fastcsv = require('fast-csv');
let fs = require('fs');
const moment = require('moment');

module.exports.prefeedback = async (req) => {
  var feedbackReady = {};
  const phone = req.body.phone;
  const feedbackType = 'pre';
  const feedback1Split = req.body.feedback1.split(':');
  const feedback2Split = req.body.feedback2.split(':');
  const feedback3Split = req.body.feedback3.split(':');
  const feedback4Split = req.body.feedback4.split(':');
  const feedback5Split = req.body.feedback5.split(':');
  feedbackReady = {
    phone: phone,
    type: feedbackType,
    feedback: [
      { question: feedback1Split[0], answer: feedback1Split[1] },
      { question: feedback2Split[0], answer: feedback2Split[1] },
      { question: feedback3Split[0], answer: feedback3Split[1] },
      { question: feedback4Split[0], answer: feedback4Split[1] },
      { question: feedback5Split[0], answer: feedback5Split[1] },
    ],
  };
  try {
    const newFeedback = new Feedback(feedbackReady);
    let feedbackResult = await newFeedback.save();
    // console.log(feedbackResult);
    return await formatMongoData(feedbackResult);
  } catch (error) {
    console.log('Something went wrong: Service: prefeedback', error);
    throw new Error(error);
  }
};

module.exports.postFeedback = async (req) => {
  var feedbackReady = {};
  const phone = req.body.phone;
  const feedbackType = 'post';
  const feedback1Split = req.body.feedback1.split(':');
  const feedback2Split = req.body.feedback2.split(':');
  const feedback3Split = req.body.feedback3.split(':');
  const feedback4Split = req.body.feedback4.split(':');
  const feedback5Split = req.body.feedback5.split(':');
  feedbackReady = {
    phone: phone,
    type: feedbackType,
    feedback: [
      {
        question: feedback1Split[0],
        answer: feedback1Split[1],
      },
      {
        question: feedback2Split[0],
        answer: feedback2Split[1],
      },
      {
        question: feedback3Split[0],
        answer: feedback3Split[1],
      },
      {
        question: feedback4Split[0],
        answer: feedback4Split[1],
      },
      {
        question: feedback5Split[0],
        answer: feedback5Split[1],
      },
    ],
  };
  try {
    const newFeedback = new Feedback(feedbackReady);
    let feedbackResult = await newFeedback.save();
    return await formatMongoData(feedbackResult);
  } catch (error) {
    console.log('Something went wrong: Service: postfeedback', error);
    throw new Error(error);
  }
};

module.exports.getallfeedbacks = async (req) => {
  const phone = req.phone;
  console.log('Phone from all feedback service ' + phone);
  let allfeedbackResult = [];
  try {
    allfeedbackResult = await Feedback.find({ phone });

    return allfeedbackResult;
  } catch (error) {
    console.log('Something went wrong: Service: getallfeedbacks', error);
    throw new Error(error);
  }
};

module.exports.export = async (req) => {
  const phone = req.phone;
  let allfeedbackResult;
  let randomnumber = Math.floor(Math.random() * 1000000 + 1);
  let ws = fs.createWriteStream('exported_feedback_data.csv');
  try {
    allfeedbackResult = await Feedback.find({ phone });
    var size = Object.keys(allfeedbackResult).length;
    if (size <= 0) {
      throw new Error(constants.feedbackMessage.NO_FEEDBACK_FOUND);
    } else if (size >= 1) {
      let jsonData = [];
      for (let i = 0; i < size; i++) {
        let phone = allfeedbackResult[i].phone;
        let type = allfeedbackResult[i].type;
        let createdAt = moment(allfeedbackResult[i].createdAt).format('DD-MM-YYYY HH:MM:SS');

        for (let j = 0; j < 5; j++) {
          let question = allfeedbackResult[i].feedback[j].question;
          let answer = allfeedbackResult[i].feedback[j].answer;
          const exportobject = {
            Phone: phone,
            Type: type,
            Question: question,
            Feedback: answer,
            Date: createdAt,
          };
          jsonData.push(exportobject);
        }
      }

      fastcsv
        .write(jsonData, { headers: true })
        .on('finish', function () {
          console.log(constants.feedbackMessage.FEEDBACK_FILE_CREATED);
        })
        .pipe(ws);
      var oldPath = 'exported_feedback_data.csv';
      var newPath = `downloads/${phone}_exported_feedback_data_${randomnumber}.csv`;
      fs.rename(oldPath, newPath, function (err) {
        if (err) throw new Error(err);
      });
      const directoryName = process.env.api_base_url;
      const directFileUrl = directoryName + '/' + newPath;

      const fileUrl = { feedbackurl: directFileUrl };
      return fileUrl;
    }
  } catch (error) {
    console.log('Something went wrong: Service: export', error);
    throw new Error(error);
  }
};

module.exports.exporttradefeedback = async () => {
  let allfeedbackResult;
  let randomnumber = Math.floor(Math.random() * 1000000 + 1);
  let ws = fs.createWriteStream('Exported_Trade_Feedback_Data.csv');
  try {
    allfeedbackResult = await Tradefeedback.find();
    var size = allfeedbackResult.length;
    if (size <= 0) {
      throw new Error(constants.feedbackMessage.NO_FEEDBACK_FOUND);
    } else if (size >= 1) {
      let jsonData = [];
      for (let i = 0; i < size; i++) {
        let phone = allfeedbackResult[i].phone;
        var comment = allfeedbackResult[i].comment;
        let createdAt = moment(allfeedbackResult[i].createdAt).format('DD-MM-YYYY HH:MM:SS');
        for (let j = 0; j < 12; j++) {
          let question = allfeedbackResult[i].tradefeedbacks[j].question;
          let answer = allfeedbackResult[i].tradefeedbacks[j].answer;
          var exportobject = {
            Phone: phone,
            Question: question,
            Feedback: answer,
            Comment: comment,
            Date: createdAt,
          };

          jsonData.push(exportobject);
        }
      }

      fastcsv
        .write(jsonData, { headers: true })
        .on('finish', function () {
          console.log(constants.feedbackMessage.FEEDBACK_FILE_CREATED);
        })
        .pipe(ws);

      var oldPath = 'Exported_Trade_Feedback_Data.csv';
      var newPath = `downloads/Exported_Trade_Feedback_Data_${randomnumber}.csv`;
      fs.rename(oldPath, newPath, function (err) {
        if (err) throw new Error(err);
      });
      const directoryName = process.env.api_base_url;
      const directFileUrl = directoryName + '/' + newPath;

      const fileUrl = { feedbackurl: directFileUrl };
      return fileUrl;
    }
  } catch (error) {
    console.log('Something went wrong: Service: export', error);
    throw new Error(error);
  }
};

module.exports.tradefeedback = async (req) => {
  var tradefeedbackReady = {};
  const phone = req.body.phone;
  const existingTradeFeedback = await Tradefeedback.findOne({ phone });
  if (existingTradeFeedback) {
    return false;
  }

  const tradefeedback1Split = req.body.tradefeedback1.split(':');
  const tradefeedback2Split = req.body.tradefeedback2.split(':');
  const tradefeedback3Split = req.body.tradefeedback3.split(':');
  const tradefeedback4Split = req.body.tradefeedback4.split(':');
  const tradefeedback5Split = req.body.tradefeedback5.split(':');
  const tradefeedback6Split = req.body.tradefeedback6.split(':');
  const tradefeedback7Split = req.body.tradefeedback7.split(':');
  const tradefeedback8Split = req.body.tradefeedback8.split(':');
  const tradefeedback9Split = req.body.tradefeedback9.split(':');
  const tradefeedback10Split = req.body.tradefeedback10.split(':');
  const tradefeedback11Split = req.body.tradefeedback11.split(':');
  const tradefeedback12Split = req.body.tradefeedback12.split(':');
  const user_comment = req.body.comment;

  var tradefeedValue = [
    { question: tradefeedback1Split[0], answer: tradefeedback1Split[1] },
    { question: tradefeedback2Split[0], answer: tradefeedback2Split[1] },
    { question: tradefeedback3Split[0], answer: tradefeedback3Split[1] },
    { question: tradefeedback4Split[0], answer: tradefeedback4Split[1] },
    { question: tradefeedback5Split[0], answer: tradefeedback5Split[1] },
    { question: tradefeedback6Split[0], answer: tradefeedback6Split[1] },
    { question: tradefeedback7Split[0], answer: tradefeedback7Split[1] },
    { question: tradefeedback8Split[0], answer: tradefeedback8Split[1] },
    { question: tradefeedback9Split[0], answer: tradefeedback9Split[1] },
    { question: tradefeedback10Split[0], answer: tradefeedback10Split[1] },
    { question: tradefeedback11Split[0], answer: tradefeedback11Split[1] },
    { question: tradefeedback12Split[0], answer: tradefeedback12Split[1] },
  ];

  tradefeedbackReady = {
    phone: phone,
    tradefeedbacks: tradefeedValue,
    comment: user_comment != '' ? user_comment : '',
  };

  try {
    const newTradeFeedback = new Tradefeedback(tradefeedbackReady);
    let tradeFeedbackResult = await newTradeFeedback.save();
    return true;
  } catch (error) {
    console.log('Something went wrong: Service: tradefeedback', error);
    throw new Error(error);
  }
};

module.exports.tradefeedbacksuiting = async (req) => {
  try {
    var tradefeedbackReady = {};
    const phone = req.body.phone;

    const tradefeedback1Split = req.body.tradefeedback1.split(':');
    const tradefeedback2Split = req.body.tradefeedback2.split(':');
    const tradefeedback3Split = req.body.tradefeedback3.split(':');
    const tradefeedback4Split = req.body.tradefeedback4.split(':');
    const sapphirecomment = req.body.SapphireComment;

    const tradefeedback5Split = req.body.tradefeedback5.split(':');
    const tradefeedback6Split = req.body.tradefeedback6.split(':');
    const tradefeedback7Split = req.body.tradefeedback7.split(':');
    const tradefeedback8Split = req.body.tradefeedback8.split(':');
    const excellencecomment = req.body.ExcellenceComment;

    const tradefeedback9Split = req.body.tradefeedback9.split(':');
    const tradefeedback10Split = req.body.tradefeedback10.split(':');
    const tradefeedback11Split = req.body.tradefeedback11.split(':');
    const tradefeedback12Split = req.body.tradefeedback12;
    const superfinesapphirecomment = req.body.SuperFineSapphireComment;

    const tradefeedback13Split = req.body.tradefeedback13.split(':');
    const tradefeedback14Split = req.body.tradefeedback14.split(':');
    const tradefeedback15Split = req.body.tradefeedback15.split(':');
    const tradefeedback16Split = req.body.tradefeedback16.split(':');
    const dolcevitacomment = req.body.DolceVitacomment;
    const comment = req.body.comment;

    var tradefeedValue = [
      { question: tradefeedback1Split[0], answer: tradefeedback1Split[1] },
      { question: tradefeedback2Split[0], answer: tradefeedback2Split[1] },
      { question: tradefeedback3Split[0], answer: tradefeedback3Split[1] },
      { question: tradefeedback4Split[0], answer: tradefeedback4Split[1] },
      { SapphireComment: sapphirecomment },

      { question: tradefeedback5Split[0], answer: tradefeedback5Split[1] },
      { question: tradefeedback6Split[0], answer: tradefeedback6Split[1] },
      { question: tradefeedback7Split[0], answer: tradefeedback7Split[1] },
      { question: tradefeedback8Split[0], answer: tradefeedback8Split[1] },
      { ExcellenceComment: excellencecomment },

      { question: tradefeedback9Split[0], answer: tradefeedback9Split[1] },
      { question: tradefeedback10Split[0], answer: tradefeedback10Split[1] },
      { question: tradefeedback11Split[0], answer: tradefeedback11Split[1] },
      { question: tradefeedback12Split[0], answer: tradefeedback12Split[1] },
      { SuperFineSapphireComment: superfinesapphirecomment },

      { question: tradefeedback13Split[0], answer: tradefeedback9Split[1] },
      { question: tradefeedback14Split[0], answer: tradefeedback10Split[1] },
      { question: tradefeedback15Split[0], answer: tradefeedback11Split[1] },
      { question: tradefeedback16Split[0], answer: tradefeedback12Split[1] },
      { DolceVitacomment: dolcevitacomment },
    ];

    tradefeedbackReady = {
      phone: phone,
      tradefeedbacks: tradefeedValue,
      comment: comment,
    };

    const newTradeFeedback = new Tradefeedbacksuiting(tradefeedbackReady);
    let tradeFeedbackSuitingResult = await newTradeFeedback.save();
    return tradeFeedbackSuitingResult;
  } catch (error) {
    console.log('Something went wrong: Service: tradefeedback', error);
    throw new Error(error);
  }
};


module.exports.exporttradefeedbacksuiting = async () => {
  let allfeedbackResult;
  let randomnumber = Math.floor(Math.random() * 1000000 + 1);
  let ws = fs.createWriteStream("Exported_Trade_Feedback_Suiting_Data.csv");
  try {
    allfeedbackResult = await Tradefeedbacksuiting.find();
    var size = allfeedbackResult.length;
    if (size <= 0) {
      throw new Error(constants.feedbackMessage.NO_FEEDBACK_FOUND);
    } else if (size >= 1) {
      let jsonData = [];
      for (let i = 0; i < size; i++) {
        let phone = allfeedbackResult[i].phone;
        var comment = allfeedbackResult[i].comment;
        var SapphireComment=allfeedbackResult[i].tradefeedbacks[4].SapphireComment;
        var ExcellenceComment=allfeedbackResult[i].tradefeedbacks[9].ExcellenceComment;
        var SuperFineSapphireComment=allfeedbackResult[i].tradefeedbacks[14].SuperFineSapphireComment;
        var DolceVitacomment=allfeedbackResult[i].tradefeedbacks[19].DolceVitacomment;
        let createdAt = moment(allfeedbackResult[i].createdAt).format(
          "DD-MM-YYYY HH:MM:SS"
        );
        for (let j = 0; j < 16; j++) {
          if(j==4||j==9||j==14||j==19){
            continue;
          }
          let question = allfeedbackResult[i].tradefeedbacks[j].question;
          let answer = allfeedbackResult[i].tradefeedbacks[j].answer;
          var exportobject = {
            Phone: phone,
            Question: question,
            Feedback: answer,
            SapphireComment: SapphireComment,
            ExcellenceComment: ExcellenceComment,
            SuperFineSapphireComment: SuperFineSapphireComment,
            DolceVitacomment: DolceVitacomment,
            Comment: comment,
            Date: createdAt,
          };
          // console.log(exportobject);


          jsonData.push(exportobject);
        }
      }

      fastcsv
        .write(jsonData, { headers: true })
        .on("finish", function () {
          console.log(constants.feedbackMessage.FEEDBACK_FILE_CREATED);
        })
        .pipe(ws);

      var oldPath = "Exported_Trade_Feedback_Suiting_Data.csv";
      var newPath = `downloads/Exported_Trade_Feedback_Suiting_Data_${randomnumber}.csv`;
      fs.rename(oldPath, newPath, function (err) {
        if (err) throw new Error(err);
      });
      const directoryName = process.env.api_base_url;
      const directFileUrl = directoryName + "/" + newPath;

      const fileUrl = { feedbackurl: directFileUrl };
      return fileUrl;
    }
  } catch (error) {
    console.log("Something went wrong", error);
    throw new Error(error);
  }
};


module.exports.gmbfeedback = async (req) => {
  try {
    var gmbfeedbackReady = {};
    var gmbfeedValue=[];
    const gmbfeedback1Split = req.body.gmbfeedback1.split(':');
    const gmbfeedback2Split = req.body.gmbfeedback2.split(':');
    const reason = req.body.gmbfeedback3;
    const comment = req.body.comment;
    if (gmbfeedback2Split[1] == 'yes') {
      gmbfeedValue = [
        { question: gmbfeedback1Split[0], answer: gmbfeedback1Split[1] },
        { question: gmbfeedback2Split[0], answer: gmbfeedback2Split[1],value:reason.toString()},
      ];
    } else if(gmbfeedback2Split[1] == 'no') {
      gmbfeedValue = [
        { question: gmbfeedback1Split[0], answer: gmbfeedback1Split[1] },
        { question: gmbfeedback2Split[0], answer: gmbfeedback2Split[1],value:comment},
      ];
    }

    gmbfeedbackReady = {
      gmbfeedback: gmbfeedValue,
    };

    const newGmbFeedback = new Gmbfeedback(gmbfeedbackReady);
    let gmbFeedbackResult = await newGmbFeedback.save();
    return gmbFeedbackResult;
  } catch (error) {
    console.log('Something went wrong: Service: tradefeedback', error);
    throw new Error(error);
  }
};



module.exports.apparelfeedback = async (req) => {
  try {
    var tradefeedbackReady = {};
  const phone = req.body.phone;

  const tradefeedback1Split = req.body.tradefeedback1.split(':');
  const tradefeedback2Split = req.body.tradefeedback2.split(':');
  const tradefeedback3Split = req.body.tradefeedback3.split(':');
  const tradefeedback4Split = req.body.tradefeedback4.split(':');
  const tradefeedback5Split = req.body.tradefeedback5.split(':');
  const tradefeedback6Split = req.body.tradefeedback6.split(':');
  const tradefeedback7Split = req.body.tradefeedback7.split(':');
  const tradefeedback8Split = req.body.tradefeedback8.split(':');
  const tradefeedback9Split = req.body.tradefeedback9.split(':');
  const tradefeedback10Split = req.body.tradefeedback10.split(':');
  const comment = req.body.comment;

    tradefeedbackReady = {
      phone: phone,
      question1:tradefeedback1Split[0],
      answer1:tradefeedback1Split[1],
      question2:tradefeedback2Split[0],
      answer2:tradefeedback2Split[1],
      question3:tradefeedback3Split[0],
      answer3:tradefeedback3Split[1],
      question4:tradefeedback4Split[0],
      answer4:tradefeedback4Split[1],
      question5:tradefeedback5Split[0],
      answer5:tradefeedback5Split[1],
      question6:tradefeedback6Split[0],
      answer6:tradefeedback6Split[1],
      question7:tradefeedback7Split[0],
      answer7:tradefeedback7Split[1],
      question8:tradefeedback8Split[0],
      answer8:tradefeedback8Split[1],
      question9:tradefeedback9Split[0],
      answer9:tradefeedback9Split[1],
      question10:tradefeedback10Split[0],
      answer10:tradefeedback10Split[1],
      comment: comment,
    };

    const newapparelFeedback = new Apparelfeedback(tradefeedbackReady);
    let newapparelFeedbackResult = await newapparelFeedback.save();
    return newapparelFeedbackResult;
  } catch (error) {
    console.log('Something went wrong: Service: tradefeedback', error);
    throw new Error(error);
  }
};

