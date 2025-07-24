import dotenv from "dotenv";
dotenv.config();

import path from "path";
import express from "express";
import morgan from "morgan";
import { engine } from "express-handlebars";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import session from "express-session";
import passport from "passport";
import secure from "./middleware/secure.js";

import connectDB from "./config/db/index.js";
import "./config/passport.js";
import setGlobalVariables from "./middleware/localVariables.js";
import route from "./routes/index.js";

connectDB();

const app = express();
const port = 3000;

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Logger (tuỳ chọn)
// app.use(morgan('dev'));

// Template engine: handlebars
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    partialsDir: [
      path.join(__dirname, "resources", "views", "admin", "layouts"),
      path.join(__dirname, "resources", "views", "partials"),
    ],
    helpers: {
      inc: (value) => parseInt(value) + 1,
      eq: (a, b) => a === b,
      not: (v) => !v,
      and: (...args) => args.slice(0, -1).every(Boolean),
      or: (...args) => args.slice(0, -1).some(Boolean),
      formatVND: function (value) {
        if (typeof value !== "number") return value;
        return value.toLocaleString("vi-VN") + " ₫";
      },
    },
  }),
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

// ✅ Session setup (đặt TRƯỚC passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 2 * 60 * 60 * 1000,
    },
  }),
);

// ✅ Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ Biến toàn cục (req.user, v.v...)
app.use(setGlobalVariables);

// ✅ Security middlewares
app.use(secure.cookieParser);
app.use(secure.helmet);
app.use(secure.csrfProtection);

// ✅ Routing
route(app);

// ✅ Khởi chạy server
app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});
