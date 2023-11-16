import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { ReturnByItemIdUseCase } from '@usecase/return-by-item-id/return-by-item-id';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let reservationsRepository: PrismaReservationsRepository;
let returnByItemIdUseCase: ReturnByItemIdUseCase;

describe('[IT] - Return all items from reservation', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        reservationsRepository = new PrismaReservationsRepository(prisma);
        booksRepository = new PrismaBooksRepository(prisma);
        returnByItemIdUseCase = new ReturnByItemIdUseCase(
            reservationsRepository,
            booksRepository,
        );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should return an item', async () => {
        await prisma.user.create({
            data: {
                id: '1',
                name: 'User 1',
                email: 'email@email.com',
                password: '1234',
            },
        });

        await prisma.publisher.create({
            data: {
                id: '1',
                name: 'Publisher 1',
            },
        });

        await prisma.book.create({
            data: {
                id: '1',
                name: 'Book 1',
                editionNumber: 1,
                editionDescription: 'Description',
                editionYear: 2023,
                quantity: 10,
                available: 10,
                pages: 100,
                publisherId: '1',
            },
        });

        await prisma.reservation.create({
            data: {
                id: '1',
                userId: '1',
                reservationItems: {
                    create: [
                        {
                            id: '1',
                            bookId: '1',
                            name: 'Book 1',
                            expirationDate: new Date(),
                            alreadyExtendTime: false,
                            returned: false,
                        },
                    ],
                },
            },
        });

        vi.spyOn(booksRepository, 'addBookToStock');
        vi.spyOn(reservationsRepository, 'returnByItemId');

        const result = await returnByItemIdUseCase.execute({
            id: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: '1',
            bookId: '1',
            name: 'Book 1',
            expirationDate: expect.any(Date),
            alreadyExtendTime: expect.any(Boolean),
            returned: true,
            returnDate: expect.any(Date),
        });
        expect(booksRepository.addBookToStock).toHaveBeenCalledWith('1', 1);
        expect(reservationsRepository.returnByItemId).toHaveBeenCalledWith(
            '1',
            expect.any(Date),
        );
    });
});
