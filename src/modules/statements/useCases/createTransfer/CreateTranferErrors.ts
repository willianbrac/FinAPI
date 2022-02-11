import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferError {
  export class UserNotFound extends AppError {
    constructor() {
      super('User not found', 404);
    }
  }
  export class ReceivedUserNotFound extends AppError {
    constructor() {
      super('Receive user not found', 404);
    }
  }
  export class SenderUserNotFound extends AppError {
    constructor() {
      super('Sender user not found', 404);
    }
  }
  export class InvalidValue extends AppError {
    constructor() {
      super('Amount must be greater than 0', 400);
    }
  }
}
