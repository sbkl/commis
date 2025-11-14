# Device Identification - Quick Start Guide

## What's New?

Your CLI now automatically identifies which device you're using and allows you to set device-specific settings like default working directories!

## Quick Commands

### 1. Login (now with device tracking!)

```bash
commis login
```

When you log in, the CLI will:
- Automatically detect your device
- Store device information (hostname, platform, etc.)
- Display: "Device: MacBook-Pro (macOS)"

### 2. Check Your Device Info

```bash
commis whoami
```

Output:
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
  Working Directory: (not set)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Set Your Working Directory (per device)

```bash
commis config set workdir /path/to/your/project
```

This setting is **device-specific**! If you work from multiple machines, each can have its own default directory.

### 4. View Your Configuration

```bash
commis config show
```

### 5. List All Your Devices

```bash
commis devices
```

See all devices you've logged in from, with last used timestamps.

## Example: Multi-Machine Setup

**On your laptop:**
```bash
commis login
commis config set workdir /Users/you/dev/myproject
```

**On your desktop:**
```bash
commis login
commis config set workdir /home/you/projects/myproject
```

Now when you run `commis dev` or other commands, each machine will use its own configured working directory!

## Device ID

Your device is identified by a unique ID generated from:
- Your machine's hostname
- Operating system
- System username

This ID stays the same across logins, so your settings persist!

## Benefits

✅ **Track your devices** - See all machines you've logged in from  
✅ **Device-specific settings** - Different working directories per machine  
✅ **Security** - Monitor when and where you've been logged in  
✅ **Convenience** - No need to configure paths every time  

## Available Config Keys

Currently supported:
- `workdir` or `working-directory` - Default working directory for this device

More settings coming soon!

## For More Details

See [DEVICE_IDENTIFICATION.md](./DEVICE_IDENTIFICATION.md) for complete technical documentation.

