const express = require('express');
const multer = require('multer');
const request = require('superagent');

const upload = multer();
const app = express();
const port = 3000;

const postURL = "https://uksouth.api.cognitive.microsoft.com/vision/v1.0/ocr";
const subscriptionId = process.env.SUBKEY;
console.log(process.env.SUBKEY);

app.post('/', upload.any(), async function(req, res){

  let servedrequest;

  await request
    .post(postURL)
    .set("Host","uksouth.api.cognitive.microsoft.com")
    .set("Content-type","application/octet-stream")
    .set("Ocp-Apim-Subscription-Key", subscriptionId)
    .send(req.files[0].buffer)
    .then(res => {
      //console.log(res.body);
      //console.log(res.body.regions[0].lines);
      servedrequest = res.body;
    })
    .catch(err => console.log(err));

 var textarray = [];

  servedrequest.regions.forEach(region => {
    region.lines.forEach(line => {
      line.words.forEach(word => {
        console.log(word.text);
        textarray.push(word.text);
      });
    });
  });

  var refinedarray = [];

  textarray.forEach(element => {
    if (element.startsWith("*") || element.startsWith("£") || element.startsWith("€")){
      refinedarray.push(element);
    }
  });

  console.log(refinedarray);

  res.status(200).send("OK");

});
app.listen(port, () => console.log(`App listening on port ${port}`));
