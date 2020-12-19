const { existsSync, writeFileSync } = require("fs");
const { join } = require("path");
const webpush = require("web-push");
const SERVER_KEYS_FILENAME = join(__dirname, "vapid-keys.json");

if (!existsSync(SERVER_KEYS_FILENAME)) {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  readline.question("Your email address ", (email) => {
    if (email.trim().length === 0) {
      console.log("Please provide an email address");
      readline.close();
      return;
    }
    const vapidKeys = {
      email,
      ...webpush.generateVAPIDKeys(),
    };
    writeFileSync(SERVER_KEYS_FILENAME, JSON.stringify(vapidKeys));
    readline.close();
  });
} else {
  console.log(
    "VAPID keys already exist. To generate new ones delete " +
      SERVER_KEYS_FILENAME
  );
}
