import express, { response } from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  console.log("Novo acesso");
  res.send("Bem vindo");
});

app.listen(PORT, () => console.log(`ta funfano  http://localhost:${PORT}`));
