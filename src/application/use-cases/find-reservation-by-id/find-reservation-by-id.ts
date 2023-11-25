import { ReservationsRepository } from '@repository/reservations-repository';
import {
    FindReservationByIdInputDto,
    FindReservationByIdOutputDto,
} from './find-reservation-by-id-dto';
import { Either, left, right } from '@shared/errors/either';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@repository/users-repository';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';

@Injectable()
export class FindReservationByIdUseCase {
    constructor(
        private reservationsRespository: ReservationsRepository,
        private usersRepository: UsersRepository,
    ) {}

    async execute({
        id,
        currentUserId,
    }: FindReservationByIdInputDto): Promise<
        Either<NotAllowedError, FindReservationByIdOutputDto | null>
    > {
        const reservation = await this.reservationsRespository.findById(id);

        if (!reservation) {
            return right(null);
        }

        const user = await this.usersRepository.findById(currentUserId);

        if (user?.role !== 'admin' && currentUserId !== reservation.userId) {
            return left(new NotAllowedError());
        }

        return right({
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
        });
    }
}
