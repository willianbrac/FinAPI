import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AppError } from "../../../../shared/errors/AppError";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";
import { hash } from "bcryptjs";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
        name: "Daniel",
        email: "daniel@email.com",
        password: await hash("1010",8),
    };

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");
  });

  it("should not be able to authenticate an nonexists user ", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "none@email.com",
        password: "notpass",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate with incorrect password", async () => {
    const user: ICreateUserDTO = {
        name: "Alisson",
        email: "som@email.com",
        password: await hash("Oisom", 8),
    };

    await createUserUseCase.execute(user);

    await expect(
        authenticateUserUseCase.execute({
            email: user.email,
            password: "incorrectPassword",
        })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with incorrect email", async () => {
    const user: ICreateUserDTO = {
        name: "joãozinho",
        email: "jao@email.com",
        password: await hash("jjjj", 8),
    };

    await createUserUseCase.execute(user);

    await expect(
        authenticateUserUseCase.execute({
            email: "jão@gmail.com",
            password: user.password,
        })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
