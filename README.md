# CLI MMO

A terminal-based massively multiplayer online strategy game inspired by classic RTS mechanics, designed to be played entirely through the command line.

## 🎮 Game Overview

CLI MMO is a real-time strategy game where players:

- **Claim territories** on a hexagonal grid world
- **Gather resources** and construct buildings
- **Train armies** and engage in tactical combat
- **Research technologies** to advance their civilization
- **Form alliances** and engage in political intrigue

All gameplay happens through terminal commands, with rich ASCII art and carefully designed CLI interfaces.

## 🎯 Design Philosophy

### Core Principles

- **CLI-first**: The terminal is the primary interface
- **Real-time ticks**: 5-second game ticks drive all actions
- **Player-drawn maps**: Export data, let players create their own visualizations
- **Minimal social mechanics**: Politics emerge naturally from gameplay
- **Server authoritative**: All game state lives on the server

### Key Features

- **Hexagonal grid world** with diverse biomes and resources
- **Three unit types**: Warriors, Scouts, and Mages with rock-paper-scissors mechanics
- **Territory claiming system** with dispute resolution
- **Morale system** affecting production and combat effectiveness
- **Research trees** for military, economic, and social advancement
- **Rich CLI output** with ASCII art and formatted displays

## 🏗️ Architecture Overview

The game consists of three main components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLI Client    │────│   Game Server   │────│   Database      │
│                 │    │                 │    │                 │
│ • Commands      │    │ • REST API      │    │ • PostgreSQL    │
│ • Authentication│    │ • Tick Worker   │    │ • Game State    │
│ • Output Format │    │ • Game Engine   │    │ • Event Log     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL with Prisma ORM
- **CLI**: Commander.js with rich formatting
- **Real-time**: 5-second tick system with event logging
- **Authentication**: JWT with device-code flow

## 📊 Game Mechanics Overview

### World & Territory

- Fixed-size hexagonal grid (expandable between seasons)
- Six biomes: Forest, Plains, Hills, Mountains, Rivers
- Territory claiming with 5-minute windows and dispute resolution
- Building capacity system limiting construction per hex

### Resources & Economy

- Six resource types: Wood, Stone, Iron, Food, Gold, Ether
- Building construction with biome efficiency bonuses
- Research trees unlocking new capabilities
- Trade and supply line mechanics

### Military & Combat

- Three unit types with distinct roles:
  - **Warriors**: Balanced attack/defense
  - **Scouts**: High defense, extended vision
  - **Mages**: High attack, fragile
- Power Score calculations determining combat outcomes
- Troop organization and movement across distances

### Social Systems

- Player-to-player messaging with delivery delays
- Faction membership (join/leave freely)
- Bounty system for player elimination
- Minimal mechanical alliance systems (politics emerge socially)

## 🎨 CLI Experience

The game emphasizes rich terminal output with:

```
╔══════════════╗
║  HEXWORLD    ║  Season 34 • Tick 128 • UTC 12:03:15
╚══════════════╝
Welcome back, Skibby. Consider supporting development → ko-fi.com/…

[Report] Nation: Emberfold • Morale: High (72%) • Stock: W245 S180 I22 F320 G19 E7
Open Claims: 1 (13,-3) • Fronts: 0 • Unread Mail: 2

Progress lines:
[Tick 128] Build started: Lumbermill @ (12,-3) • ETA 25 ticks (2m05s)
```

### Command Examples

```bash
# Core gameplay commands
game login                           # Device-code authentication
game report                          # Dashboard overview
game scan --radius 3                # Explore nearby hexes
game claim 12,-3                     # Start territory claim
game gather wood --hex 11,-2         # Collect resources
game build farmstead --hex 12,-3     # Construct buildings
game train warrior --count 5         # Train military units

# Data export and automation
game export --what scan --csv        # Export map data
game batch < commands.json           # Execute multiple commands
```

## 📄 License

This project is released under the MIT License. See the [LICENSE](LICENSE) file for details.
