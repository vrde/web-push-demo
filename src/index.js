const { existsSync, readFileSync, writeFileSync } = require("fs");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const webpush = require("web-push");

/**
 * Push notifications
 */
const vapidKeys = require("./vapid-keys.json");

webpush.setVapidDetails(
  "mailto:" + vapidKeys.email,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function sendNotifications(subscriptions, dataToSend) {
  for (let subscription of subscriptions) {
    console.log("Send notification", subscription);
    try {
      await webpush.sendNotification(subscription, dataToSend);
    } catch (e) {
      if (e.statusCode === 410) {
        console.log("Subscription no longer valid");
        deleteSubscription(subscription);
      } else {
        console.log(e);
      }
    }
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

function deleteSubscription(subscription) {
  const db = JSON.parse(readFileSync(dbFilename));
  db.subscriptions = db.subscriptions.filter(
    (s) => s.endpoint !== subscription.endpoint
  );
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
const port = 4000;

app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());

app.get("/api/vapid-key", (req, res) => {
  return res.send(vapidKeys.publicKey);
});

app.post("/api/save-subscription", async (req, res) => {
  const subscription = req.body;
  console.log("Save new subscription", subscription);
  await insertSubscription(subscription);
  res.json({ message: "success" });
});

app.get("/api/send-notification", (req, res) => {
  const message = "Hello World";
  const subscriptions = getAllSubscriptions();
  sendNotifications(subscriptions, message);
  res.json({ message: "message sent" });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
