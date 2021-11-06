import { getCourses, getCourseWithID } from "./courseController.js";
import { getFCEWithID, getFCEs } from "./fceController.js";
import { getSchedules } from "./scheduleController.js";
import path from "path";
import { login, isUser, signRequest } from "./userController.js";

const routes = (app) => {
  app.route("/courses").get(getCourses);

  app.route("/courses/courseID/:courseID").get(getCourseWithID);

  app.route("/schedules").get(getSchedules);

  app.route("/info").get((req, res) => {
    res.send({ message: "200" });
  });

  app.route("/fces").post(isUser, getFCEs);

  app.route("/fces/courseID/:courseID").post(isUser, getFCEWithID);

  app.route("/auth/login").post(login);
  app.route("/auth/signRequest").get(signRequest);

  app.route("/swagger").get((req, res) => {
    res.sendFile(path.resolve("./swagger.json"));
  });
};

export default routes;
