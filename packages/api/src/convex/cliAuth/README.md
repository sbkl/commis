# CLI Authentication Flow

This directory implements a device flow authentication system for the CLI, similar to how GitHub CLI and other command-line tools authenticate.

## How it works

1. **User runs `commis login`**
   - CLI calls `generateDeviceCode` mutation
   - Receives a user code (e.g., "ABC12345") and device code
   - Opens browser to `/auth/device?code=ABC12345`

2. **User verifies in browser**
   - Must be logged in via GitHub OAuth
   - Enters the code shown in terminal
   - Calls `verifyDeviceCode` mutation (protected)
   - Links the device code to their user ID

3. **CLI polls for verification**
   - Calls `pollDeviceCode` mutation every 5 seconds
   - Once verified, receives an API token
   - Stores token in `~/.commis/config.json`

4. **Future CLI commands**
   - Client automatically loads token from config
   - Uses token for authenticated requests

## Files

- `mutation.ts` - Device flow mutations (generate, verify, poll)
- `query.ts` - Device session queries
- `table.ts` - Schema for CLI auth sessions

## API Tokens

Generated tokens are stored in the `apiTokens` table and can be used to authenticate CLI requests without requiring OAuth flow every time.
