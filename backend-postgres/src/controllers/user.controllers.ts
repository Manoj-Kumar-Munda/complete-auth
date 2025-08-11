import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const registerUser = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  try {
    if (!email || !password || !username) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password,
        username,
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

export { registerUser };
