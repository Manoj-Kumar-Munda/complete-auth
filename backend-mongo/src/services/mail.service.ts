import nodemailer from "nodemailer";

export async function sendEmail(email: string, subject: string, body: string) {
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
    subject,
    text: body,
  };

  await transport.sendMail(mailOptions);
}
