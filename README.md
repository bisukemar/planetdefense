# Planetary Defense Command

Planetary Defense Command is a browser-based tower defense and boss intercept game built as a single-page HTML5 canvas app. The game supports mobile install flows, responsive touch controls, orbital satellite deployment, boss rounds, Command Directives, texture and sprite assets, background music, and an in-game encyclopedia.

## Current Version

Current game version: `Alpha 0.9.70.137`

The project now uses an alpha version of modified semantic versioning:

- `Alpha`: Current release channel. This label stays before the version while the game is pre-launch.
- `MAJOR`: Launch and milestone state. `0` means alpha/pre-launch.
- `MINOR`: Major game content or system updates.
- `PATCH`: Balance, UI, documentation, and bug-fix updates.
- `BUILD`: Total project build counter. This continues upward and does not reset by date.

The prior date-based version was `2026.05.29.67`. The build counter was preserved and continues upward, so the current version is `Alpha 0.9.32.99`.

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

### Alpha 0.9.70.137

- Aligned the Mini-Boss warning banner vertically with the other game notices.

### Alpha 0.9.69.136

- Fixed warning banner centering issue caused by animation transform overrides.
- Removed the ghosting animation (debris persistence) of killed enemies.

### Alpha 0.9.68.135

- Restored the missing Research Lab UI panel that was accidentally removed in a previous patch.

### Alpha 0.9.67.134

- Tactical Abilities (Orbital Strike, EMP, Shield Surge) are now unlocked individually in Master Command.
- Fixed a bug where Research Lab buttons were unresponsive to touch input.

### Alpha 0.9.66.133

- Tactical Abilities are now hidden at the start of a run and must be unlocked through the Master Command Center.

### Alpha 0.9.65.132

- Fixed a silent object-null crash that prevented the Research Lab button from opening when loading older save files.
- Fixed an undeclared speed variable that caused the game to completely freeze when deploying Tactical Abilities or generating debris.

### Alpha 0.9.63.130

- Added Research Lab for persistent meta-progression using Cosmic Data.
- Added Active Tactical Abilities (Orbital Laser, EMP, Surge) during defense waves.
- Added Deep Space Anomalies (Rogue Comets, Smuggler Ships) to mid-wave events.
- Added satellite damage states (smoking/sparking), destroyed debris persistence, and warp tunnel visual effects.

### Alpha 0.9.62.129

- Added a continuous, pulsing red visual warning overlay when the planet core or player fighter drops below 30% health.

### Alpha 0.9.61.128

- Adjusted planet shield visual thickness based on its current health. The shield is now invisible when depleted.

### Alpha 0.9.60.127

- Added a blue vignette overlay to indicate when the planet shield takes damage.

### Alpha 0.9.59.126

- Added a red visual vignette overlay to indicate when the planet core or the player fighter takes damage.

### Alpha 0.9.58.125

- Added an "Explosion/Screen Shake Intensity" slider to the Visuals & Gameplay settings menu to allow players to customize or disable screen shake.

### Alpha 0.9.57.124

- Added a dynamic screen shake effect when the planet core or shields take damage to drastically improve impact feel.

### Alpha 0.9.56.123

- Added a pulsing outline to the Proton Shield button during Boss Intercepts to clearly indicate when it is available for use.

### Alpha 0.9.55.122

- Added a visual shatter particle effect and audio cue when the Proton Shield expires instead of having it quietly fade away.

### Alpha 0.9.54.121

- Replaced Boss Intercept Dash with Proton Shield (one-time 3s invulnerability).
- Fixed hitbox misalignment causing unfair damage during boss encounters by perfectly centering the collision point exactly over the visual core.

### Alpha 0.9.53.120

- Redesigned Boss Intercept Dash to use directional velocity vectors instead of pointer interpolation, solving usability issues with mouse and drag controls.
- Added Double-Tap (Canvas) and Spacebar/Shift keyboard shortcuts to trigger Dash quickly without reaching for the UI button.

### Alpha 0.9.52.119

- Fixed an issue where the Mini-Boss warning banner was uncentered and completely hidden on mobile devices by migrating it into the global view space.

### Alpha 0.9.51.118

- Enhanced the active visual state of the Fast-Forward toggle to include a glowing background and pulsing icon.

### Alpha 0.9.50.117

