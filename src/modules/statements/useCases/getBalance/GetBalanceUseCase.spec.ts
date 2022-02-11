import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { hash } from "bcryptjs";
import { GetBalanceError } from "./GetBalanceError";

let getBalanceUseCase: GetBalanceUseCase;
let statementsRepository: IStatementsRepository;
let usersRepository: IUsersRepository;

describe("Create Statement", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
  });

  it("should be able to get a balance", async () => {
    const user = await usersRepository.create({
      name:"juliana",
      email: "ju@email.com",
      password: await hash("ju123", 8),
    });

    const deposit1 = await statementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 10,
      description: "This's an deposit"
    });

    const deposit2 = await statementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 10,
      description: "This's other deposit"
    });

    const withdraw = await statementsRepository.create({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 2,
      description: "this's an withdraw"
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance).toStrictEqual({
      statement: [deposit1, deposit2, withdraw],
      balance: 18,
    });
  });

  it("should not be able to get a balance with a non-existent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "none"
      })
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
