import { Reservation } from '@domain/entities/reservation';
import { ReservationItem } from '@domain/value-objects/resevation-item';

export abstract class ReservationsRepository {
    abstract findById(id: string): Promise<Reservation | null>;
    abstract findByUserId(userId: string): Promise<Reservation[] | []>;
    abstract create(reservation: Reservation): Promise<void>;
    abstract delete(id: string): Promise<void>;
    abstract changeReservationInfoById(
        id: string,
        expirationDate: Date,
        alreadyExtendTime: boolean,
    ): Promise<void>;
    abstract returnByItemId(id: string, returnDate: Date): Promise<void>;
    abstract findItemById(id: string): Promise<ReservationItem | null>;
}
