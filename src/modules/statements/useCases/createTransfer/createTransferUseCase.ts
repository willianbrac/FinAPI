import { container, inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferError } from "./CreateTranferErrors";
import { ICreateTranferDTO } from "./ICreateTranferDTO";

@injectable()
export class CreateTranferUseCase {
  constructor (
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}
  async execute({
    receiveUserId,
    senderUserId,
    amount,
    description,
  }: ICreateTranferDTO): Promise<void> {
    if (amount <= 0) throw new CreateTransferError.InvalidValue();
    const receiveUser = await this.usersRepository.findById(receiveUserId);
    if (!receiveUser) throw new CreateTransferError.ReceivedUserNotFound();
    const senderUser = await this.usersRepository.findById(senderUserId);
    if (!senderUser) throw new CreateTransferError.SenderUserNotFound();
    const createStatementUseCase = container.resolve(CreateStatementUseCase);

    await createStatementUseCase.execute({
      user_id: senderUser.id as string,
      amount: amount * -1,
      type: OperationType.TRANSFER,
      description,
    });
    await createStatementUseCase.execute({
      user_id: receiveUser.id as string,
      amount,
      type: OperationType.TRANSFER,
      description,
    });
  }
}
