import { ReservationsRepository } from '@repository/reservations-repository';
import { UsersRepository } from '@repository/users-repository';
import {
    FindReservationsByUserIdInputDto,
    FindReservationsByUserIdOutputDto,
} from './find-reservations-by-user-id-dto';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { Either, left, right } from '@shared/errors/either';
import { Injectable } from '@nestjs/common';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';

@Injectable()
export class FindReservationsByUserIdUseCase {
    constructor(
        private reservationsRepository: ReservationsRepository,
        private usersRepository: UsersRepository,
    ) {}

    async execute({
        userId,
        currentUserId,
    }: FindReservationsByUserIdInputDto): Promise<
        Either<
            UserDoesNotExistsError | NotAllowedError,
            FindReservationsByUserIdOutputDto[] | []
        >
    > {
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            return left(new UserDoesNotExistsError());
        }

        const currentUser = await this.usersRepository.findById(currentUserId);

        if (
            currentUser?.role !== 'admin' &&
            currentUserId !== user.id.toString()
        ) {
            return left(new NotAllowedError());
        }

        const reservations =
            await this.reservationsRepository.findByUserId(userId);

        return right(
            reservations.map((reservation) => ({
                id: reservation.id.toString(),
                userId: reservation.userId,
                reservationItems: reservation.reservationItem.map((item) => ({
                    id: item.id.toString(),
                    bookId: item.bookId,
                    name: item.name,
                    expirationDate: item.expirationDate,
                    alreadyExtendTime: item.alreadyExtendTime,
                    returned: item.returned,
                    returnDate: item.returnDate,
                })),
                createdAt: reservation.createdAt,
                updatedAt: reservation.updatedAt,
            })),
        );
    }
}
