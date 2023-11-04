import { ReservationsRepository } from '@repository/reservations-repository';
import {
    FindReservationByIdInputDto,
    FindReservationByIdOutputDto,
} from './find-reservation-by-id-dto';
import { Either, right } from '@shared/errors/either';

export class FindReservationByIdUseCase {
    constructor(private reservationsRespository: ReservationsRepository) {}

    async execute({
        id,
    }: FindReservationByIdInputDto): Promise<
        Either<null, FindReservationByIdOutputDto | null>
    > {
        const reservation = await this.reservationsRespository.findById(id);

        if (!reservation) {
            return right(null);
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
