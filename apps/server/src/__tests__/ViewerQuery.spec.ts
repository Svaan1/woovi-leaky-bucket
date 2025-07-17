import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { graphql } from "graphql";
import { schema } from "../schema/schema";
import { toGlobalId } from "graphql-relay";
import { User } from "../modules/user/UserModel";
import { getDataloaders } from "../modules/loader/loaderRegister";

// Mock the User model
jest.mock("../modules/user/UserModel");
jest.mock("../modules/loader/loaderRegister");

const mockedUser = User as jest.Mocked<typeof User>;
const mockedGetDataloaders = getDataloaders as jest.MockedFunction<typeof getDataloaders>;

describe("Viewer Query", () => {
  const USER_ID = "507f1f77bcf86cd799439011";
  const mockUserData = {
    _id: USER_ID,
    name: "John Doe",
    email: "john@example.com",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  };

  const mockDataloaders = {
    UserLoader: {
      load: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetDataloaders.mockReturnValue(mockDataloaders as any);
    (mockDataloaders.UserLoader.load as any).mockResolvedValue(mockUserData);
  });

  const executeViewerQuery = (userContext?: any) => {
    const source = `
      query {
        viewer {
          id
          name
          email
          createdAt
        }
      }
    `;

    const contextValue = {
      dataloaders: mockDataloaders,
      user: userContext,
    };

    return graphql({ schema, source, contextValue });
  };

  it("should return user information for authenticated user", async () => {
    const contextUser = {
      id: toGlobalId("User", USER_ID),
    };

    const result = await executeViewerQuery(contextUser);

    expect(result.errors).toBeUndefined();
    expect(result.data?.viewer).toEqual({
      id: toGlobalId("User", USER_ID),
      name: "John Doe",
      email: "john@example.com",
      createdAt: "2023-01-01T00:00:00.000Z",
    });

    expect(mockDataloaders.UserLoader.load).toHaveBeenCalledWith(USER_ID);
  });

  it("should return null for unauthenticated user", async () => {
    const result = await executeViewerQuery(null);

    expect(result.errors).toBeUndefined();
    expect(result.data?.viewer).toBeNull();
    expect(mockDataloaders.UserLoader.load).not.toHaveBeenCalled();
  });

  it("should return null when user is undefined", async () => {
    const result = await executeViewerQuery(undefined);

    expect(result.errors).toBeUndefined();
    expect(result.data?.viewer).toBeNull();
    expect(mockDataloaders.UserLoader.load).not.toHaveBeenCalled();
  });

  it("should handle user not found in database", async () => {
    (mockDataloaders.UserLoader.load as any).mockResolvedValue(null);

    const contextUser = {
      id: toGlobalId("User", USER_ID),
    };

    const result = await executeViewerQuery(contextUser);

    expect(result.errors).toBeUndefined();
    expect(result.data?.viewer).toBeNull();
    expect(mockDataloaders.UserLoader.load).toHaveBeenCalledWith(USER_ID);
  });
});
