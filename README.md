# Maze Exploration Game

An interactive browser-based maze game where players guide a character through a clouded maze to find their way home.

## Features

- **3 Lives System**: Character has three chances to reach home
- **Flashlight Mechanic**: 3 flashlight uses, each lasting 10 seconds to reveal the maze
- **Fog of War**: Maze is hidden by clouds, with limited visibility during movement
- **Interactive Movement**: Guide the character by moving your mouse
- **Dead End Detection**: Hitting dead ends costs a life
- **Win/Lose Conditions**: Reach home to win, or fail if all flashlights are used or lives run out

## How to Play

1. Open `index.html` in a web browser
2. Click on the canvas to activate the flashlight (reveals maze for 10 seconds)
3. Study the maze paths carefully during flashlight time
4. After the flashlight expires, move your mouse to guide the character
5. The character will follow your mouse with a small visible radius
6. Avoid dead ends or you'll lose a life
7. Reach the house to win!

## Game Mechanics

- **Lives**: ❤️❤️❤️ (3 total)
- **Flashlight Uses**: 🔦🔦🔦 (3 total, 10 seconds each)
- **Character Vision**: Small radius around character during movement phase
- **Flashlight Vision**: Large circular area that follows mouse cursor

## Visual Design

- Background: Light brown (#D4A574)
- Maze Paths: White (#FFFFFF)
- Cloud Cover: Light blue (rgba(173, 216, 230, 0.95))
- Character: Gold sphere with eyes
- House: Brown building with roof

## Technical Details

Built with:
- HTML5 Canvas for rendering
- Vanilla JavaScript for game logic
- CSS3 for UI styling
- No external dependencies required

## Controls

- **Mouse Click**: Activate flashlight (when available)
- **Mouse Move**: Guide character during movement phase
- **Restart Button**: Appears on game over to restart

Enjoy exploring the maze!
