import { vi } from "vitest";

export enum RoleCode {
    USER = "USER",
    ADMIN = "ADMIN",
}

const RoleModel = {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
}

export const RoleModelMock = RoleModel;