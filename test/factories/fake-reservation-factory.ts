import { Reservation } from '@domain/entities/reservation';
import { ReservationItem } from '@domain/value-objects/resevation-item';

export class FakeReservationFactory {
    static create(options?: Partial<Reservation>, id?: string): Reservation {
        const reservationDefaultValues = {
            userId: '1',
            reservationItem: [
                new ReservationItem('1', 'Book 1', new Date(), false, false),
            ],
        };

        return new Reservation(
            { ...reservationDefaultValues, ...options },
            id ?? '1',
        );
    }
}
