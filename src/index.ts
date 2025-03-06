import express from "express";
import cors from "cors";
import {config} from "dotenv";
config();
const app = express();
app.use(cors());
app.use(express.json());
const users:{
    [email: string]: string
} = {};
app.post("/send", async (req, res) => {
  const { email, title, body } = req.body;
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
          message: "Hello, World!",
        },
        notification: {
          title: title,
          body: body,
        },
      }),
    }
  );
  console.log(response);
  res.status(200).json({ message: "Notification sent" });
});

app.post("/register", (req, res) => {
  const { email, deviceToken }: { email: string; deviceToken: string } =
    req.body;
  users[email] = deviceToken;
  res.status(200).json({ message: "User registered" });
});

app.listen(4000, () => {
  console.log("Server started on http://localhost:3000");
});
