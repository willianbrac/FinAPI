import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import createConnection from "../../../../database/index";
import { app } from "../../../../app";


let connection: Connection;
describe("Authenticate User Controller", () => {
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

  it("should be able to authenticate an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@email.com",
      password: "root",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a wrong email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "error@email.com",
      password: "root",
    });
    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate a wrong password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@email.com",
      password: "incorrect",
    });
    expect(response.status).toBe(401);
  });
});
