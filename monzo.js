"use strict"

const express = require('express');
const app = express();
const request = require('superagent')

// Monzo API Keys
const MONZO_USER_ID = process.env.MONZO_USER_ID;
const MONZO_ACCOUNT_ID = process.env.MONZO_ACCOUNT_ID;
const MONZO_ACCESS_TOKEN = process.env.MONZO_ACCESS_TOKEN;

module.exports = function(app) {
  app.get('/api/monzo/receipt', async (req, res) => {
    let lastTransaction;
    await request
      .get(`https://api.monzo.com/transactions?account_id=${MONZO_ACCOUNT_ID}`)
      .set("Authorization", `Bearer ${MONZO_ACCESS_TOKEN}`)
      .then(res => {
        lastTransaction = res.body.transactions.slice(-1)[0];
      })
      .catch(err => console.log(err));
    const testReceipt = {
      transaction_id: lastTransaction.id,
      external_id: "testing",
      total: lastTransaction.amount,
      currency: lastTransaction.currency,
      items: [
        {
          description: "Bananas, 70p per kg",
          quantity: 18.56,
          unit: "kg",
          amount: 70,
          currency: "GBP"
        }
      ]
    }
    const reqs = await request
      .put(`https://api.monzo.com/transaction-receipts?account_id=${MONZO_ACCOUNT_ID}`)
      .set('Content-Type', 'application/json')
      .set("Authorization", `Bearer ${MONZO_ACCESS_TOKEN}`)
      .send(testReceipt)
      .then(res => {
        console.log(res.body);
      })
      .catch(err => console.log(err));
    res.status(200).send(`OK ${lastTransaction.id}`);
  });
}
