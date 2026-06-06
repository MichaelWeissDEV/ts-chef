import { CipherSaber2Decrypt } from "../../src/chef/operations/CipherSaber2Decrypt";
import { Utils } from "../../src/chef/Utils";

describe("CipherSaber2Decrypt", () => {
    let decrypt: CipherSaber2Decrypt;

    beforeEach(() => {
        decrypt = new CipherSaber2Decrypt();
    });

    test("should decrypt a known ciphertext", () => {
        const key = { string: "key", option: "UTF8" };
        const rounds = 20;
        
        // Use Encrypt to create a valid ciphertext for testing Decrypt
        const encrypt = new (require("../../src/chef/operations/CipherSaber2Encrypt").CipherSaber2Encrypt)();
        const input = new Uint8Array(Buffer.from("This is a test message")).buffer;
        const encrypted = encrypt.run(input, [key, rounds]);
        
        const decrypted = decrypt.run(encrypted, [key, rounds]);
        expect(Buffer.from(decrypted).toString()).toBe("This is a test message");
    });

    test("should handle empty input", () => {
        const key = { string: "key", option: "UTF8" };
        const rounds = 20;
        const input = new Uint8Array(10).buffer; // Only IV, no data

        const decrypted = decrypt.run(input, [key, rounds]);
        expect(decrypted.byteLength).toBe(0);
    });
});
