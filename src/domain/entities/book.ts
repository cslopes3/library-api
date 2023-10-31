import { Entity } from '@shared/entities/base-entity';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { BookPublisher } from '@domain/value-objects/book-publisher';

interface BookProps {
    name: string;
    authors: BookAuthors[];
    publisher: BookPublisher;
    edition: BookEdition;
    quantity: number;
    available: number;
    pages: number;
}

export class Book extends Entity<BookProps> {
    get name(): string {
        return this.props.name;
    }

    get authors(): BookAuthors[] {
        return this.props.authors;
    }

    get publisher(): BookPublisher {
        return this.props.publisher;
    }

    get edition(): BookEdition {
        return this.props.edition;
    }

    get quantity(): number {
        return this.props.quantity;
    }

    get available(): number {
        return this.props.available;
    }

    get pages(): number {
        return this.props.pages;
    }

    public changeName(name: string) {
        this.props.name = name;
        this.touch();
    }

    public changeAuthors(authors: BookAuthors[]) {
        this.props.authors = authors;
        this.touch();
    }

    public changePublisher(publisher: BookPublisher) {
        this.props.publisher = publisher;
        this.touch();
    }

    public changeEdition(bookEdition: BookEdition) {
        this.props.edition = bookEdition;
        this.touch();
    }

    public changePages(pages: number) {
        this.props.pages = pages;
    }
}
