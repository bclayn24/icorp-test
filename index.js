import axios from "axios";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  startMainProcess();
});

app.use(express.json());

let secondPart = null;
let resolver = null;

app.post("/get/second/part", (req, res) => {
  secondPart = req.body.part2 || req.body;
  if (resolver) resolver(secondPart);

  res.status(200).json({ success: true, message: "Вторая часть получена" });
});

app.get("/get/second/part", (_, res) => {
  res.status(200).json({ part2: secondPart, received: secondPart !== null });
});

function waitForSecondPart(timeout = 60000) {
  return new Promise((resolve, reject) => {
    if (secondPart !== null) return resolve(secondPart);
    resolver = resolve;
    setTimeout(() => {
      if (secondPart === null) reject(new Error("Вторая часть не получена"));
    }, timeout);
  });
}

async function startMainProcess() {
  try {
    const WEBHOOK_URL = "";
    const response = await axios.post("https://test.icorp.uz/interview.php", {
      msg: "Requesting code parts",
      url: WEBHOOK_URL,
    });
    const firstPart = response.data.part1;
    secondPart = await waitForSecondPart();

    const fullCode = firstPart + secondPart;
    const finalResponse = await axios.get(
      "https://test.icorp.uz/interview.php",
      {
        params: { code: fullCode },
      }
    );

    console.log("Финальное сообщение: ", finalResponse.data);
    console.log("Объединенный ключ: ", fullCode);
    setTimeout(() => {
      server.close();
      process.exit(0);
    }, 2000);
  } catch (err) {
    console.error("Ошибка:", err);
    if (err.response) console.error(err.response.data);
    server.close();
    process.exit(1);
  }
}
