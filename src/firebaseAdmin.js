const admin = require("../stockmarket-123-firebase-adminsdk-fbsvc-fcad7a12af.json"); // Import Firebase Admin SDK

async function checkUserRole(uid) {
  const user = await admin.auth().getUser(uid);
  console.log("Custom Claims:", user.customClaims);
}

checkUserRole("USER_FIREBASE_UID"); // Replace with actual UID


import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

admin.initializeApp();

const corsHandler = cors({ origin: true }); // ✅ Allows all origins

export const myFunction = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    res.status(200).json({ message: "CORS fixed!" });
  });
});
