import express from "express";
import cors from "cors";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
config();
const app = express();
app.use(cors());
app.use(express.json());
const usersFilePath = path.join(__dirname, "users.json");

const readUsersFromFile = () => {
  if (!fs.existsSync(usersFilePath)) {
    return {};
  }
  const fileData = fs.readFileSync(usersFilePath, "utf-8");
  return JSON.parse(fileData);
};

const writeUsersToFile = (users: { [email: string]: string }) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

app.post("/send", async (req, res) => {
  const { email, title, body } = req.body;
  let users = readUsersFromFile();
  if (!users[email]) {
    res.status(400).json({ message: "User not registered" });
  }
  if (!body) {
    res.status(400).json({ message: "Body is required" });
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
        data: {
          message: body,
        },
        notification: {
          title: title,
          body: body,
        },
      }),
    }
  );
  if (response.status !== 200) {
    res.status(500).json({ message: "Failed to send notification  " });
  }
  res.status(200).json({ message: "Notification sent" });
});

app.post("/register", (req, res) => {
  const { email, deviceToken }: { email: string; deviceToken: string } =
    req.body;
  let users = readUsersFromFile();
  users[email] = deviceToken;
  writeUsersToFile(users);
  res.status(200).json({ message: "User registered" });
});

app.listen(4000, () => {
  console.log("Server started on http://localhost:3000");
});
