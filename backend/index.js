const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const webpush = require("web-push");
const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 4000;
app.get("/", (req, res) => res.send("Hello World!"));
const dummyDb = { subscription: null }; //dummy in memory store
const saveToDatabase = async (subscription) => {
  // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
  // Here you should be writing your db logic to save it.
  dummyDb.subscription = subscription;
};
// The new /save-subscription endpoint
app.post("/save-subscription", async (req, res) => {
  const subscription = req.body;
  console.log("save subscription", subscription);
  await saveToDatabase(subscription); //Method to save the subscription to Database
  res.json({ message: "success" });
});
const vapidKeys = {
  publicKey:
    "BKNMV1-vx2x5t3KutZzBJnZDl5Z_2UIxhi1UfdAw8HLg2f9mJAepjlRfoCN40lqCIFcrTrOBqEsO-GJSZA7q91Q",
  privateKey: "Fc8pn1fM_1dBw7dqpAHGrEUIHooXpT-6JEbPwOY1ZpE",
};
//setting our previously generated VAPID keys
webpush.setVapidDetails(
  "mailto:agranzot@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
//function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend) => {
  webpush.sendNotification(subscription, dataToSend);
};
//route to test send notification
app.get("/send-notification", (req, res) => {
  const subscription = dummyDb.subscription; //get subscription from your databse here.
  const message = "Hello World";
  sendNotification(subscription, message);
  res.json({ message: "message sent" });
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
