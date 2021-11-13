import * as jwt from "jsonwebtoken";
import axios from "axios";
import { schedule } from "node-cron";
import { scheduleSchema } from "../models/courseModel";

let JWT_PUBKEY;

async function getLoginKey() {
  JWT_PUBKEY = (await axios.get("https://login.scottylabs.org/login/pubkey")).data;
}

if (!JWT_PUBKEY) {
  getLoginKey();
}

schedule("0 0 * * *", getLoginKey);

export const login = (req, res) => {
  let token = req.body.token;

  if (token) {
    return res.json({
      token,
    });
  } else {
    return res.status(400).send(new Error("No token provided"));
  }
};

export const signRequest = (req, res) => {
  try {
    const loginRequest = jwt.sign(
      {
        redirectUrl: process.env.COURSE_HOST,
        restrictDomain: !process.env.COURSE_HOST.includes("localhost"),
        applicationId: process.env.LOGIN_API_ID,
      },
      process.env.JWT_SECRET || "",
      { algorithm: "RS256", expiresIn: "5 minutes" }
    );
    res.json({ token: loginRequest });
  } catch {
    const loginRequest = jwt.sign(
      {
        redirectUrl: process.env.COURSE_HOST,
        restrictDomain: !process.env.COURSE_HOST.includes("localhost"),
        applicationId: process.env.LOGIN_API_ID,
      },
      process.env.JWT_SECRET || "",
      { algorithm: "HS256", expiresIn: "5 minutes" }
    );
    res.json({ token: loginRequest });
  }
};

export const verifyUserToken = (token, callback, err) => {
  jwt.verify(token, JWT_PUBKEY, { algorithms: ["RS256"] }, (e, payload) => {
    if (e) {
      err(e);
    }
    if (!payload) {
      err(
        "No token present. Did you forget to pass in the token with the API call?"
      );
    }
    if (payload.applicationId !== process.env.LOGIN_API_ID || !payload.email) {
      return err("Bad token");
    }
    callback();
  });
};

export const isUser = (req, res, next) => {
  let token = req.body.token;

  if (process.env.AUTH_ENABLED !== "true") {
    return next();
  }
  verifyUserToken(token, next, (e) => {
    console.log(e);
    return res.status(401).send(e);
  });
};
