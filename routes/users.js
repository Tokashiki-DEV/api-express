import express, { response } from "express";
import { v4 as uuid } from "uuid";
import sql from "../db.js";
import axios from "axios";
const router = express.Router();

async function ceprequest(cep) {
  try {
    const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    return data;
  } catch (error) {
    console.log(error);
  }
}

router.get("/", async (req, res) => {
  res.send(
    await sql`SELECT users.userid, users.firstname, users.lastname, users.email, JSON_AGG(JSON_BUILD_OBJECT ('id',phones.id,'phone',phones.phone)) AS phones,
    JSON_AGG(JSON_BUILD_OBJECT('cep',address.cep ,'uf',address.uf, 'localidade',address.localidade,'logradouro',address.logradouro,'bairro',address.bairro,'numero',address.numcasa)) AS address
    FROM users.users
    LEFT JOIN users.phones
    ON users.userid = phones.userid
    LEFT JOIN users.address
    ON users.userid = address.userid 
    GROUP BY users.userid, users.firstname, users.lastname, users.email;`
  );
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const foundUser =
    await sql`SELECT users.userid, users.firstname, users.lastname, users.email, ARRAY_AGG(DISTINCT phones.phone) AS phones ,
    JSON_AGG(JSON_BUILD_OBJECT('cep',address.cep ,'uf',address.uf, 'localidade',address.localidade,'logradouro',address.logradouro,'bairro',address.bairro,'numero',address.numcasa)) AS address
    FROM users.users 
    LEFT JOIN users.phones 
    ON users.userid = phones.userid
    LEFT JOIN users.address
    ON users.userid = address.userid
    WHERE users.userid LIKE ${id} GROUP BY users.userid, users.firstname, users.lastname, users.email`;
  res.send(foundUser);
});

router.post("/", async (req, res) => {
  const user = req.body;
  const id = uuid();
  try {
    await sql`INSERT INTO users.users (userid,firstname,lastname,email)
    VALUES (${id},${user.firstname},${user.lastname},${user.email});`;
    if (user.phone != undefined) {
      await sql`INSERT INTO users.phones (userid,phone)
      VALUES (${id},${user.phone});`;
    }
    if (user.cep != undefined && user.numcasa != undefined) {
      const response = await ceprequest(user.cep);
      await sql`INSERT INTO users.address (userid,cep,estado,uf,localidade,bairro,logradouro,numcasa)
      VALUES(${id},
      ${user.cep},
      ${response.estado},
      ${response.uf},
      ${response.localidade},
      ${response.bairro},
      ${response.logradouro},
      ${user.numcasa})`;
    }
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

router.post("/address/:id", async (req, res) => {
  const { id } = req.params;
  const address = req.body;
  if (address.cep != undefined && address.numcasa != undefined) {
    const response = await ceprequest(address.cep);
    await sql`INSERT INTO users.address (userid,cep,estado,uf,localidade,bairro,logradouro,numcasa)
    VALUES(${id},
    ${address.cep},
    ${response.estado},
    ${response.uf},
    ${response.localidade},
    ${response.bairro},
    ${response.logradouro},
    ${address.numcasa})`;
  }
  res.send(`O endereço ${address.cep} foi adicionado`);
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

router.patch("/phones/:id", async (req, res) => {
  const { id } = req.params;
  const phones = req.body;
  try {
    const patched =
      await sql`SELECT * FROM users.phones WHERE userid = ${id} AND id = ${phones.id}`;
    if (phones != undefined) {
      patched[0] = phones.numbers;
      await sql`UPDATE users.phones SET phone = ${patched[0]} WHERE userid = ${id} AND id = ${phones.id};`;
      res.send(`atualizado`);
    }
  } catch {
    res.send(`Erro`);
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, cep, numcasa } = req.body;
  try {
    const patched =
      await sql`SELECT * FROM users.users WHERE userid LIKE ${id}`;
    if (firstname) patched[0].firstname = firstname;
    if (lastname) patched[0].lastname = lastname;
    if (email) patched[0].email = email;
    await sql`UPDATE users.users SET 
    firstname = ${patched[0].firstname}, 
    lastname = ${patched[0].lastname}, 
    email = ${patched[0].email},
    WHERE userid LIKE ${id};`;
  } catch {
    res.send(`Erro`);
  }
});

export default router;
