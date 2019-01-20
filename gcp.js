"use strict"

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('superagent');

const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

const sharp = require('sharp');
const lineSegAlg = require('./ocr/line-seg-alg');

module.exports = function(app) {
  app.use(bodyParser.raw({limit: "100Mb"}));
  app.post('/api/image', async (req, res) => {
    let file = await sharp(req.body)
      .normalise()
      .toBuffer();

    const [result] = await client.textDetection(file);
    const detections = result.textAnnotations;
    const textLines = await lineSegAlg.initLineSegmentation(result);

    const receiptItems = textLines.filter(line => /[£|$|€]\d+.\d\d/.test(line));
    console.log(receiptItems);

    //TODO finish up formatting
    const formattedStrings = [];
    receiptItems.forEach(item => {
      console.log(item);
      const itemMatches = item.match(/([A-Z]+(\s?[A-Z]+?)*)\s*([£|$|€]\d+.\d\d)/);
      formattedStrings.push({
        name: itemMatches[0],
        price: itemMatches[2]
      });
    });
    console.log(formattedStrings);

    res.status(200).send(formattedStrings);
  });
}
