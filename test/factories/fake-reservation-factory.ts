import { Reservation } from '@domain/entities/reservation';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { PrismaReservationMapper } from '@infra/database/prisma/mappers/prisma-reservation-mapper';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

export function createFakeReservation(
    options?: Partial<Reservation>,
): Reservation {
    const reservationDefaultValues = {
        userId: '1',
        reservationItem: [
            new ReservationItem('1', 'Book 1', new Date(), false, false),
        ],
    };

    return new Reservation({ ...reservationDefaultValues, ...options });
}

@Injectable()
export class PrismaFakeReservation {
    constructor(private prisma: PrismaService) {}

    async create(options?: Partial<Reservation>): Promise<Reservation> {
        const reservation = createFakeReservation(options);

        const data = PrismaReservationMapper.toPersistent(reservation);

        await this.prisma.reservation.create({
            data: {
                id: data.id,
                userId: data.userId,
                reservationItems: {
                    create: data.reservationItems.map((item) => ({
                        id: item.id,
                        bookId: item.bookId,
                        name: item.name,
                        expirationDate: item.expirationDate,
                        alreadyExtendTime: item.alreadyExtendTime,
                        returned: item.returned,
                    })),
                },
            },
        });

        return reservation;
    }
}
