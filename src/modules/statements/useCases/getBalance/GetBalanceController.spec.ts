import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import createConnection from "../../../../database/index";
import { app } from "../../../../app";

let connection: Connection;
describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("root", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@email.com', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance", async () => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      name: "admin",
      email: "admin@email.com",
      password: "root",
    });

    const { token } = responseAuth.body;

    const deposit1 = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
        amount: 220,
        description: "Deposit",
    })
    .set({
        Authorization: `Bearer ${token}`,
    });

    const deposit2 = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
        amount: 110,
        description: "Deposit",
    })
    .set({
        Authorization: `Bearer ${token}`,
    });

    const withdraw1 = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
        amount: 30,
        description: "withdraw",
    })
    .set({
        Authorization: `Bearer ${token}`,
    });

    const response = await request(app)
    .get("/api/v1/statements/balance")
    .send()
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body.statement[0].id).toBe(deposit1.body.id);
    expect(response.body.statement[1].id).toBe(deposit2.body.id);
    expect(response.body.statement[2].id).toBe(withdraw1.body.id);
  });
});
