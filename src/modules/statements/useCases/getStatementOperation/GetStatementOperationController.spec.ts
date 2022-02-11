import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import createConnection from "../../../../database/index";
import { app } from "../../../../app";

let connection: Connection;
describe("Get Statement Operation", () => {
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

  it("should be able to get the statement", async () => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
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

    const response = await request(app)
    .get(`/api/v1/statements/${deposit1.body.id}`)
    .send()
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(deposit1.body.id);
  });

  it("should not be able to get the statement from a nonexistent id", async () => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: "admin@email.com",
      password: "root",
    });

    const { token } = responseAuth.body;

    const response = await request(app)
      .get(`/api/v1/statements/855734b0-6423-11ec-90d6-0242ac120003`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
