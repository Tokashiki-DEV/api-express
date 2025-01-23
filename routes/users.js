import express from "express";
import { v4 as uuid } from "uuid";
import sql from "../db.js";
const router = express.Router();

var users = [];

router.get("/", async (req, res) => {
  res.send(await sql`SELECT * FROM users.users;`);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const foundUser =
    await sql`SELECT * FROM users.users WHERE userid LIKE ${id}`;
  res.send(foundUser);
});

router.post("/", async (req, res) => {
  const user = req.body;
  const id = uuid();
  users.push({ ...user, id });
  console.log(req.body);
  try {
    await sql`INSERT INTO users.users (userid,firstname,lastname,email)
    VALUES (${id},${user.firstname},${user.lastname},${user.email});`;
    res.send(`${user.firstname} id:${id} foi adicionado`);
  } catch {
    res.send(`Erro ao adicionar o usuario`);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleted =
      await sql`SELECT * FROM users.users WHERE userid LIKE ${id}`;
    if (deleted == "") {
      throw Error();
    }
    await sql`DELETE FROM users.users WHERE userid LIKE ${id}`;
    res.send(`Usuario ${id} deletado`);
  } catch {
    res.send(`Erro`);
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email } = req.body;
  console.log(req.body);
  try {
    const patched =
      await sql`SELECT * FROM users.users WHERE userid LIKE ${id}`;
    if (firstname) patched[0].firstname = firstname;
    if (lastname) patched[0].lastname = lastname;
    if (email) patched[0].email = email;
    await sql`UPDATE users.users SET firstname = ${patched[0].firstname}, lastname = ${patched[0].lastname}, email = ${patched[0].email} 
    WHERE userid LIKE ${id};`;
    res.send(`Usuario ${id} alterado`);
  } catch {
    res.send(`Erro`);
  }
});

export default router;
