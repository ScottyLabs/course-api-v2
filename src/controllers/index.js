import { getCourses, getCourseWithID } from "./courseController.js";
import { getCourseInfo, getFilteredCourses, getCourses as getCourseToolCourses } from "./courseToolController.js";
import { getFCEWithID, getFCEs } from "./fceController.js";
import { getSchedules } from "./scheduleController.js";
import { getProfs } from "./professorController.js";
import path from "path";
import { login, isUser, signRequest } from "./userController.js";

const routes = (app) => {
  app.route("/courses").get(getCourses);

  app.route("/courses/courseID/:courseID").get(getCourseWithID);

  app.route("/courseTool").get(getFilteredCourses);
  app.route("/courseTool").post(isUser, getFilteredCourses);
  app.route("/courseTool/courses").get(getCourseToolCourses);
  app.route("/courseTool/courses").post(isUser, getCourseToolCourses);
  
  app.route("/courseTool/courseID/:courseID").get(getCourseInfo);

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
  })

  app.route("/professors").get(getProfs);
};

export default routes;
