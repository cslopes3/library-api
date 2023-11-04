import { ReservationItem } from '@domain/value-objects/resevation-item';
import { Entity } from '@shared/entities/base-entity';

interface ReservationProps {
    userId: string;
    reservationItem: ReservationItem[];
}

export class Reservation extends Entity<ReservationProps> {
    get userId(): string {
        return this.props.userId;
    }

    get reservationItem(): ReservationItem[] {
        return this.props.reservationItem;
    }
}