- Shrank the player fighter collision hitbox during Boss Intercepts to a small central core, allowing for fair bullet-hell dodging.
- Added a visual glowing core to the player ship to clearly telegraph the vulnerable hitbox.

### Alpha 0.9.49.116

- Restored missing collision detection function that caused the game to freeze during defense waves.

### Alpha 0.9.47.114

- Added Player Phase Dash active ability to Boss Intercepts.
- Introduced Environmental Hazards (Solar Flares, Ion Storms, Debris Fields) that sporadically appear during defense waves to dynamically alter combat conditions.
- Added Fast-Forward (2x speed) toggle for defense waves.
- Refactored core game loop to cleanly separate physics updates from rendering.

### Alpha 0.9.46.113

- Lowered the attack range of the Void Harvester Mini-Boss.

### Alpha 0.9.45.112

- Added a heavily armored Vanguard Gatekeeper that must be defeated before the main Boss appears.
- Enhanced Boss Intercept minion swooping patterns with varied speeds and amplitudes.

### Alpha 0.9.44.111

- Optimized warp drive visual rendering logic to run smoother on low-end mobile devices.
- Added dynamic screen bounding to Boss Intercept enemy squads to prevent ships from spawning or sweeping off-screen on narrow devices.

### Alpha 0.9.43.110

- Added a "Warp Drive" visual effect to the cosmic background during Boss Intercepts.
- Enemy ships in the Boss Intercept minion phase now spawn in varied tactical formations (V-shape, walls, diagonals) rather than one by one, and utilize sweeping lateral movements.

### Alpha 0.9.42.109

- Replaced modulo-based boss collision with an invulnerability frame (i-frame) system, ensuring direct hits and grazing always damage the player immediately.

### Alpha 0.9.41.108

- Buffed Boss HP and implemented a multi-layered boss health bar to show the total remaining health pools.
- Added a new Boss Dive Attack mechanic where bosses periodically telegraph a path and sweep downwards, damaging the player on collision.
- Hostile escort ships during boss waves now periodically fire down at the player while moving.

### Alpha 0.9.40.107

- Added Space Encyclopedia access to the Pause Menu.
- Removed Dev Mode from the Pause Menu settings.

### Alpha 0.9.39.106

- Changed cost and salvage displays in the UI to show base values with the (+/-) modifiers appended explicitly instead of showing pre-calculated totals.

### Alpha 0.9.38.105

- Fixed legibility of cost penalty and bonus text on dynamic button backgrounds (Repair & Upgrade buttons).

### Alpha 0.9.37.104

- Added middle (+25%) and outer (+50%) orbit penalties to Satellite Upgrade Costs so the increased distance penalty applies to enhancements.

### Alpha 0.9.36.103

- Added explicit `(+x)` and `(-x)` indicators to the repair, upgrade, and salvage buttons to clearly show the impact of orbit placement modifiers and Command Directives.
- Increased repair costs for middle (+25%) and outer (+50%) orbits. Reduced salvage returns for middle (-15%) and outer (-30%) orbits.

### Alpha 0.9.35.102

- Completely separated and fixed the standalone Pause Menu Settings panel to resolve conflicts with the title screen.

### Alpha 0.9.34.101

- Fixed z-index layering bug and removed duplicated settings panel preventing it from appearing over the Pause Menu.
- Tighter button spacing and padding on the title screen menu.

### Alpha 0.9.33.100

- Reduced spacing and padding on title screen menu buttons for a tighter layout.

### Alpha 0.9.32.99

- Fixed z-index layering bug preventing the Settings panel from appearing over the Pause Menu.
- Improved spacing, padding, and font weight of the title screen menu buttons.

### Alpha 0.9.32.99

- Fixed z-index layering bug and removed duplicated settings panel preventing it from appearing over the Pause Menu.
- Tighter button spacing and padding on the title screen menu.

### Alpha 0.9.32.99

- Fixed z-index layering bug and removed duplicated settings panel preventing it from appearing over the Pause Menu.
- Tighter button spacing and padding on the title screen menu.

### Alpha 0.9.31.98

- Fixed an issue where the redesigned Pause Menu HTML structure was not properly applied.

### Alpha 0.9.30.97

- Redesigned Pause Menu: Removed Audio System toggle and added a direct Settings button.

### Alpha 0.9.29.96

