import { Reservation } from '@domain/entities/reservation';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import {
    Reservation as PrismaReservation,
    ReservationItem as PrismaReservationItem,
    Prisma,
} from '@prisma/client';

type PrismaReservationWithItems = PrismaReservation & {
    reservationItems: PrismaReservationItem[];
};

type PrismaReservationWithItemsToPersistent =
    Prisma.ReservationUncheckedCreateInput & {
        reservationItems: Prisma.ReservationItemUncheckedCreateInput[];
    };

export class PrismaReservationMapper {
    static toDomainLayer(raw: PrismaReservationWithItems): Reservation {
        return new Reservation(
            {
                userId: raw.userId,
                reservationItem: raw.reservationItems.map(
                    (item) =>
                        new ReservationItem(
                            item.bookId,
                            item.name,
                            item.expirationDate,
                            item.alreadyExtendTime,
                            item.returned,
                            item.id,
                            item.returnDate || undefined,
                        ),
                ),
            },
            raw.id,
            raw.createdAt,
            raw.updatedAt ?? undefined,
        );
    }

    static toPersistent(
        reservation: Reservation,
    ): PrismaReservationWithItemsToPersistent {
        return {
            id: reservation.id.toString(),
            userId: reservation.userId,
            reservationItems: reservation.reservationItem.map((item) => ({
                id: item.id.toString(),
                reservationId: reservation.id.toString(),
                bookId: item.bookId,
                name: item.name,
                expirationDate: item.expirationDate,
                alreadyExtendTime: item.alreadyExtendTime,
                returned: item.returned,
                returnDate: item.returnDate,
            })),
        };
    }

    static reservationItemtoDomainLayer(
        raw: PrismaReservationItem,
    ): ReservationItem {
        return new ReservationItem(
            raw.bookId,
            raw.name,
            raw.expirationDate,
            raw.alreadyExtendTime,
            raw.returned,
            raw.id,
            raw.returnDate || undefined,
        );
    }
}
