import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ScheduleItem } from '@domain/value-objects/schedule-item';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { PrismaSchedulesRepository } from '@infra/database/prisma/repositories/prisma-schedule-repository';
import { ConfirmOrChangeScheduleStatusUseCase } from '@usecase/confirm-or-change-schedule-status/confirm-or-change-schedule-status';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeSchedule } from 'test/factories/fake-schedule-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let schedulesRepository: PrismaSchedulesRepository;
let reservationsRepository: PrismaReservationsRepository;
let booksRepository: PrismaBooksRepository;
let confirmOrChangeScheduleStatusUseCase: ConfirmOrChangeScheduleStatusUseCase;
let prismaFakeUser: PrismaFakeUser;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeBook: PrismaFakeBook;
let prismaFakeSchedule: PrismaFakeSchedule;

describe('[IT] - Confirm or change status', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        schedulesRepository = new PrismaSchedulesRepository(prisma);
        reservationsRepository = new PrismaReservationsRepository(prisma);
        booksRepository = new PrismaBooksRepository(prisma);

        confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
            );

        prismaFakeUser = new PrismaFakeUser(prisma);
        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
        prismaFakeSchedule = new PrismaFakeSchedule(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should be able to change status', async () => {
        const user = await prismaFakeUser.create();
        const publisher = await prismaFakePublisher.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
            available: 1,
        });
        const schedule = await prismaFakeSchedule.create({
            userId: user.id.toString(),
            scheduleItems: [new ScheduleItem(book.id.toString(), book.name)],
        });

        vi.spyOn(booksRepository, 'addBookToStock');

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: schedule.id.toString(),
            status: 'canceled',
        });

        expect(result.isRight()).toBeTruthy();
        expect(booksRepository.addBookToStock).toHaveBeenCalledOnce();
    });

    it('should be able to confirm a schedule', async () => {
        const user = await prismaFakeUser.create();
        const publisher = await prismaFakePublisher.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
            available: 1,
        });
        const schedule = await prismaFakeSchedule.create({
            userId: user.id.toString(),
            scheduleItems: [new ScheduleItem(book.id.toString(), book.name)],
        });

        vi.spyOn(reservationsRepository, 'create');

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: schedule.id.toString(),
            status: 'finished',
        });

        expect(result.isRight()).toBeTruthy();
        expect(reservationsRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: schedule.userId,
                reservationItem: [
                    expect.objectContaining({
                        bookId: schedule.scheduleItems[0].bookId,
                        name: schedule.scheduleItems[0].name,
                        expirationDate: expect.any(Date),
                    }),
                ],
            }),
        );
    });
});
