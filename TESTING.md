# Testing Guide

This project uses **Vitest** for unit testing with comprehensive coverage of key features.

## Test Setup

### Configuration
- **Config file**: `vitest.config.ts`
- **Setup file**: `tests/setup.ts` - Handles test database initialization and cleanup
- **Test database**: Uses a separate SQLite database (`data/test.db`) that's created and destroyed for each test run

### Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test --watch

# Run tests with UI
bun run test:ui

# Generate coverage report
bun run test:coverage
```

## Test Structure

Tests are organized by module in the `tests/` directory:

```
tests/
├── setup.ts                 # Global test setup
├── lib/
│   ├── utils.test.ts       # Utility functions (validation, sanitization)
│   ├── rate-limit.test.ts  # Rate limiting logic
│   └── notes.test.ts       # Note management functions
```

## Test Coverage

### Utility Functions (`lib/utils.ts`)
- **sanitizeTitle()** - Title validation and HTML tag removal
  - Trimming whitespace
  - Removing dangerous HTML characters (`<`, `>`)
  - Truncating to 255 characters
  - Normal title handling

- **validateContentJson()** - JSON content validation
  - Valid TipTap JSON parsing
  - Invalid JSON handling (defaults to empty doc)
  - Missing/invalid type field handling
  - Complex nested structures

- **isValidEmail()** - Email validation
  - Valid email formats
  - Invalid formats rejection
  - Length limit enforcement (255 chars)

- **isValidPassword()** - Password validation
  - Minimum 8 character requirement
  - Special character support

- **generatePublicSlug()** - Public slug generation
  - Unique slug generation
  - URL-safe format (uppercase alphanumeric)

### Rate Limiting (`lib/rate-limit.ts`)
- **checkRateLimit()** - Request rate limiting
  - Allowing initial requests
  - Enforcing 5 requests per 15-minute window
  - Blocking excess requests
  - Separate tracking per identifier (user/IP)
  - Window expiration handling
  - Partial window expiration logic

### Note Management (`lib/notes.ts`)
Tests use mocked database functions to test business logic in isolation.

- **createNote()**
  - Creating notes with title and content
  - Title sanitization
  - Default title handling
  - Content validation with defaults
  - Error handling for failed creation

- **getNoteById()**
  - Retrieving notes by ID
  - User ID enforcement
  - Null handling for non-existent notes

- **getNotesByUser()**
  - Retrieving all user notes
  - Empty result handling
  - Proper ordering (by updated_at DESC)

- **updateNote()**
  - Updating title and content
  - Partial updates (title only or content only)
  - User ID enforcement
  - Null handling for non-existent notes

- **deleteNote()**
  - Deleting notes by ID
  - User ID enforcement
  - Return value indicating success/failure

- **setNotePublic()**
  - Making notes public with slug generation
  - Making notes private (clearing slug)
  - User ID enforcement

- **getNoteByPublicSlug()**
  - Retrieving public notes by slug
  - Public status enforcement
  - Null handling

## Testing Strategy

### Unit Tests
Each function is tested in isolation with:
- **Happy path**: Normal use cases
- **Edge cases**: Empty inputs, boundary values
- **Error cases**: Invalid inputs, null/undefined handling
- **Security**: Input validation, user ID enforcement

### Mocking
- **Database functions**: Mocked in `notes.test.ts` to test business logic without database dependencies
- **Crypto functions**: Mocked for deterministic UUID generation in tests

### Database Testing
- **Setup**: Fresh test database created for each test run
- **Cleanup**: Automatic cleanup of test database files after tests complete
- **Isolation**: Tests run against isolated database state

## Adding New Tests

### Test File Template
```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("feature name", () => {
  beforeEach(() => {
    // Setup code
  });

  it("should do something", () => {
    // Arrange
    const input = "test";
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe("expected");
  });
});
```

### Best Practices
1. **Clear descriptions**: Use `describe()` and `it()` with clear, actionable descriptions
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
3. **One assertion concept per test**: Test one behavior per test case
4. **Mock external dependencies**: Use `vi.mock()` for database, file system, etc.
5. **Test user boundaries**: Ensure user_id checks are properly enforced
6. **Test edge cases**: Empty strings, null values, boundary conditions

## Continuous Integration

Tests are run during:
- Local development (watch mode recommended during coding)
- Pre-commit hooks (if configured)
- CI/CD pipeline before deployment

## Known Limitations

- Rate limiting tests use `vi.useFakeTimers()` - real time behavior not tested in production
- Database tests use a separate test database - doesn't test integration with actual production database
- Component tests not yet implemented - only testing pure functions and business logic

## Test Results

Current test status: ✅ **51 tests passing**

```
Test Files: 3 passed (3)
Tests: 51 passed (51)
Duration: ~525ms
```

See [TEST_SUMMARY.md](TEST_SUMMARY.md) for detailed breakdown.

## Future Improvements

- [ ] Component unit tests (React components with @testing-library/react)
- [ ] Integration tests (API routes with database)
- [ ] E2E tests (Playwright - already configured in tests/e2e/)
- [ ] Performance benchmarks
- [ ] Snapshot testing for TipTap JSON structures
