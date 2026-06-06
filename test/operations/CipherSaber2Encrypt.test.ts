import { CipherSaber2Encrypt } from "../../src/chef/operations/CipherSaber2Encrypt";
import { CipherSaber2Decrypt } from "../../src/chef/operations/CipherSaber2Decrypt";

describe("CipherSaber2Encrypt", () => {
    let encrypt: CipherSaber2Encrypt;
    let decrypt: CipherSaber2Decrypt;

    beforeEach(() => {
        encrypt = new CipherSaber2Encrypt();
        decrypt = new CipherSaber2Decrypt();
    });

    test("should encrypt and then decrypt correctly (UTF8 key)", () => {
        const key = { string: "secret", option: "UTF8" };
        const rounds = 20;
        const input = new Uint8Array(Buffer.from("Hello, World!")).buffer;

        const encrypted = encrypt.run(input, [key, rounds]);
        const decrypted = decrypt.run(encrypted, [key, rounds]);

        expect(Buffer.from(decrypted).toString()).toBe("Hello, World!");
    });

    test("should encrypt and then decrypt correctly (Hex key)", () => {
        const key = { string: "616263", option: "Hex" }; // "abc"
        const rounds = 10;
        const input = new Uint8Array(Buffer.from("CipherSaber-2 Test")).buffer;

        const encrypted = encrypt.run(input, [key, rounds]);
        const decrypted = decrypt.run(encrypted, [key, rounds]);

        expect(Buffer.from(decrypted).toString()).toBe("CipherSaber-2 Test");
    });

    test("should produce different ciphertexts for the same input (due to random IV)", () => {
        const key = { string: "key", option: "UTF8" };
        const rounds = 20;
        const input = new Uint8Array(Buffer.from("Constant Input")).buffer;

        const encrypted1 = encrypt.run(input, [key, rounds]);
        const encrypted2 = encrypt.run(input, [key, rounds]);

        expect(new Uint8Array(encrypted1)).not.toEqual(new Uint8Array(encrypted2));
        
        // Both should still decrypt correctly
        expect(Buffer.from(decrypt.run(encrypted1, [key, rounds])).toString()).toBe("Constant Input");
        expect(Buffer.from(decrypt.run(encrypted2, [key, rounds])).toString()).toBe("Constant Input");
    });
});
