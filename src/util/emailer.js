import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("Lỗi kết nối SMTP:", error);
  } else {
    console.log("SMTP sẵn sàng gửi mail!");
  }
});

export const sendMail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"DungBios Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
