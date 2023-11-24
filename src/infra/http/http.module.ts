import { Module } from '@nestjs/common';
import { CreateAccountController } from '@infra/http/controllers/create-account.controller';
import { CreateAuthorController } from '@infra/http/controllers/create-author.controller';
import { FindManyAuthorsController } from '@infra/http/controllers/find-many-authors.controller';
import { AuthenticateController } from '@infra/http/controllers/authenticate.controller';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { CreateAuthorUseCase } from '@usecase/create-author/create-author';
import { FindManyAuthorsUseCase } from '@usecase/find-many-authors/find-many-authors';
import { CryptographyModule } from '@infra/cryptography/cryptography.module';
import { RegisterUserUseCase } from '@usecase/register-user/register-user';
import { AuthenticateUserUseCase } from '@usecase/authenticate-user/authenticate-user';
import { FindAuthorByIdController } from './controllers/find-author-by-id.controller';
import { FindAuthorByIdUseCase } from '@usecase/find-author-by-id/find-author-by-id';
import { DeleteAuthorUseCase } from '@usecase/delete-author/delete-author';
import { DeleteAuthorController } from './controllers/delete-author.controller';
import { UpdateAuthorController } from './controllers/update-author.controller';
import { UpdateAuthorUseCase } from '@usecase/update-author/update-author';
import { CreatePublisherController } from './controllers/create-publisher.controller';
import { CreatePublisherUseCase } from '@usecase/create-publisher/create-publisher';
import { FindPublisherByIdUseCase } from '@usecase/find-publisher-by-id/find-publisher-by-id';
import { FindManyPublishersUseCase } from '@usecase/find-many-publishers/find-many-publishers';
import { DeletePublisherUseCase } from '@usecase/delete-publisher/delete-publisher';
import { UpdatePublisherUseCase } from '@usecase/update-publisher/update-publisher';
import { DeletePublisherController } from './controllers/delete-publisher.controller';
import { UpdatePublisherController } from './controllers/update-publisher.controller';
import { FindPublisherByIdController } from './controllers/find-publisher-by-id.controller';
import { FindManyPublishersController } from './controllers/find-many-publishers.controller';
import { CreateBookController } from './controllers/create-book.controller';
import { CreateBookUseCase } from '@usecase/create-book/create-book';
import { UpdateBookController } from './controllers/update-book.controller';
import { UpdateBookUseCase } from '@usecase/update-book/update-book';
import { AddBookToStockController } from './controllers/add-book-to-stock.controller';
import { AddBookToStockUseCase } from '@usecase/add-book-to-stock/add-book-to-stock';
import { DeleteBookController } from './controllers/delete-book.controller';
import { DeleteBookUseCase } from '@usecase/delete-book/delete-book';
import { FindBookByIdController } from './controllers/find-book-by-id.controller';
import { FindBookByIdUseCase } from '@usecase/find-book-by-id/find-book-by-id';
import { FindManyBooksController } from './controllers/find-many-books.controller';
import { FindManyBooksUseCase } from '@usecase/find-many-book/find-many-books';
import { RemoveBookFromStockController } from './controllers/remove-book-from-stock.controller';
import { RemoveBookFromStockUseCase } from '@usecase/remove-book-from-stock/remove-book-from-stock';
import { CreateReservationController } from './controllers/create-reservation.controller';
import { CreateReservationUseCase } from '@usecase/create-reservation/create-reservation';
import { DeleteReservationController } from './controllers/delete-reservation.controller';
import { DeleteReservationUseCase } from '@usecase/delete-reservation/delete-reservation';
import { ExtendReservationController } from './controllers/extend-reservation.controller';
import { ExtendReservationUseCase } from '@usecase/extend-reservation/extend-reservation';
import { FindReservationByIdController } from './controllers/find-reservation-by-id.controller';
import { FindReservationByIdUseCase } from '@usecase/find-reservation-by-id/find-reservation-by-id';
import { FindReservationByUserIdController } from './controllers/find-reservation-by-user-id.controller';
import { FindReservationsByUserIdUseCase } from '@usecase/find-reservations-by-user-id/find-reservations-by-user-id';
import { ReturnAllItemsFromReservationController } from './controllers/return-all-items-from-reservation.controller';
import { ReturnAllItemsFromReservationUseCase } from '@usecase/return-all-items-from-reservation/return-all-items-from-reservation';
import { ReturnByItemIdUseCase } from '@usecase/return-by-item-id/return-by-item-id';
import { ReturnByItemIdController } from './controllers/return-by-item-id.controller';
import { ConfirmOrChangeScheduleStatusController } from './controllers/confirm-or-change-schedule-status.controller';
import { ConfirmOrChangeScheduleStatusUseCase } from '@usecase/confirm-or-change-schedule-status/confirm-or-change-schedule-status';
import { CreateScheduleController } from './controllers/create-schedule.controller';
import { CreateReservationScheduleUseCase } from '@usecase/create-reservation-schedule/create-reservation-schedule';
import { FindReservationScheduleByIdUseCase } from '@usecase/find-reservation-schedule-by-id/find-reservation-schedule-by-id';
import { FindScheduleByIdController } from './controllers/find-schedule-by-id.controller';
import { FindLasThirtyDaysScheduleByUserIdController } from './controllers/find-last-thirty-days-schedule-by-user-id.controller';
import { FindLastThirtyScheduleByUserIdUseCase } from '@usecase/find-last-thirty-days-schedule-by-user-id/find-last-thirty-days-schedule-by-user-id';

