# Planetary Defense Command

Planetary Defense Command is a browser-based tower defense and boss intercept game built as a single-page HTML5 canvas app. The game supports mobile install flows, responsive touch controls, orbital satellite deployment, boss rounds, Command Directives, texture and sprite assets, background music, and an in-game encyclopedia.

## Current Version

Current game version: `Alpha 0.9.4.71`

The project now uses an alpha version of modified semantic versioning:

- `Alpha`: Current release channel. This label stays before the version while the game is pre-launch.
- `MAJOR`: Launch and milestone state. `0` means alpha/pre-launch.
- `MINOR`: Major game content or system updates.
- `PATCH`: Balance, UI, documentation, and bug-fix updates.
- `BUILD`: Total project build counter. This continues upward and does not reset by date.

The prior date-based version was `2026.05.29.67`. The build counter was preserved and continues upward, so the current version is `Alpha 0.9.4.71`.

## Running Locally

Use a local HTTP server instead of opening `index.html` directly. Browser PWA features such as the manifest and service worker are blocked from `file://` URLs.

```bash
python3 -m http.server 8765
```

Then open:

```text
http://127.0.0.1:8765/index.html
```

## Main Files

- `index.html`: Main game UI, rendering loop, gameplay logic, title menu, boss mode, directives, and encyclopedia.
- `styles.css`: Shared CSS, loading screen, PWA safe-area adjustments, and visual effects.
- `sw.js`: Service worker cache list and update behavior.
- `version.json`: Version endpoint used by the app update check.
- `manifest.webmanifest`: PWA metadata.
- `elements/`: Sprites, icons, textures, and music assets.

## Patch History

These notes reconstruct the visible project history from the development thread. Earlier builds did not have formal release notes, so this list is maintained from build `47` forward.

### Alpha 0.9.4.71

- Removed the seconds suffix from satellite speed stats so it is easier to read.

### Alpha 0.9.3.70

- Satellite stat panels now show upgraded base stats plus separate directive bonus deltas.

### Alpha 0.9.2.69

- Locked the main game loop to a normalized 60 FPS cadence so gameplay speed stays consistent on high-refresh displays.

### Alpha 0.9.1.68

- Changed the game version convention to `Alpha Major.Minor.Patch.Build`.
- Command Directive reward cards now show only the next level number.
- Added this README with project structure, run instructions, and patch history.
- Expanded the in-game Patch Notes menu with prior build notes.

### Alpha 0.9.0.67

- Added the Patch Notes title-menu option.
- Consolidated satellite upgrades into one upgrade path with one cost and max level 10.
- Added satellite level badges above deployed sprites.
- Added active stat bonus display to the satellite inspector.
- Added a clearer `Choose One` divider to the Command Directive reward screen.
- Moved the first deployment guide above the planet so it remains visible.

### Alpha 0.8.4.66

- Smoothed the outro timing of the wave start/end event animation.

### Alpha 0.8.4.65

- Revised the wave event animation style to make wave start and wave clear states easier to read.

### Alpha 0.8.3.64

- Removed the duplicate desktop wave button in the upper-right HUD.
- Changed the desktop wave button copy to `Start Next Wave` and made it yellow-orange.
- Removed redundant top credit display on desktop and retained the bottom credit display.
- Added stronger wave start and wave end feedback.

### Alpha 0.8.2.63

- Reduced flicker risk from background and foreground canvas effects.
- Delayed boss fly-out until the boss explosion sequence finishes.
- Added a higher-energy entrance animation for Command Directive card selection.

### Alpha 0.8.1.62

- Enhanced the boss destruction sequence with multiple explosions.
- Added player ship fly-out after a boss is destroyed.
- Added a congratulatory story briefing above directive selection.

### Alpha 0.8.0.61

- Added a first-open tutorial tour for Master Command Center panels.
- Made the planet access tooltip appear only once while allowing red notices to repeat.

### Alpha 0.7.6.60

- Fixed title-menu interaction regressions.

### Alpha 0.7.5.59

- Restored essential HUD access after initial onboarding changes.
- Ensured the player can see credits and start a wave after deploying satellites.

### Alpha 0.7.4.58

- Changed first-run onboarding so the player is guided to build satellites first.
- Added red max-slot notice instructing the player to use the planet/Master Command Center to add slots.
- Improved deployment-mode empty-slot animation.
- Added first-deploy `Deploy here!` guidance.
- Added boss destruction notice before reward flow.

### Alpha 0.7.3.57

- Added earlier splash/loading visibility to reduce the black-screen period on mobile launch.

### Alpha 0.7.2.56

- Fixed boss round HUD and red notice overlap with the play area.

### Alpha 0.7.1.55

- Temporarily hides unresolved onboarding tooltips while deployment mode is active, then restores them afterward if still unresolved.

### Alpha 0.7.0.54

- Boss round mobile controls now allow drag movement from anywhere in the play area.
- Tooltips hide during active waves and return afterward only if unresolved.

### Alpha 0.6.3.53

- Adjusted Space Encyclopedia safe-area spacing on mobile so it avoids the notch, clock, and battery region.

### Alpha 0.6.2.52

- Starts `Blackout_Velocity.mp3` when the title screen loads.

### Alpha 0.6.1.51

- Added background music support.
- Uses `Blackout_Velocity.mp3` for default gameplay and `Hull_Breach_Alarm.mp3` for boss fights.

### Alpha 0.6.0.50

- Added visible game version text to the title screen.
- Removed extra title-menu description text under Space Encyclopedia.
- Removed `Dense Formation Tactics`.
- Rephrased directive descriptions to match implemented mechanics.

### Alpha 0.5.0.49

- Added Space Encyclopedia entries for satellites, rock enemies, ships, bosses, and Command Directives.
- Expanded the encyclopedia to use more screen space on desktop and mobile.
- Added menu buttons for easier encyclopedia browsing.

### Alpha 0.4.0.48

- Implemented Command Directives from the CSV source.
- Added directive rarity, level-up behavior, max level 5, and boss reward selection.
- Added Command Directives to Master Command Center.
- Changed directive display to show rarity without tier labeling.
- Added boss-failure flow that returns the player to base without reward cards.

### Alpha 0.3.0.47

- Introduced boss-round gameplay prototype.
- Added boss ships, player-fighter control, boss HP bar, boss rewards, and transition back to defense mode.
- Started the persistent build counter after replacing date-only versioning.

## Asset Notes

Primary assets are loaded from `elements/`, including:

- Planet textures: `earth-texture.png`, `vulcan-texture.png`, `toxic-texture.png`, `frost-texture.png`
- Satellite sprites: `turret.png`, `plasma.png`, `missile.png`, `railgun.png`, `laser-sentry.png`, `lightning-sentry.png`, `magnet-sentry.png`
- Enemy sprites: `meteoroid.png`, `meteor.png`, `asteroid.png`, `comet.png`, `scout-fighter.png`, `void-swarmer.png`, `armored-cruiser.png`, `void-harvester.png`
- Player ship: `player-fighter.png`
- Audio: `Blackout_Velocity.mp3`, `Hull_Breach_Alarm.mp3`
- PWA icons: `pd_icon.png`, `favicon.ico`, and `elements/icons/`
