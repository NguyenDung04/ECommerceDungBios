import cookieParser from "cookie-parser";
import csrf from "csurf";
import helmet from "helmet";

// // Khởi tạo các middleware
// const csrfProtection = csrf({ cookie: true });

// const secureMiddleware = {
//   cookieParser: cookieParser(),
//   csrfProtection,
//   helmet: helmet()
// };

// export default secureMiddleware;

const noop = (req, res, next) => next(); // middleware rỗng

const secureMiddleware = {
  cookieParser: noop,
  csrfProtection: noop,
  helmet: noop,
};

export default secureMiddleware;
