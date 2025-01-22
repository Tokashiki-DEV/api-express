import express from "express";
import { v4 as uuid } from "uuid";
const router = express.Router();

var users = [];

router.get("/", (req, res) => {
  res.send(users);
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const foundUser = users.find((user) => user.id === id);
  res.send(foundUser);
});

router.post("/", (req, res) => {
  const user = req.body;
  const id = uuid();
  users.push({ ...user, id });
  res.send(`${user.first_name} foi adicionado, id: ${id}`);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const deleteduser = users.find((user) => user.id === id);
  users = users.filter((user) => user.id !== id);
  res.send(`${deleteduser.first_name} deletado, id:${id}`);
});

router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email } = req.body;
  const user = users.find((user) => user.id === id);

  if (first_name) user.first_name = first_name;
  if (last_name) user.last_name = last_name;
  if (email) user.email = email;

  res.send(`${first_name}, id: ${id} foi atualizado`);
});

export default router;
