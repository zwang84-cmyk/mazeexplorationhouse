#!/usr/bin/env python3
"""Create maze and character images for the prototype."""

from PIL import Image, ImageDraw
import base64
import io

def create_maze_image():
    """Create the maze image matching the user's provided maze."""
    width, height = 1380, 910
    img = Image.new('RGB', (width, height), 'black')
    draw = ImageDraw.Draw(img)

    line_width = 8
    color = 'white'

    # Outer border with opening on right for exit
    margin = 30
    # Top border
    draw.line([(margin, margin), (width - margin, margin)], fill=color, width=line_width)
    # Left border
    draw.line([(margin, margin), (margin, height - margin)], fill=color, width=line_width)
    # Bottom border
    draw.line([(margin, height - margin), (width - margin, height - margin)], fill=color, width=line_width)
    # Right border with exit gap
    draw.line([(width - margin, margin), (width - margin, height - 180)], fill=color, width=line_width)
    draw.line([(width - margin, height - 120), (width - margin, height - margin)], fill=color, width=line_width)

    # Exit arrow
    arrow_x = width - 15
    arrow_y = height - 150
    draw.line([(arrow_x - 20, arrow_y), (arrow_x, arrow_y)], fill=color, width=3)
    draw.line([(arrow_x - 8, arrow_y - 8), (arrow_x, arrow_y)], fill=color, width=3)
    draw.line([(arrow_x - 8, arrow_y + 8), (arrow_x, arrow_y)], fill=color, width=3)

    # Internal maze walls - recreating the maze structure
    # Row 1 walls
    draw.line([(margin + 80, margin), (margin + 80, margin + 120)], fill=color, width=line_width)
    draw.line([(margin + 80, margin + 80), (margin + 200, margin + 80)], fill=color, width=line_width)
    draw.line([(margin + 160, margin), (margin + 160, margin + 80)], fill=color, width=line_width)
    draw.line([(margin + 200, margin + 80), (margin + 200, margin + 200)], fill=color, width=line_width)

    draw.line([(margin + 280, margin), (margin + 280, margin + 160)], fill=color, width=line_width)
    draw.line([(margin + 280, margin + 80), (margin + 360, margin + 80)], fill=color, width=line_width)
    draw.line([(margin + 360, margin + 80), (margin + 360, margin + 160)], fill=color, width=line_width)

    draw.line([(margin + 440, margin), (margin + 440, margin + 80)], fill=color, width=line_width)
    draw.line([(margin + 440, margin + 80), (margin + 560, margin + 80)], fill=color, width=line_width)
    draw.line([(margin + 520, margin), (margin + 520, margin + 80)], fill=color, width=line_width)

    draw.line([(margin + 600, margin), (margin + 600, margin + 160)], fill=color, width=line_width)
    draw.line([(margin + 600, margin + 80), (margin + 720, margin + 80)], fill=color, width=line_width)
    draw.line([(margin + 680, margin), (margin + 680, margin + 80)], fill=color, width=line_width)

    draw.line([(margin + 760, margin), (margin + 760, margin + 240)], fill=color, width=line_width)
    draw.line([(margin + 760, margin + 80), (margin + 880, margin + 80)], fill=color, width=line_width)

    draw.line([(margin + 920, margin), (margin + 920, margin + 160)], fill=color, width=line_width)
    draw.line([(margin + 920, margin + 80), (margin + 1040, margin + 80)], fill=color, width=line_width)
    draw.line([(margin + 1000, margin), (margin + 1000, margin + 80)], fill=color, width=line_width)

    draw.line([(margin + 1080, margin), (margin + 1080, margin + 240)], fill=color, width=line_width)
    draw.line([(margin + 1160, margin), (margin + 1160, margin + 80)], fill=color, width=line_width)
    draw.line([(margin + 1160, margin + 80), (margin + 1240, margin + 80)], fill=color, width=line_width)

    # Row 2 walls
    draw.line([(margin, margin + 160), (margin + 120, margin + 160)], fill=color, width=line_width)
    draw.line([(margin + 80, margin + 160), (margin + 80, margin + 320)], fill=color, width=line_width)
    draw.line([(margin + 80, margin + 240), (margin + 200, margin + 240)], fill=color, width=line_width)

    draw.line([(margin + 160, margin + 160), (margin + 160, margin + 240)], fill=color, width=line_width)
    draw.line([(margin + 160, margin + 160), (margin + 280, margin + 160)], fill=color, width=line_width)

    draw.line([(margin + 240, margin + 240), (margin + 240, margin + 320)], fill=color, width=line_width)
    draw.line([(margin + 240, margin + 240), (margin + 360, margin + 240)], fill=color, width=line_width)

    draw.line([(margin + 320, margin + 160), (margin + 320, margin + 240)], fill=color, width=line_width)
    draw.line([(margin + 320, margin + 160), (margin + 440, margin + 160)], fill=color, width=line_width)

    draw.line([(margin + 400, margin + 240), (margin + 400, margin + 400)], fill=color, width=line_width)
    draw.line([(margin + 400, margin + 240), (margin + 520, margin + 240)], fill=color, width=line_width)

    draw.line([(margin + 480, margin + 160), (margin + 480, margin + 240)], fill=color, width=line_width)
    draw.line([(margin + 480, margin + 160), (margin + 600, margin + 160)], fill=color, width=line_width)

    draw.line([(margin + 560, margin + 240), (margin + 560, margin + 320)], fill=color, width=line_width)
    draw.line([(margin + 560, margin + 240), (margin + 680, margin + 240)], fill=color, width=line_width)

    draw.line([(margin + 640, margin + 160), (margin + 640, margin + 240)], fill=color, width=line_width)
    draw.line([(margin + 640, margin + 160), (margin + 760, margin + 160)], fill=color, width=line_width)

    draw.line([(margin + 720, margin + 240), (margin + 720, margin + 320)], fill=color, width=line_width)
    draw.line([(margin + 720, margin + 240), (margin + 840, margin + 240)], fill=color, width=line_width)

    draw.line([(margin + 800, margin + 160), (margin + 800, margin + 240)], fill=color, width=line_width)
    draw.line([(margin + 800, margin + 160), (margin + 920, margin + 160)], fill=color, width=line_width)

    draw.line([(margin + 880, margin + 240), (margin + 880, margin + 400)], fill=color, width=line_width)
    draw.line([(margin + 880, margin + 240), (margin + 1000, margin + 240)], fill=color, width=line_width)

    draw.line([(margin + 960, margin + 160), (margin + 960, margin + 240)], fill=color, width=line_width)
    draw.line([(margin + 960, margin + 160), (margin + 1080, margin + 160)], fill=color, width=line_width)

    draw.line([(margin + 1040, margin + 240), (margin + 1040, margin + 320)], fill=color, width=line_width)
    draw.line([(margin + 1040, margin + 240), (margin + 1160, margin + 240)], fill=color, width=line_width)

    draw.line([(margin + 1120, margin + 160), (margin + 1120, margin + 240)], fill=color, width=line_width)
    draw.line([(margin + 1120, margin + 160), (width - margin, margin + 160)], fill=color, width=line_width)

    draw.line([(margin + 1200, margin + 240), (margin + 1200, margin + 400)], fill=color, width=line_width)
    draw.line([(margin + 1200, margin + 240), (width - margin, margin + 240)], fill=color, width=line_width)

    # Row 3 walls
    draw.line([(margin, margin + 320), (margin + 160, margin + 320)], fill=color, width=line_width)
    draw.line([(margin + 160, margin + 320), (margin + 160, margin + 480)], fill=color, width=line_width)

    draw.line([(margin + 240, margin + 320), (margin + 320, margin + 320)], fill=color, width=line_width)
    draw.line([(margin + 320, margin + 320), (margin + 320, margin + 400)], fill=color, width=line_width)

    draw.line([(margin + 160, margin + 400), (margin + 320, margin + 400)], fill=color, width=line_width)

    draw.line([(margin + 480, margin + 320), (margin + 480, margin + 480)], fill=color, width=line_width)
    draw.line([(margin + 480, margin + 320), (margin + 560, margin + 320)], fill=color, width=line_width)

    draw.line([(margin + 560, margin + 400), (margin + 640, margin + 400)], fill=color, width=line_width)
    draw.line([(margin + 640, margin + 320), (margin + 640, margin + 400)], fill=color, width=line_width)

    draw.line([(margin + 640, margin + 320), (margin + 800, margin + 320)], fill=color, width=line_width)
    draw.line([(margin + 800, margin + 320), (margin + 800, margin + 480)], fill=color, width=line_width)

    draw.line([(margin + 720, margin + 400), (margin + 800, margin + 400)], fill=color, width=line_width)

    draw.line([(margin + 960, margin + 320), (margin + 960, margin + 400)], fill=color, width=line_width)
    draw.line([(margin + 960, margin + 320), (margin + 1040, margin + 320)], fill=color, width=line_width)

    draw.line([(margin + 880, margin + 400), (margin + 960, margin + 400)], fill=color, width=line_width)

    draw.line([(margin + 1040, margin + 400), (margin + 1120, margin + 400)], fill=color, width=line_width)
    draw.line([(margin + 1120, margin + 320), (margin + 1120, margin + 400)], fill=color, width=line_width)

    draw.line([(margin + 1120, margin + 320), (width - margin, margin + 320)], fill=color, width=line_width)

    # Row 4 walls
    draw.line([(margin, margin + 480), (margin + 80, margin + 480)], fill=color, width=line_width)
    draw.line([(margin + 80, margin + 400), (margin + 80, margin + 560)], fill=color, width=line_width)

    draw.line([(margin + 240, margin + 480), (margin + 400, margin + 480)], fill=color, width=line_width)
    draw.line([(margin + 400, margin + 480), (margin + 400, margin + 560)], fill=color, width=line_width)

    draw.line([(margin + 320, margin + 480), (margin + 320, margin + 640)], fill=color, width=line_width)

    draw.line([(margin + 480, margin + 480), (margin + 560, margin + 480)], fill=color, width=line_width)
    draw.line([(margin + 560, margin + 480), (margin + 560, margin + 640)], fill=color, width=line_width)

    draw.line([(margin + 640, margin + 480), (margin + 720, margin + 480)], fill=color, width=line_width)
    draw.line([(margin + 720, margin + 480), (margin + 720, margin + 560)], fill=color, width=line_width)

    draw.line([(margin + 880, margin + 480), (margin + 1040, margin + 480)], fill=color, width=line_width)
    draw.line([(margin + 1040, margin + 480), (margin + 1040, margin + 640)], fill=color, width=line_width)

    draw.line([(margin + 960, margin + 480), (margin + 960, margin + 560)], fill=color, width=line_width)

    draw.line([(margin + 1120, margin + 480), (margin + 1200, margin + 480)], fill=color, width=line_width)
    draw.line([(margin + 1200, margin + 480), (margin + 1200, margin + 640)], fill=color, width=line_width)

    draw.line([(margin + 1280, margin + 400), (margin + 1280, margin + 560)], fill=color, width=line_width)
    draw.line([(margin + 1200, margin + 400), (margin + 1280, margin + 400)], fill=color, width=line_width)

    # Row 5 walls
    draw.line([(margin, margin + 560), (margin + 160, margin + 560)], fill=color, width=line_width)
    draw.line([(margin + 160, margin + 560), (margin + 160, margin + 720)], fill=color, width=line_width)

    draw.line([(margin + 80, margin + 640), (margin + 160, margin + 640)], fill=color, width=line_width)

    draw.line([(margin + 240, margin + 560), (margin + 320, margin + 560)], fill=color, width=line_width)

    draw.line([(margin + 400, margin + 560), (margin + 480, margin + 560)], fill=color, width=line_width)
    draw.line([(margin + 480, margin + 560), (margin + 480, margin + 720)], fill=color, width=line_width)

    draw.line([(margin + 640, margin + 560), (margin + 720, margin + 560)], fill=color, width=line_width)

    draw.line([(margin + 800, margin + 560), (margin + 880, margin + 560)], fill=color, width=line_width)
    draw.line([(margin + 880, margin + 560), (margin + 880, margin + 720)], fill=color, width=line_width)

    draw.line([(margin + 960, margin + 560), (margin + 1040, margin + 560)], fill=color, width=line_width)

    draw.line([(margin + 1120, margin + 560), (margin + 1200, margin + 560)], fill=color, width=line_width)

    draw.line([(margin + 1280, margin + 560), (width - margin, margin + 560)], fill=color, width=line_width)

    # Row 6 walls
    draw.line([(margin, margin + 640), (margin + 80, margin + 640)], fill=color, width=line_width)

    draw.line([(margin + 240, margin + 640), (margin + 320, margin + 640)], fill=color, width=line_width)
    draw.line([(margin + 240, margin + 640), (margin + 240, margin + 800)], fill=color, width=line_width)

    draw.line([(margin + 400, margin + 640), (margin + 480, margin + 640)], fill=color, width=line_width)

    draw.line([(margin + 560, margin + 640), (margin + 800, margin + 640)], fill=color, width=line_width)
    draw.line([(margin + 800, margin + 640), (margin + 800, margin + 720)], fill=color, width=line_width)

    draw.line([(margin + 640, margin + 640), (margin + 640, margin + 720)], fill=color, width=line_width)

    draw.line([(margin + 720, margin + 720), (margin + 800, margin + 720)], fill=color, width=line_width)

    draw.line([(margin + 960, margin + 640), (margin + 1040, margin + 640)], fill=color, width=line_width)
    draw.line([(margin + 1120, margin + 640), (margin + 1280, margin + 640)], fill=color, width=line_width)
    draw.line([(margin + 1280, margin + 640), (margin + 1280, margin + 800)], fill=color, width=line_width)

    # Row 7 walls
    draw.line([(margin, margin + 720), (margin + 160, margin + 720)], fill=color, width=line_width)

    draw.line([(margin + 320, margin + 720), (margin + 400, margin + 720)], fill=color, width=line_width)
    draw.line([(margin + 320, margin + 720), (margin + 320, margin + 800)], fill=color, width=line_width)

    draw.line([(margin + 480, margin + 720), (margin + 560, margin + 720)], fill=color, width=line_width)
    draw.line([(margin + 560, margin + 720), (margin + 560, margin + 800)], fill=color, width=line_width)

    draw.line([(margin + 880, margin + 720), (margin + 1040, margin + 720)], fill=color, width=line_width)
    draw.line([(margin + 1040, margin + 720), (margin + 1040, margin + 800)], fill=color, width=line_width)

    draw.line([(margin + 1120, margin + 720), (margin + 1200, margin + 720)], fill=color, width=line_width)
    draw.line([(margin + 1120, margin + 720), (margin + 1120, margin + 800)], fill=color, width=line_width)

    # Row 8 walls (near bottom)
    draw.line([(margin + 80, margin + 800), (margin + 240, margin + 800)], fill=color, width=line_width)
    draw.line([(margin + 80, margin + 720), (margin + 80, margin + 800)], fill=color, width=line_width)

    draw.line([(margin + 400, margin + 800), (margin + 560, margin + 800)], fill=color, width=line_width)
    draw.line([(margin + 400, margin + 720), (margin + 400, margin + 800)], fill=color, width=line_width)

    draw.line([(margin + 640, margin + 800), (margin + 880, margin + 800)], fill=color, width=line_width)
    draw.line([(margin + 640, margin + 720), (margin + 640, margin + 800)], fill=color, width=line_width)
    draw.line([(margin + 800, margin + 800), (margin + 800, height - margin)], fill=color, width=line_width)

    draw.line([(margin + 960, margin + 800), (margin + 1040, margin + 800)], fill=color, width=line_width)
    draw.line([(margin + 960, margin + 720), (margin + 960, margin + 800)], fill=color, width=line_width)

    draw.line([(margin + 1200, margin + 800), (margin + 1280, margin + 800)], fill=color, width=line_width)
    draw.line([(margin + 1200, margin + 720), (margin + 1200, margin + 800)], fill=color, width=line_width)

    return img

