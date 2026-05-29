# Testing Guide for Developers

Quick reference for writing and running tests in the NextNotes application.

## Quick Start

```bash
# Run all tests
bun run test

# Watch mode (recommended while coding)
bun run test --watch

# Run specific test file
bun run test tests/lib/utils.test.ts

# Run tests matching a pattern
bun run test --grep "sanitizeTitle"

# Generate coverage report
bun run test:coverage

# Interactive UI
bun run test:ui
```

## Test File Structure

Create test files as `*.test.ts` in the `tests/` directory, mirroring the `lib/` structure:

```
lib/my-feature.ts       →       tests/lib/my-feature.test.ts
lib/utils.ts            →       tests/lib/utils.test.ts
```

## Writing a Test

### Basic Template

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("featureName", () => {
  beforeEach(() => {
    // Setup code runs before each test
  });

  it("should do something", () => {
    // Arrange: Set up test data
    const input = "test";

    // Act: Call the function
    const result = functionToTest(input);

    // Assert: Check the result
    expect(result).toBe("expected");
  });

  it("should handle edge cases", () => {
    expect(functionToTest("")).toBe(null);
  });
});
```

## Common Patterns

### Testing Validation Functions

```typescript
describe("isValidEmail", () => {
  it("should accept valid emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user+tag@example.co.uk")).toBe(true);
  });

  it("should reject invalid emails", () => {
    expect(isValidEmail("invalid")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
  });
});
```

### Mocking Database Functions

```typescript
import { vi } from "vitest";

// At the top of your test file
vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
}));

import { get, run } from "@/lib/db";
const mockGet = get as ReturnType<typeof vi.fn>;

describe("getNoteById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should retrieve a note", () => {
    mockGet.mockReturnValue({ id: "123", title: "Test" });

    const result = getNoteById("user1", "123");

    expect(mockGet).toHaveBeenCalledWith(
      "SELECT * FROM notes WHERE id = ? AND user_id = ?",
      ["123", "user1"],
    );
    expect(result.title).toBe("Test");
  });
});
```

### Testing with Fake Timers

```typescript
import { vi } from "vitest";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should reset after time window", () => {
    checkRateLimit("user1");
    vi.advanceTimersByTime(15 * 60 * 1000); // 15 minutes
    expect(checkRateLimit("user1")).toBe(true);
  });
});
```

### Testing Error Cases

```typescript
it("should throw on invalid input", () => {
  expect(() => {
    functionThatThrows(null);
  }).toThrow("Invalid input");
});

it("should return null when not found", () => {
  mockGet.mockReturnValue(null);
  const result = getNoteById("user1", "nonexistent");
  expect(result).toBeNull();
});
```

## Assertion Reference

```typescript
// Equality
expect(value).toBe(5); // Strict equality (===)
expect(value).toEqual({ a: 1 }); // Deep equality
expect(value).toStrictEqual({ a: 1 }); // Strict deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.1 + 0.2);

// Strings
expect(value).toMatch(/regex/);
expect(value).toContain("substring");
expect(value).toHaveLength(3);

// Arrays/Objects
expect(array).toContain(item);
expect(array).toHaveLength(3);
expect(obj).toHaveProperty("key");
expect(obj).toHaveProperty("key", value);

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(3);
expect(mockFn).toHaveReturnedWith(value);

// Throws
expect(fn).toThrow();
expect(fn).toThrow("message");
expect(fn).toThrow(Error);
```

## Testing Checklist

Before committing code with changes to `lib/`:

- [ ] Created corresponding `.test.ts` file
- [ ] Tests cover happy path (normal use)
- [ ] Tests cover edge cases (empty strings, null, etc.)
- [ ] Tests cover error cases (invalid inputs, failures)
- [ ] All security checks are tested (user ID enforcement, input validation)
- [ ] All tests pass: `bun run test`
- [ ] No console errors or warnings
- [ ] Test file names follow pattern: `feature.test.ts`

## Common Mistakes to Avoid

### ❌ Not Clearing Mocks

```typescript
// Bad - mocks from previous tests affect this one
describe("test suite", () => {
  it("test 1", () => {
    mockFn.mockReturnValue("value1");
  });

  it("test 2", () => {
    // mockFn still returns "value1" from test 1!
  });
});

// Good - clear mocks in beforeEach
beforeEach(() => {
  vi.clearAllMocks();
});
```

### ❌ Testing Implementation Details

```typescript
// Bad - testing internal variable names
expect(internalVar).toBe(5);

// Good - testing public behavior
expect(publicFunction()).toBe(expectedResult);
```

### ❌ Not Isolating Tests

```typescript
// Bad - tests depend on each other
const globalState = [];
it("test 1", () => {
  globalState.push(1);
  expect(globalState).toHaveLength(1);
});
it("test 2", () => {
  expect(globalState).toHaveLength(1); // Fails! Has 1 from test 1
});

// Good - each test is independent
it("test 1", () => {
  const state = [];
  state.push(1);
  expect(state).toHaveLength(1);
});
it("test 2", () => {
  const state = [];
  expect(state).toHaveLength(0);
});
```

### ❌ Testing Multiple Things at Once

```typescript
// Bad - test has multiple concerns
it("should create note and sanitize title and validate JSON", () => {
  const note = createNote("user1", {
    title: "<script>xss</script>",
    contentJson: "invalid",
  });
  expect(note.title).toBe("scriptxss/script");
  expect(note.content_json).toBe('{"type":"doc","content":[]}');
});

// Good - separate concerns
it("should sanitize title when creating note", () => {
  // ...
});

it("should validate content JSON when creating note", () => {
  // ...
});
```

## Debugging Tests

### Run Single Test

```bash
bun run test tests/lib/utils.test.ts
```

### Run Tests Matching Pattern

```bash
bun run test --grep "sanitizeTitle"
```

### Interactive Debug

```bash
bun run test --inspect-brk
```

### Print Debug Information

```typescript
it("should debug", () => {
  const result = functionToTest("input");
  console.log("Result:", result); // Use regular console.log
  expect(result).toBe("expected");
});
```

Then run tests and check output.

### View Test File Coverage

```bash
bun run test:coverage
```

Opens HTML report in `coverage/` directory.

## Adding Tests to Existing Code

1. Identify untested functions in `lib/`
2. Create corresponding `.test.ts` file in `tests/lib/`
3. Write tests for all code paths
4. Run `bun run test` to verify
5. Commit with code changes

## Database Testing

For tests that need the database:

```typescript
import { getDb } from "@/lib/db";

beforeEach(() => {
  const db = getDb();
  // Database is fresh for each test (created in setup.ts)
});

// Tests can read/write to database
// Automatically cleaned up after test suite completes
```

**Note**: Most tests should mock the database layer rather than use the real database for:

- Speed (no I/O)
- Isolation (tests don't affect each other)
- Determinism (no timing issues)

## Performance Tips

- Keep tests fast (< 1s total for all tests)
- Use `beforeEach` for common setup, not `beforeAll`
- Mock external dependencies (database, API, timers)
- Don't create large test data structures unless necessary

## Further Reading

- [Vitest Documentation](https://vitest.dev)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test Naming Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
