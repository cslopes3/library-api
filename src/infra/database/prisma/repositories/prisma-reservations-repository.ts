import { Injectable } from '@nestjs/common';
import { ReservationsRepository } from '@repository/reservations-repository';
import { PrismaService } from '../prisma.service';
import { Reservation } from '@domain/entities/reservation';
import { PrismaReservationMapper } from '../mappers/prisma-reservation-mapper';
import { ReservationItem } from '@domain/value-objects/resevation-item';

@Injectable()
export class PrismaReservationsRepository implements ReservationsRepository {
    constructor(private prisma: PrismaService) {}

    async findById(id: string): Promise<Reservation | null> {
        const reservation = await this.prisma.reservation.findUnique({
            where: {
                id,
            },
            include: {
                reservationItems: true,
            },
        });

        if (!reservation) {
            return null;
        }

        return PrismaReservationMapper.toDomainLayer(reservation);
    }

    async findByUserId(userId: string): Promise<Reservation[] | []> {
        const reservation = await this.prisma.reservation.findMany({
            where: {
                userId,
            },
            include: {
                reservationItems: true,
            },
        });

        return reservation.map(PrismaReservationMapper.toDomainLayer);
    }

    async create(reservation: Reservation): Promise<void> {
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
    }

    async delete(id: string): Promise<void> {
        const items = await this.prisma.reservationItem.findMany({
            where: {
                reservationId: id,
            },
        });

        const itemsId = items.map((item) => item.id);
        await this.prisma.reservationItem.deleteMany({
            where: {
                id: { in: itemsId },
            },
        });

        await this.prisma.reservation.delete({
            where: {
                id,
            },
        });
    }

    async changeReservationInfoById(
        id: string,
        expirationDate: Date,
        alreadyExtendTime: boolean,
    ): Promise<void> {
        await this.prisma.reservationItem.updateMany({
            data: {
                expirationDate,
                alreadyExtendTime,
            },
            where: {
                reservationId: id,
            },
        });
    }

    async returnByItemId(id: string, returnDate: Date): Promise<void> {
        await this.prisma.reservationItem.update({
            data: {
                returnDate,
                returned: true,
            },
            where: {
                id,
            },
        });
    }

    async findItemById(id: string): Promise<ReservationItem | null> {
        const reservationItem = await this.prisma.reservationItem.findUnique({
            where: {
                id,
            },
        });

        if (!reservationItem) {
            return null;
        }

        return PrismaReservationMapper.reservationItemtoDomainLayer(
            reservationItem,
        );
    }
}
