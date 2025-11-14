# Device Identification & Per-Device Settings

This document explains how device identification works in the CLI and how users can configure device-specific settings.

## Overview

When users authenticate with the CLI, the system automatically identifies their device based on:
- **Hostname**: The machine's network hostname
- **Platform**: Operating system (macOS, Windows, Linux, etc.)
- **Username**: The current system user

These values are hashed together to create a unique, stable **Device ID** that identifies the device across CLI sessions.

## Benefits

With device identification, users can:
1. **Track which devices they've logged in from**
2. **Configure device-specific settings** (e.g., different default working directories per machine)
3. **See when each device was last used**
4. **Manage authentication tokens per device**

## Device-Specific Settings

### Working Directory

Each device can have its own default working directory. This is useful when:
- Working on the same project from multiple machines
- Each machine has the project in a different location
- Different environments (laptop vs. desktop) require different paths

## CLI Commands

### View Current Device Info

```bash
commis whoami
```

Shows your user information and current device details:
```
👤 Current User
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Name:  John Doe
  Email: john@example.com
  ID:    j_1234567890

📱 Current Device
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Device:            MacBook-Pro (macOS)
  Device ID:         a1b2c3d4e5f6g7h8
  Working Directory: /Users/john/projects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### View Device Configuration

```bash
commis config
# or
commis config show
```

Shows the configuration for the current device:
```
📱 Current Device
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Device ID:         a1b2c3d4e5f6g7h8
  Device Name:       MacBook-Pro (macOS)
  Hostname:          MacBook-Pro.local
  Platform:          darwin
  Working Directory: /Users/john/projects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Set Working Directory

```bash
commis config set workdir /path/to/your/project
# or
commis config set working-directory /path/to/your/project
```

Sets the default working directory for the current device.

### Get Working Directory

```bash
commis config get workdir
# or
commis config get working-directory
```

Prints the working directory for the current device (if set).

### List All Devices

```bash
commis devices
```

Shows all devices you've logged in from:
```
📱 Your Devices
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
● MacBook-Pro (macOS)
  Device ID: a1b2c3d4e5f6g7h8
  Hostname:  MacBook-Pro.local
  Platform:  darwin
  Last used: 11/14/2025, 3:45:00 PM

  Desktop-PC (Windows)
  Device ID: b2c3d4e5f6g7h8i9
  Hostname:  DESKTOP-PC
  Platform:  win32
  Last used: 11/10/2025, 9:30:00 AM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
● = Current device
```

## How Device Identification Works

### During Login

When you run `commis login`, the CLI:

1. **Collects device information**:
   - Hostname from `os.hostname()`
   - Platform from `os.platform()`
   - Username from `os.userInfo().username`

2. **Generates a stable Device ID**:
   - Creates a SHA-256 hash of `${hostname}-${platform}-${username}`
   - Truncates to 16 characters for readability
   - This ID stays the same across logins on the same device

3. **Sends device info to the server**:
   - Device ID, device name, hostname, and platform
   - Stored alongside the API token

4. **Creates a friendly device name**:
   - Format: `${hostname} (${platform})`
   - Example: `MacBook-Pro (macOS)`

### During API Calls

When you use the CLI:

1. **Token verification** includes device info
2. **Last used timestamp** is updated automatically
3. **Device-specific settings** are retrieved (e.g., working directory)

## Database Schema

### API Tokens Table

```typescript
{
  userId: Id<"users">,
  token: string,              // Hashed access token
  refreshToken: string,       // Hashed refresh token
  name: string,               // Device name
  expiresAt: number,
  refreshExpiresAt: number,
  lastUsedAt: number,         // Updated on each use
  
  // Device identification fields
  deviceId: string,           // Unique device identifier
  deviceName: string,         // Friendly device name
  deviceHostname: string,     // Machine hostname
  devicePlatform: string,     // OS platform
}
```

### User Working Directories Table

```typescript
{
  userId: Id<"users">,
  device: string,             // Device ID
  directory: string,          // Working directory path
}
```

**Index**: `userId_device` on `(userId, device)` for fast lookups

## API Functions

### Queries

- `users/deviceQuery.getWorkingDirectory(deviceId)` - Get working dir for a device
- `users/deviceQuery.getAllWorkingDirectories()` - Get all working dirs for user
- `users/deviceQuery.getDevices()` - Get all devices for user

### Mutations

- `users/mutation.setWorkingDirectory(deviceId, directory)` - Set/update working dir
- `users/mutation.deleteWorkingDirectory(deviceId)` - Remove working dir

## Example Use Cases

### Case 1: Multi-Machine Development

You work on a project from three different machines:

```bash
# On your laptop
commis login
commis config set workdir /Users/you/dev/project

# On your desktop at home
commis login
commis config set workdir /home/you/projects/project

# On your work desktop
commis login
commis config set workdir /Users/you/work/project
```

Now when you run CLI commands, each machine uses its own working directory automatically.

### Case 2: Checking Device Activity

See when and where you've been logged in:

```bash
commis devices
```

This shows all your devices and when each was last used, helping you:
- Track active sessions
- Identify unfamiliar devices
- See your activity across machines

## Security Considerations

1. **Device ID is deterministic**: Same machine = same ID across logins
2. **Token per device**: Each device has its own API token
3. **Last used tracking**: Monitor device activity
4. **Token rotation**: Refresh tokens rotate on each refresh for enhanced security

## Future Enhancements

Potential additions to this system:
- Device revocation (logout specific devices remotely)
- Device nicknames/custom names
- More device-specific settings (Git config, editor preferences, etc.)
- Push notifications to verify new device logins
- Geographic location tracking (with user consent)

## Technical Implementation

### CLI Side

**File**: `apps/cli/src/utils/device.ts`

Key functions:
- `getDeviceInfo()` - Collects device information
- `getDeviceId()` - Returns current device ID
- `getWorkingDirectory()` - Fetches working directory from API
- `setWorkingDirectory(path)` - Updates working directory via API
- `getDevices()` - Lists all user devices

### API Side

**Files**:
- `packages/api/src/convex/apiTokens/table.ts` - Token schema with device fields
- `packages/api/src/convex/users/table.ts` - Working directories schema
- `packages/api/src/convex/users/deviceQuery.ts` - Device queries
- `packages/api/src/convex/users/mutation.ts` - Device mutations
- `packages/api/src/convex/cliAuth/mutation.ts` - Enhanced with device info

Key changes:
- `pollDeviceCode()` accepts optional `deviceInfo` parameter
- `verifyToken()` returns user with device information
- New queries/mutations for device management

