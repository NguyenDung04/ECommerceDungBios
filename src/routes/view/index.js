// routes/view/index.js
import siteRouter from "./site.js";
// import courseRouter from './course.js';
import authRouter from "./auth.js";
import adminRouter from "./admin/index.js";

function viewRoutes(app) {
  app.use("/auth", authRouter);
  app.use("/admin", adminRouter);
  // app.use('/course', courseRouter);
  app.use("/", siteRouter); // site để cuối tránh override
}

export default viewRoutes;
