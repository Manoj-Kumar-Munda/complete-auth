import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { sendEmail } from "../services/email.services";
import { generateRandomString } from "../utils/helpers";

const prisma = new PrismaClient();

const registerUser = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  try {
    if (!email || !password || !username) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    //send verification mail
    const verificationToken = generateRandomString();
    const subject = "Verify your email";
    const body = `Please verify your email by clicking on the following link: ${process.env.CORS_ORIGIN}/api/v1/users/verify/${verificationToken}`;
    await sendEmail(email, subject, body);

    const user = await prisma.user.create({
      data: {
        email,
        password,
        username,
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    if (!user) {
      return res.status(500).json({ error: "User registration failed" });
    }

    res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const verifyUser = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token.trim()) {
      return res.status(400).json({ error: "Invalid token" });
    }

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export { registerUser, verifyUser };
