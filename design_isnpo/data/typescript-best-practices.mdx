---
title: "TypeScript Best Practices for 2024"
description: "Learn the most important TypeScript best practices and patterns that will help you write more maintainable and type-safe code in your projects."
image: "/blog/nextjs.webp"
date: "2024-02-01"
authorName: "Manu Arora"
authorSrc: "/avatars/manu.png"
---

# TypeScript Best Practices for 2024

TypeScript has become an essential tool in modern web development. Let's explore the best practices that will help you write better TypeScript code in 2024.

## Type Safety First

### 1. Strict Mode

Always enable strict mode in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### 2. Type Inference

Let TypeScript infer types when possible:

```typescript
// Good
const numbers = [1, 2, 3]; // Type: number[]

// Bad
const numbers: number[] = [1, 2, 3];
```

## Interface vs Type

### When to Use Interfaces

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Extending interfaces
interface AdminUser extends User {
  role: "admin";
  permissions: string[];
}
```

### When to Use Types

```typescript
type Status = "pending" | "approved" | "rejected";

type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};
```

## Advanced Type Patterns

### 1. Utility Types

```typescript
// Partial
type PartialUser = Partial<User>;

// Pick
type UserCredentials = Pick<User, "email" | "password">;

// Omit
type PublicUser = Omit<User, "password">;

// Record
type UserRoles = Record<string, string[]>;
```

### 2. Type Guards

```typescript
function isAdmin(user: User): user is AdminUser {
  return "role" in user && user.role === "admin";
}

function processUser(user: User) {
  if (isAdmin(user)) {
    // TypeScript knows user is AdminUser here
    console.log(user.permissions);
  }
}
```

## Error Handling

### 1. Custom Error Types

```typescript
class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateUser(user: User): void {
  if (!user.email.includes("@")) {
    throw new ValidationError("email", "Invalid email format");
  }
}
```

### 2. Result Type Pattern

```typescript
type Result<T, E = Error> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: E;
    };

async function fetchUser(id: number): Promise<Result<User>> {
  try {
    const response = await api.get(`/users/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

## React with TypeScript

### 1. Component Props

```typescript
interface ButtonProps {
  variant: "primary" | "secondary";
  size: "small" | "medium" | "large";
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  onClick,
  children,
}) => {
  // Component implementation
};
```

### 2. Custom Hooks

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

## Testing with TypeScript

### 1. Jest with TypeScript

```typescript
describe("UserService", () => {
  it("should create a new user", async () => {
    const user: User = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    };

    const result = await createUser(user);
    expect(result).toEqual(user);
  });
});
```

### 2. Mocking

```typescript
const mockApi = {
  get: jest.fn<Promise<User>, [string]>(),
  post: jest.fn<Promise<User>, [string, Partial<User>]>(),
};
```

## Conclusion

Following these TypeScript best practices will help you write more maintainable, type-safe, and robust applications. Remember that TypeScript is a tool to help you catch errors early and provide better developer experience, so use it wisely and consistently throughout your project.
