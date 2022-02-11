import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { AppError } from "../../../../shared/errors/AppError";

let usersRepository: IUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("should be able to list user by id", async () => {
    const user = await usersRepository.create({
        name: "Bruna",
        email: "bruna@email.com",
        password: "12345"
    });

    const response = await showUserProfileUseCase.execute(user.id as string);
    expect(response).toBe(user);
  });

  it("should not be able to show a non-existent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("N0N3x1s7s");
    }).rejects.toBeInstanceOf(AppError);
  });
});
