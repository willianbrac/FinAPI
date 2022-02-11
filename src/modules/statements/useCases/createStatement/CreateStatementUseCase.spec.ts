import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../../entities/Statement";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";

import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { hash } from "bcryptjs";

let createStatementUseCase: CreateStatementUseCase;
let statementsRepository: IStatementsRepository;
let usersRepository: IUsersRepository;

describe("Create Statement", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();

    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
  });

  it("should be able to create a deposit statement", async () => {
    const user = await usersRepository.create({
      name:"ciclano",
      email: "ciclano@email.com",
      password: await hash("123", 8),
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 95,
      description: "This's an deposit"
    });
    expect(statement).toHaveProperty("id");
  });

  it("should be able to create a withdraw statement", async () => {
    const user = await usersRepository.create({
      name:"fulano",
      email: "fulano@email.com",
      password: await hash("321", 8),
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 150,
      description: "This's an deposit"
    });

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 75,
      description: "This's an withdraw"
    });
    expect(withdraw).toHaveProperty("id");
  });

    it("should not be able to create a withdraw statement with", async () => {
      const user = await usersRepository.create({
        name:"fulano",
        email: "fulano@email.com",
        password: "orignPass",
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.DEPOSIT,
        amount: 150,
        description: "This's an deposit"
      });

      const withdraw = await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 75,
        description: "This's an withdraw"
      });
      expect(withdraw).toHaveProperty("id");
    });

    it("should not be able to create a withdraw statement with not funds", async () => {
      expect(async () => {
        const user = await usersRepository.create({
          name:"Arnold",
          email: "arnold@email.com",
          password: "pass123"
        });

        await createStatementUseCase.execute({
          user_id: user.id as string,
          type: OperationType.WITHDRAW,
          amount: 50,
          description: "This's an withdraw",
        });
      }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
    });

    it("should not be able to create an statement for nonexists user", async () => {
      expect(async () => {
        await createStatementUseCase.execute({
          user_id: "thisIdNonexists",
          type: OperationType.DEPOSIT,
          amount: 15,
          description: "This's an operation",
        });
      }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
    });
});
