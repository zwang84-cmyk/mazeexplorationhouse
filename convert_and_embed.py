#!/usr/bin/env python3
"""
One-time setup script to embed images into the HTML prototype.
Automatically finds maze.png and character.png in the current directory.

Usage: python3 convert_and_embed.py
"""

import base64
import os

def image_to_base64(filepath):
    """Convert an image file to base64 data URI."""
    ext = os.path.splitext(filepath)[1].lower()
    mime_types = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    }
    mime = mime_types.get(ext, 'image/png')

    with open(filepath, 'rb') as f:
        data = base64.b64encode(f.read()).decode('utf-8')

    return f'data:{mime};base64,{data}'

def find_image(base_name):
    """Find an image file with the given base name."""
    for ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
        path = base_name + ext
        if os.path.exists(path):
            return path
    return None

def generate_html(maze_data_uri, character_data_uri):
    """Generate the complete HTML with embedded images."""
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maze Exploration - Flashlight Prototype</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        html, body {{
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
            cursor: none;
        }}

        #maze-container {{
            position: relative;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #000;
        }}

        #maze-image {{
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            display: block;
        }}

        #flashlight-overlay {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            background: #000;
            mask-image: radial-gradient(circle 120px at var(--mouse-x, -200px) var(--mouse-y, -200px),
                transparent 0%,
                transparent 60%,
                rgba(0, 0, 0, 0.3) 80%,
                rgba(0, 0, 0, 0.7) 90%,
                black 100%);
            -webkit-mask-image: radial-gradient(circle 120px at var(--mouse-x, -200px) var(--mouse-y, -200px),
                transparent 0%,
                transparent 60%,
                rgba(0, 0, 0, 0.3) 80%,
                rgba(0, 0, 0, 0.7) 90%,
                black 100%);
        }}

        #custom-cursor {{
            position: fixed;
            width: 6px;
            height: 6px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 1000;
            display: block;
        }}

        #player {{
            position: fixed;
            height: 36px;
            width: auto;
            pointer-events: none;
            z-index: 50;
            transform: translate(-50%, -50%);
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
        }}
    </style>
</head>
<body>
    <div id="maze-container">
        <img id="maze-image" src="{maze_data_uri}" alt="Maze">
    </div>

    <img id="player" src="{character_data_uri}" alt="Player">

    <div id="flashlight-overlay"></div>
    <div id="custom-cursor"></div>

    <script>
        const overlay = document.getElementById('flashlight-overlay');
        const cursor = document.getElementById('custom-cursor');
        const player = document.getElementById('player');

        let mouseX = -200;
        let mouseY = -200;
        let targetX = -200;
        let targetY = -200;

        // Player position (start at center of screen)
        let playerX = window.innerWidth / 2;
        let playerY = window.innerHeight / 2;
        let playerVelX = 0;
        let playerVelY = 0;

        // Movement settings
        const moveSpeed = 3;
        const friction = 0.85;

        // Track pressed keys
        const keys = {{
            w: false,
            a: false,
            s: false,
            d: false
        }};

        // Smoothing factor
        const smoothing = 0.15;

        // Track mouse position
        document.addEventListener('mousemove', (e) => {{
            targetX = e.clientX;
            targetY = e.clientY;
        }});

        document.addEventListener('mouseleave', () => {{
            targetX = -200;
            targetY = -200;
        }});

        document.addEventListener('mouseenter', (e) => {{
            targetX = e.clientX;
            targetY = e.clientY;
            mouseX = targetX;
            mouseY = targetY;
        }});

        // Keyboard input
        document.addEventListener('keydown', (e) => {{
            const key = e.key.toLowerCase();
            if (key in keys) {{
                keys[key] = true;
                e.preventDefault();
            }}
        }});

        document.addEventListener('keyup', (e) => {{
            const key = e.key.toLowerCase();
            if (key in keys) {{
                keys[key] = false;
                e.preventDefault();
            }}
        }});

        // Animation loop
        function animate() {{
            mouseX += (targetX - mouseX) * smoothing;
            mouseY += (targetY - mouseY) * smoothing;

            overlay.style.setProperty('--mouse-x', `${{mouseX}}px`);
            overlay.style.setProperty('--mouse-y', `${{mouseY}}px`);

            cursor.style.left = `${{mouseX}}px`;
            cursor.style.top = `${{mouseY}}px`;

            if (keys.w) playerVelY -= moveSpeed;
            if (keys.s) playerVelY += moveSpeed;
            if (keys.a) playerVelX -= moveSpeed;
            if (keys.d) playerVelX += moveSpeed;

            playerVelX *= friction;
            playerVelY *= friction;

            playerX += playerVelX;
            playerY += playerVelY;

            player.style.left = `${{playerX}}px`;
            player.style.top = `${{playerY}}px`;

            requestAnimationFrame(animate);
        }}

        animate();
    </script>
</body>
</html>'''

if __name__ == '__main__':
    # Auto-find images
    maze_path = find_image('maze')
    char_path = find_image('character')

    if not maze_path:
        print("Save your maze image as 'maze.png' in this directory")
        exit(1)

    if not char_path:
        print("Save your character image as 'character.png' in this directory")
        exit(1)

    maze_uri = image_to_base64(maze_path)
    char_uri = image_to_base64(char_path)

    html = generate_html(maze_uri, char_uri)

    with open('index.html', 'w') as f:
        f.write(html)

    print("Done! Open index.html in a browser.")
