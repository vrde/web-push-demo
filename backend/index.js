const { existsSync, readFileSync, writeFileSync } = require("fs");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const webpush = require("web-push");

/**
 * Push notifications
 */
const vapidKeys = {
  publicKey:
    "BKNMV1-vx2x5t3KutZzBJnZDl5Z_2UIxhi1UfdAw8HLg2f9mJAepjlRfoCN40lqCIFcrTrOBqEsO-GJSZA7q91Q",
  privateKey: "Fc8pn1fM_1dBw7dqpAHGrEUIHooXpT-6JEbPwOY1ZpE",
};

webpush.setVapidDetails(
  "mailto:agranzot@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function sendNotifications(subscriptions, dataToSend) {
  for (let subscription of subscriptions) {
    console.log("Send notification", subscription);
    await webpush.sendNotification(subscription, dataToSend);
  }
}

/**
 * Database
 */

const dbFilename = "db.json";

if (!existsSync(dbFilename)) {
  writeFileSync(dbFilename, JSON.stringify({ subscriptions: [] }));
}

function insertSubscription(subscription) {
  const db = JSON.parse(readFileSync(dbFilename));
  db.subscriptions.push(subscription);
  writeFileSync(dbFilename, JSON.stringify(db));
}

function getAllSubscriptions() {
  const db = JSON.parse(readFileSync(dbFilename));
  return db.subscriptions;
}

/**
 * API endpoints
 */
const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 4000;

app.get("/", (req, res) => res.send("Hello World!"));

app.post("/save-subscription", async (req, res) => {
  const subscription = req.body;
  console.log("Save new subscription", subscription);
  await insertSubscription(subscription);
  res.json({ message: "success" });
});

app.get("/send-notification", (req, res) => {
  const subscription = dummyDb.subscription;
  const message = "Hello World";
  const subscriptions = getAllSubscriptions();
  sendNotifications(subscriptions, message);
  res.json({ message: "message sent" });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