def create_character_image():
    """Create the character image (keyhole/ghost shape with eyes)."""
    width, height = 120, 140
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw the keyhole/ghost body shape
    # Large circle for head
    head_center = (60, 45)
    head_radius = 42
    draw.ellipse([head_center[0] - head_radius, head_center[1] - head_radius,
                  head_center[0] + head_radius, head_center[1] + head_radius],
                 fill='white')

    # Trapezoid body extending down
    body_points = [(25, 70), (95, 70), (105, 138), (15, 138)]
    draw.polygon(body_points, fill='white')

    # Draw eyes (black circles) - asymmetric like in the original
    # Left eye (slightly smaller and higher)
    left_eye_center = (42, 38)
    left_eye_radius = 12
    draw.ellipse([left_eye_center[0] - left_eye_radius, left_eye_center[1] - left_eye_radius,
                  left_eye_center[0] + left_eye_radius, left_eye_center[1] + left_eye_radius],
                 fill='black')

    # Right eye (slightly larger and lower)
    right_eye_center = (72, 45)
    right_eye_radius = 14
    draw.ellipse([right_eye_center[0] - right_eye_radius, right_eye_center[1] - right_eye_radius,
                  right_eye_center[0] + right_eye_radius, right_eye_center[1] + right_eye_radius],
                 fill='black')

    return img

def image_to_base64(img, format='PNG'):
    """Convert PIL Image to base64 data URI."""
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    mime = 'image/png' if format == 'PNG' else 'image/jpeg'
    return f'data:{mime};base64,{data}'

if __name__ == '__main__':
    # Create images
    maze_img = create_maze_image()
    char_img = create_character_image()

    # Save as files for verification
    maze_img.save('maze.png')
    char_img.save('character.png')

    print("Created maze.png and character.png")

    # Also output base64 for embedding
    maze_uri = image_to_base64(maze_img)
    char_uri = image_to_base64(char_img)

    print(f"Maze base64 length: {len(maze_uri)}")
    print(f"Character base64 length: {len(char_uri)}")
