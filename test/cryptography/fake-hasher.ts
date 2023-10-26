import { HashComparer } from '@cryptography/hash-comparer';
import { HashGenerator } from '@cryptography/hash-generator';

export class FakeHasher implements HashGenerator, HashComparer {
    async compare(plain: string, hash: string): Promise<boolean> {
        return plain.concat('-hashed') === hash;
    }

    async hash(plain: string): Promise<string> {
        return plain.concat('-hashed');
    }
}