- Improved UI spacing and size for satellite inspector Previous/Next navigation buttons.

### Alpha 0.9.28.95

- Revised wave start sound effect to a "call to action" alert and the wave clear sound to a victorious arpeggio.

### Alpha 0.9.27.94

- Added custom sound effects for deploying satellites, wave start, wave clear, warnings, and destroying enemies.
- Replaced settings browser confirmation prompt with an in-game modal popup.

### Alpha 0.9.26.93

- Added Previous/Next navigation buttons to the satellite inspector panel to easily cycle through deployed satellites within the same orbit.

### Alpha 0.9.25.92

- Nerfed the Void Harvester Mini-Boss (reduced health, damage, and fire rate).

### Alpha 0.9.24.91

- Mini-Bosses now prioritize targeting satellites with their special attacks before striking the Earth.
- Escort ships now spawn strictly in front and at the sides of the Mini-Boss.

### Alpha 0.9.23.90

- Fixed Mini-Boss wave warning banner animation glitch.
- Escorts now spawn directly beside the Mini-Boss and maintain a fixed formation without revolving.

### Alpha 0.9.22.89

- Extended the duration of the Mini-Boss warning banner to ensure visibility.
- Mini-Boss escorts now actively surround and follow the Mini-Boss.
- Mini-Bosses now attack satellites and the planet from range rather than crashing.
- Added a periodic heavy special attack for Mini-Bosses.

### Alpha 0.9.21.88

- Added Mini-Boss enemy classification. Mini-Bosses now reliably spawn with escort formations on the waves immediately preceding a Boss Round.

### Alpha 0.9.20.87

- Changed Master Command's orbit expansion and unlock button text to clearly state "DISABLED WHILE UNDER ATTACK" during active defense waves.

### Alpha 0.9.19.86

- Added defensive weaknesses to satellites: Turrets/Missiles take extra damage from Rock collisions, Plasma/Railguns take extra damage from Ship attacks.

### Alpha 0.9.18.85

- Disabled building, salvaging, and upgrading satellites and orbits during active waves. Added notification when attempted.

### Alpha 0.9.17.84

- Adjusted satellite costs: Reduced Plasma Obliterator cost (220 -> 180) and increased Laser Sentry cost (200 -> 260) to better reflect their tactical value.

### Alpha 0.9.16.83

- Implemented Threat Budget system for balanced enemy generation.
- Added Specialized Thematic Waves and Veteran enemy variants for exponential difficulty scaling.
- Added cluster spawn formations and disabled deployment/building during active waves.

### Alpha 0.9.15.82

- Added "Eject Weapon" button during boss fights to let players discard a weapon enhancement and return to the basic attack.

### Alpha 0.9.14.81

- Gathered repair kits now persist between successful boss rounds but are lost upon defeat.
- Increased the chance of enemy ships dropping weapon enhancements to 25%.
- Ensured the boss action panel correctly hides when returning to planetary defense.

### Alpha 0.9.13.80

- Boss encounters now persist upon defeat; players must clear the same boss before advancing to the next.
- Added 10 distinct weapon enhancements dropped from enemy ships during Boss Intercept.
- Added consumable Repair Kits dropped from rocks during Boss Intercept.

### Alpha 0.9.12.79

- Boss Time Attack mode now spawns the boss immediately, bypassing the minion wave phase.

### Alpha 0.9.11.78

- Boss Time Attack mode now displays the boss special attack prominently and returns to the menu upon completion.

### Alpha 0.9.10.77

- Added Boss Time Attack mode to the main menu for testing specific boss encounters.

### Alpha 0.9.9.76

- Added distinct visual flash effects and particle bursts to telegraph when bosses use their special attacks.

### Alpha 0.9.8.75

- Revised boss battles to feature unique projectile patterns and periodic special attacks tailored to each boss ship.

### Alpha 0.9.7.74

- Replaced generic boss sprite with unique individual sprite files for each boss ship.

### Alpha 0.9.6.73

- Changed update behavior to only refresh the game on launch or in the main menu to prevent mid-game interruptions.

### Alpha 0.9.5.72

- Rebalanced satellites with unique structural specialties and vulnerabilities.
- Updated Space Encyclopedia to detail satellite strengths and weaknesses.
- Speed bonus stat improvements now display in green with negative values.
- Added dynamic empty slot warning overlay to the deployment drawer.

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
