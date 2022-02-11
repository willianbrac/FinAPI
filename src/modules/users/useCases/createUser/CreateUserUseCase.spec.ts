import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { CreateUserError } from "./CreateUserError";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
        name: "Bruna",
        email: "bruna@email.com",
        password: "12345"
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a user with existing email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Bia",
        email: "bia@email.com",
        password: "1212"
      });

      await createUserUseCase.execute({
        name: "Janaina",
        email: "bia@email.com",
        password: "2121"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
