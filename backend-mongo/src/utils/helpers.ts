import crypto from "crypto";
export const generateRandomString = () => {
  return crypto.randomBytes(32).toString("hex");
};
