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
              GROUP BY users.userid, users.firstname, users.lastname, users.email`
  );
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  res.send(
    await sql`SELECT users.userid, users.firstname, users.lastname, users.email, ARRAY_AGG(phones.phone) AS phones
              FROM users.users
              LEFT JOIN users.phones
              ON users.userid = phones.userid
              WHERE users.userid LIKE ${id}
              GROUP BY users.userid, users.firstname, users.lastname, users.email`
  );
});

router.post("/", async (req, res) => {
  const user = req.body;
  const id = uuid();

  try {
    await sql`INSERT INTO users.users (userid, firstname, lastname, email)
    VALUES(${id}, ${user.firstname}, ${user.lastname}, ${user.email});`;

    res.send(`Usuário ${user.firstname} adicionado com sucesso!`);
  } catch {
    res.send("Erro ao cadastrar o usuário");
  }
});

router.post("/phone/:id", async (req, res) => {
  const { phone } = req.body;
  console.log(phone);
  const { id } = req.params;

  try {
    await sql`INSERT INTO users.phones (userid, phone)
    VALUES(${id}, ${phone});`;

    res.send(`Telefone: ${phone} foi adicionado com sucesso!`);
  } catch {
    res.send("Erro ao cadastrar o telefone");
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const userToBeDeleted =
      await sql`SELECT * FROM users.users WHERE userid LIKE ${id};`;
    if (userToBeDeleted == "") {
      throw Error();
    }
    await sql`DELETE FROM users.users WHERE userid LIKE ${id};`;
    res.send(`${userToBeDeleted[0].firstname} Foi deletado com sucesso!`);
  } catch {
    res.send("Usuário não encontrado");
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email } = req.body;
  try {
    const userToBeChanged =
      await sql`SELECT * FROM users.users WHERE userid LIKE ${id}`;
    if (userToBeChanged == "") {
      throw Error();
    }
    await sql`UPDATE users.users SET firstname = ${firstname}, lastname = ${lastname}, email = ${email} WHERE userid LIKE ${id}`;
    res.send(`As tabelas foram atualizadas`);
  } catch {
    res.send("Erro");
  }
});

export default router;