@Module({
    imports: [DatabaseModule, CryptographyModule],
    controllers: [
        AuthenticateController,
        CreateAccountController,
        CreateAuthorController,
        DeleteAuthorController,
        UpdateAuthorController,
        FindAuthorByIdController,
        FindManyAuthorsController,
        CreatePublisherController,
        DeletePublisherController,
        UpdatePublisherController,
        FindPublisherByIdController,
        FindManyPublishersController,
        CreateBookController,
        UpdateBookController,
        AddBookToStockController,
        DeleteBookController,
        FindBookByIdController,
        FindManyBooksController,
        RemoveBookFromStockController,
        CreateReservationController,
        DeleteReservationController,
        ExtendReservationController,
        FindReservationByIdController,
        FindReservationByUserIdController,
        ReturnAllItemsFromReservationController,
        ReturnByItemIdController,
        ConfirmOrChangeScheduleStatusController,
        CreateScheduleController,
        FindScheduleByIdController,
        FindLasThirtyDaysScheduleByUserIdController,
    ],
    providers: [
        CreateAuthorUseCase,
        FindAuthorByIdUseCase,
        FindManyAuthorsUseCase,
        DeleteAuthorUseCase,
        UpdateAuthorUseCase,
        CreatePublisherUseCase,
        FindPublisherByIdUseCase,
        FindManyPublishersUseCase,
        DeletePublisherUseCase,
        UpdatePublisherUseCase,
        RegisterUserUseCase,
        AuthenticateUserUseCase,
        CreateBookUseCase,
        UpdateBookUseCase,
        AddBookToStockUseCase,
        DeleteBookUseCase,
        FindBookByIdUseCase,
        FindManyBooksUseCase,
        RemoveBookFromStockUseCase,
        CreateReservationUseCase,
        DeleteReservationUseCase,
        ExtendReservationUseCase,
        FindReservationByIdUseCase,
        FindReservationsByUserIdUseCase,
        ReturnAllItemsFromReservationUseCase,
        ReturnByItemIdUseCase,
        ConfirmOrChangeScheduleStatusUseCase,
        CreateReservationScheduleUseCase,
        FindReservationScheduleByIdUseCase,
        FindLastThirtyScheduleByUserIdUseCase,
    ],
})
export class HttpModule {}
