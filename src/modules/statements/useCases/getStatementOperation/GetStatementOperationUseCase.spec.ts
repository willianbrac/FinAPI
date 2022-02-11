import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { OperationType } from "../../entities/Statement";
import { hash } from "bcryptjs";
import { GetStatementOperationError } from "./GetStatementOperationError";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get statement operation", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository,
    );
  });

  it("should be able to get the statement operation", async () => {
    const user = await usersRepository.create({
      name:"Bia",
      email: "Bia@email.com",
      password: await hash("Bia321", 8),
    });

    const withdraw = await statementsRepository.create({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 20,
      description: "This's withdraw",
    });

    const response = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: withdraw.id as string,
    });

    expect(response).toBe(withdraw);
  });

  it("should not be able to get the statement operation with nonexists user", async () => {
    expect(async () => {
      const deposit = await statementsRepository.create({
        user_id: "6bf88bca-7a6f-49db-966c-9a8a8b466bd6",
        type: OperationType.DEPOSIT,
        amount: 20,
        description: "This's an deposit",
      });
      await getStatementOperationUseCase.execute({
        user_id: "66974823-1e45-466e-b018-22adf9d3bad9",
        statement_id: deposit.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get the statement operation with nonexists statement", async () => {
    expect(async () => {
      const user = await usersRepository.create({
        name:"user",
        email: "user@email.com",
        password: await hash("user321", 8),
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "66974811-1e45-466e-b018-22adf9d3bad9",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
