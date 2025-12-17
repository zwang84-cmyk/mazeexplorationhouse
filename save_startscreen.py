#!/usr/bin/env python3
"""Save start screen image and convert to base64."""

from PIL import Image, ImageDraw, ImageFont
import base64
import io

def create_start_screen():
    """Create the start screen matching the user's provided image."""
    width, height = 1380, 910
    img = Image.new('RGB', (width, height), 'black')
    draw = ImageDraw.Draw(img)

    # Draw decorative border
    border_color = 'white'
    margin = 25

    # Outer rectangle
    draw.rectangle([margin, margin, width - margin, height - margin], outline=border_color, width=3)

    # Corner decorations (bracket-like shapes)
    corner_size = 40
    corner_inset = 8

    # Top-left corner
    draw.line([(margin + corner_inset, margin + corner_size), (margin + corner_inset, margin + corner_inset), (margin + corner_size, margin + corner_inset)], fill=border_color, width=3)

    # Top-right corner
    draw.line([(width - margin - corner_size, margin + corner_inset), (width - margin - corner_inset, margin + corner_inset), (width - margin - corner_inset, margin + corner_size)], fill=border_color, width=3)

    # Bottom-left corner
    draw.line([(margin + corner_inset, height - margin - corner_size), (margin + corner_inset, height - margin - corner_inset), (margin + corner_size, height - margin - corner_inset)], fill=border_color, width=3)

    # Bottom-right corner
    draw.line([(width - margin - corner_size, height - margin - corner_inset), (width - margin - corner_inset, height - margin - corner_inset), (width - margin - corner_inset, height - margin - corner_size)], fill=border_color, width=3)

    return img

def image_to_base64(img, format='PNG'):
    """Convert PIL Image to base64 data URI."""
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    mime = 'image/png' if format == 'PNG' else 'image/jpeg'
    return f'data:{mime};base64,{data}'

if __name__ == '__main__':
    img = create_start_screen()
    img.save('startscreen.png')
    print("Created startscreen.png")
    uri = image_to_base64(img)
    print(f"Base64 length: {len(uri)}")
