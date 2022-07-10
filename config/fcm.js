var admin = require("firebase-admin");

var serviceAccount = require("../gonggangam-f2086-firebase-adminsdk-hw07b-66d59423da.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://gonggangam-f2086-default-rtdb.firebaseio.com"
});
