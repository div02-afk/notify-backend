import cors from "cors";
import { config } from "dotenv";
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

config();
const app = express();
app.use(cors());
app.use(express.json());

const usersFilePath = path.join(__dirname, "users.json");

const readUsersFromFile = (): { [email: string]: string } => {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, "{}");
    return {};
  }
  return JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));
};

const writeUsersToFile = (users: { [email: string]: string }) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

app.post("/send", async (req: Request, res: Response) => {
  try {
    const { email, title, body } = req.body;
    let users = readUsersFromFile();

    if (!users[email]) {
      res.status(400).json({ message: "User not registered" });
      return;
    }
    if (!body) {
      res.status(400).json({ message: "Body is required" });
      return;
    }

    const response = await fetch(
      `https://api.pushy.me/push?api_key=${process.env.PUSHY_SECRET}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: users[email],
          data: { message: body },
          notification: { title, body },
        }),
      }
    );

    if (!response.ok) {
      res.status(500).json({ message: "Failed to send notification" });
      return;
    }

    res.status(200).json({ message: "Notification sent" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
    return;
  }
});

app.post("/register", (req: Request, res: Response) => {
  const { email, deviceToken }: { email: string; deviceToken: string } =
    req.body;
  let users = readUsersFromFile();
  users[email] = deviceToken;
  writeUsersToFile(users);
  res.status(200).json({ message: "User registered" });
  return;
});

app.listen(4000, () => {
  console.log("Server started on http://localhost:4000");
});