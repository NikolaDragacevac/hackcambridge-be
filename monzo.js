"use strict"

const express = require('express');
const app = express();
const request = require('superagent');
const bodyParser = require('body-parser');

// Monzo API Keys
const MONZO_ACCOUNT_ID = process.env.MONZO_ACCOUNT_ID;
const MONZO_ACCESS_TOKEN = process.env.MONZO_ACCESS_TOKEN;

module.exports = function(app) {
  app.use(bodyParser.json());
  app.post('/api/monzo/receipt', async (req, res) => {
    const unformattedMonzoData = req.body;
    console.log(unformattedMonzoData);
    let lastTransaction;
    await request
      .get(`https://api.monzo.com/transactions?account_id=${MONZO_ACCOUNT_ID}`)
      .set("Authorization", `Bearer ${MONZO_ACCESS_TOKEN}`)
      .then(res => {
        lastTransaction = res.body.transactions.slice(-1)[0];
      })
      .catch(err => {
        console.log(err);
        res.status(400).send("Bad Request");
      });
    const formattedMonzoData = [];
    unformattedMonzoData.forEach(item => {
      formattedMonzoData.push({
        description: item.name,
        quantity: 1,
        amount: Math.round(parseFloat((item.price).substr(1)) * 100),
        currency: "GBP"
      });
    });
    const testReceipt = {
      transaction_id: lastTransaction.id,
      external_id: "testing",
      total: lastTransaction.amount * -1,
      currency: "GBP",
      items: formattedMonzoData
    }
    const reqs = await request
      .put(`https://api.monzo.com/transaction-receipts?account_id=${MONZO_ACCOUNT_ID}`)
      .set('Content-Type', 'application/json')
      .set("Authorization", `Bearer ${MONZO_ACCESS_TOKEN}`)
      .send(testReceipt)
      .catch(err => {
        console.log(err);
        res.status(400).send("Bad Request");
      });
    res.status(200).send(`OK ${lastTransaction.id}`);
  });
}
