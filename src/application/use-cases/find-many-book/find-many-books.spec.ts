import { FakeBookFactory } from 'test/factories/fake-book-factory';
import { FindManyBooksUseCase } from './find-many-books';
import { BooksMockRepository } from '@mocks/mock-books-repository';

let booksRepository: ReturnType<typeof BooksMockRepository>;

describe('[UT] - Find many books use case', () => {
    beforeEach(() => {
        booksRepository = BooksMockRepository();
    });

    it('should find many books', async () => {
        const books = [
            FakeBookFactory.create(),
            FakeBookFactory.create({ name: 'Book 2' }, '2'),
            FakeBookFactory.create({ name: 'Book 3' }, '3'),
        ];

        booksRepository.findMany.mockResolvedValue(books);
        const findManyBooksUseCase = new FindManyBooksUseCase(booksRepository);

        const result = await findManyBooksUseCase.execute({
            params: {
                page: 1,
            },
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(3);
        expect(result.value).toEqual([
            expect.objectContaining({
                name: books[0].name,
            }),
            expect.objectContaining({
                name: books[1].name,
            }),
            expect.objectContaining({
                name: books[2].name,
            }),
        ]);
    });

    it('should return an empty array when not found a book', async () => {
        booksRepository.findMany.mockResolvedValue([]);

        const findManyBooksUseCase = new FindManyBooksUseCase(booksRepository);

        const result = await findManyBooksUseCase.execute({
            params: { page: 1 },
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(0);
    });
});
