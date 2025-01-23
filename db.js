import Postgres from "postgres";

const sql = new Postgres({
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "db1",
});

export default sql;
