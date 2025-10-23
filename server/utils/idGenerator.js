import crypto from "crypto";

export const generateRoomId = (length = 6) => {
  const randomId = crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);

  const prefix = "HANGOUT-";
  return prefix + randomId;
};
