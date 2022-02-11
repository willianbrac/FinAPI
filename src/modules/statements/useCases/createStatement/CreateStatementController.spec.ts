import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import createConnection from "../../../../database/index";
import { app } from "../../../../app";

let connection: Connection;
describe("Create Statement Controller", () => {
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

  it("should be able to create deposit statement", async () => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      name: "admin",
      email: "admin@email.com",
      password: "root",
    });

    const { token } = responseAuth.body;

    const response = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
        amount: 200,
        description: "Deposit",
    })
    .set({
        Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(200);
  });


  it("should be able to create withdraw statement", async () => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      name: "admin",
      email: "admin@email.com",
      password: "root",
    });

    const { token } = responseAuth.body;

    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
        amount: 100,
        description: "Withdraw",
    })
    .set({
        Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(100);
  });

  it("should be able to create withdraw statement without funds", async () => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      name: "admin",
      email: "admin@email.com",
      password: "root",
    });

    const { token } = responseAuth.body;

    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
        amount: 500,
        description: "Withdraw",
    })
    .set({
        Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(400);
  });
});

