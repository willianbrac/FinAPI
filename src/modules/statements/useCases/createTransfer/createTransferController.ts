
import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTranferUseCase } from "./createTransferUseCase";

export class CreateTransferController {
  async handle(request: Request, response: Response) {
    const { user_id: receiveUserId } = request.params;
    const { amount, description } = request.body;
    const createTransferUseCase = container.resolve(CreateTranferUseCase);
    await createTransferUseCase.execute({
      senderUserId: request.user.id,
      receiveUserId,
      amount,
      description,
    });
  }
}

