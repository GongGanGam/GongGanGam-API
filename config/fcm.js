var admin = require("firebase-admin");

var serviceAccount = require("./gonggangam-f2086-firebase-adminsdk-hw07b-3ef2e5c277.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://gonggangam-5ae27-default-rtdb.asia-southeast1.firebasedatabase.app"
});
