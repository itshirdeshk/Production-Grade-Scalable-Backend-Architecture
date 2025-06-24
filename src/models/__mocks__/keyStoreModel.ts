import { vi } from "vitest";

const KeyStoreModelMock = {
    findOne: vi.fn(),
    create: vi.fn()
}

export default KeyStoreModelMock;
export const keyStoreModel = KeyStoreModelMock;