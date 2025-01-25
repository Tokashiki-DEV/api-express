import express from "express";
import { v4 as uuid } from "uuid";
import sql from "../db.js";
const router = express.Router();

router.get("/", async (req, res) => {
  res.send(
    await sql`SELECT users.userid, users.firstname, users.lastname, users.email, ARRAY_AGG(phones.phone) AS phones 
    FROM users.users 
    LEFT JOIN users.phones 
    ON users.userid = phones.userid
    GROUP BY users.userid, users.firstname, users.lastname, users.email;`
  );
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const foundUser =
    await sql`SELECT users.userid, users.firstname, users.lastname, users.email, ARRAY_AGG(phones.phone) AS phones
    FROM users.users 
    JOIN users.phones 
    ON users.userid = phones.userid 
    WHERE users.userid LIKE ${id} GROUP BY users.userid, users.firstname, users.lastname, users.email`;
  res.send(foundUser);
});

router.post("/", async (req, res) => {
  const user = req.body;
  const id = uuid();
  console.log(user.phone);
  try {
    await sql`INSERT INTO users.users (userid,firstname,lastname,email)
    VALUES (${id},${user.firstname},${user.lastname},${user.email});`;
    await sql`INSERT INTO users.phones (userid,phone)
    VALUES (${id},${user.phone});`;
    res.send(`${user.firstname} id:${id} foi adicionado`);
  } catch {
    res.send(`Erro ao adicionar o usuario`);
  }
});

router.post("/phone/:id", async (req, res) => {
  const { id } = req.params;
  const { phone } = req.body;
  await sql`INSERT INTO users.phones (userid,phone) 
  VALUES (${id}, ${phone})`;
  res.send(`O telefone ${phone} foi adicionado`);
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
  const { firstname, lastname, email, phone } = req.body;
  try {
    const patched =
      await sql`SELECT * FROM users.users WHERE userid LIKE ${id}`;
    if (firstname) patched[0].firstname = firstname;
    if (lastname) patched[0].lastname = lastname;
    if (email) patched[0].email = email;
    if (phone) patched[0].phone = phone;
    await sql`UPDATE users.users SET firstname = ${patched[0].firstname}, lastname = ${patched[0].lastname}, email = ${patched[0].email}
    WHERE userid LIKE ${id};`;
    await sql`UPDATE users.phones SET phone = ${phone} 
    WHERE userid LIKE ${id}`;
    res.send(`Usuario ${id} alterado`);
  } catch {
    res.send(`Erro`);
  }
});

export default router;
