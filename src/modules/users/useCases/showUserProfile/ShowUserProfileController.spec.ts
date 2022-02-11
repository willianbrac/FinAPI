import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import createConnection from "../../../../database/index";
import { app } from "../../../../app";


let connection: Connection;
describe("Show User Profile Controller", () => {
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

  it("should be able to show the user profile", async () => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: "admin@email.com",
      password: "root",
    });

    const { token } = responseAuth.body;

    const response = await request(app).get("/api/v1/profile").send().set({
      authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("admin");
    expect(response.body.email).toBe("admin@email.com");
  });
});


