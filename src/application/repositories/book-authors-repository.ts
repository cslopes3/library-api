export abstract class BookAuthorsRepository {
    abstract create(bookId: string, authorId: string[]): Promise<void>;
    abstract delete(bookId: string): Promise<void>;
}
