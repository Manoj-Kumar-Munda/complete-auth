import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, verificationToken: string) {
  const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER!,
      pass: process.env.MAIL_PASS!,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER!,
    to: email,
    subject: "Verify your email",
    text: `Please verify your email by clicking on the following link: ${process.env.CORS_ORIGIN}/api/v1/users/verify/token/${verificationToken}`,
  };

  await transport.sendMail(mailOptions);
}
