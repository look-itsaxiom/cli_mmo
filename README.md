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

## 📋 Project Status

This repository contains the complete **Game Design Document** and comprehensive **implementation guides** for building the CLI MMO from scratch using TypeScript.

### What's Included

- 📖 **[Game Design Document](./cli_mmo_gdd.md)** - Complete game mechanics and rules
- 🚀 **[Implementation Guide](./IMPLEMENTATION_GUIDE.md)** - Step-by-step development guide  
- ⚡ **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 30 minutes
- 🛠️ **[Resources & Examples](./RESOURCES.md)** - Code examples and utilities

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

## 🚀 Getting Started

### For Players
*Game not yet implemented - follow the guides below to build it!*

### For Developers

1. **Read the Game Design Document**: Start with [cli_mmo_gdd.md](./cli_mmo_gdd.md) to understand the game mechanics

2. **Follow the Quick Start**: Use [QUICK_START.md](./QUICK_START.md) to set up a basic development environment in 30 minutes

3. **Build the Full Game**: Follow the comprehensive [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for complete development

4. **Use Code Examples**: Reference [RESOURCES.md](./RESOURCES.md) for implementation examples and utilities

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

## 📅 Development Roadmap

The implementation is designed in phases:

### Phase 1: Foundation (Week 1)
- [ ] Project structure and TypeScript setup
- [ ] Database schema and basic server
- [ ] Authentication system
- [ ] Basic CLI framework

### Phase 2: Core Engine (Week 2-3)
- [ ] Tick system implementation
- [ ] Hexagonal grid mathematics
- [ ] Resource and territory systems
- [ ] Basic API endpoints

### Phase 3: Game Mechanics (Week 4-5)
- [ ] Territory claiming and disputes
- [ ] Building and research systems
- [ ] Military units and combat
- [ ] Morale and power score calculations

### Phase 4: Full Experience (Week 6-7)
- [ ] Complete CLI command set
- [ ] Rich output formatting
- [ ] Mail and social systems
- [ ] Data export capabilities

### Phase 5: Polish & Deploy (Week 8)
- [ ] Testing and bug fixes
- [ ] Performance optimization
- [ ] Distribution packaging
- [ ] Documentation completion

## 🤝 Contributing

This project is designed to be educational. Contributions are welcome in the form of:

- **Implementation improvements** to the guides
- **Code examples** and utilities
- **Documentation** enhancements
- **Testing strategies** and examples

Please read the guides first to understand the intended architecture and approach.

## 📚 Learning Outcomes

By following this project, you'll learn:

- **Game architecture** for real-time multiplayer systems
- **TypeScript** development with modern tooling
- **Database design** for complex game state
- **CLI development** with rich user experiences
- **API design** with authentication and rate limiting
- **Testing strategies** for game systems
- **Deployment** and distribution techniques

## 📄 License

This project is released under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Discord**: [Join the community](#) *(Coming soon)*
- **Documentation**: [Full implementation guide](./IMPLEMENTATION_GUIDE.md)
- **Support**: [Ko-fi](#) *(Coming soon)*

---

**Ready to build a CLI MMO?** Start with the [Quick Start Guide](./QUICK_START.md) and begin your journey into terminal-based game development!