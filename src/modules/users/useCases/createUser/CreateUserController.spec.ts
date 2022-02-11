import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database/index";
import { app } from "../../../../app";


let connection: Connection;
describe("Create user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create an user", async () => {
    const response = await request(app).post("/api/v1/users/").send({
      name: "Maria",
      email: "maria@email.com",
      password: await hash("Maria123", 8),
    });
    expect(response.status).toBe(201);
  });
});
