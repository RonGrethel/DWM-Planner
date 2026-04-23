import cv2
import numpy as np
import os
import sys

def split_sprites(image_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    print(f"\nProcessing {image_path}...")
    
    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print(f"Error: Could not load image {image_path}. Check path and file format.")
        return

    print(f"Loaded sprite sheet, resolution: {img.shape}")

    # We must run floodFill on a 3-channel image
    bgr_img = img.copy()
    if len(bgr_img.shape) == 3 and bgr_img.shape[2] == 4:
        bgr_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGRA2BGR)
    elif len(bgr_img.shape) == 2:
        bgr_img = cv2.cvtColor(bgr_img, cv2.COLOR_GRAY2BGR)

    # Use Flood Fill (Magic Wand) from the four corners to handle noise & antialiasing
    h, w = bgr_img.shape[:2]
    mask = np.zeros((h + 2, w + 2), np.uint8)

    # Tolerance for background color differences (handles jpeg noise)
    # Format is BGR (3 channels)
    tol = (40, 40, 40)

    # Flood fill from all four corners just in case one is blocked
    corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    for pt in corners:
        cv2.floodFill(bgr_img, mask, pt, (0, 0, 0), tol, tol, cv2.FLOODFILL_MASK_ONLY | (255 << 8) | 8)

    # Now convert the original image to 4-channels (BGRA) if it isn't
    if len(img.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGRA)
    elif len(img.shape) == 3 and img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

    # The floodFill mask is padded by 1px on all sides.
    # Where mask == 255, we set to transparent.
    img_mask = mask[1:-1, 1:-1]
    img[img_mask == 255] = [0, 0, 0, 0]

    # Now finding the shapes based completely on what is NOT transparent
    alpha = img[:, :, 3]
    _, thresh = cv2.threshold(alpha, 10, 255, cv2.THRESH_BINARY)

    # Close small gaps
    kernel = np.ones((5,5), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=1)
    closed = cv2.erode(dilated, kernel, iterations=1)

    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Sort top-left to bottom-right
    contours = sorted(contours, key=lambda c: (cv2.boundingRect(c)[1]//30, cv2.boundingRect(c)[0]))

    print(f"Detected {len(contours)} distinct shapes.")

    count = 1
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if w < 5 or h < 5: continue
            
        y1, y2 = max(0, y), min(img.shape[0], y + h)
        x1, x2 = max(0, x), min(img.shape[1], x + w)
        
        sprite = img[y1:y2, x1:x2]
        
        # Save as pure transparent PNG
        base_name = os.path.basename(image_path).replace('.png', '').replace(' ', '_').lower()
        out_path = os.path.join(output_dir, f"{base_name}_{count:02d}.png")
        cv2.imwrite(out_path, sprite)
        count += 1
        
    print(f"Successfully sliced and saved {count-1} completely transparent sprites into {output_dir}/")

if __name__ == "__main__":
    # If the user passes a folder or file via command line, parse it!
    # e.g.: py split_sprites.py "assets/Beast Family.png"
    if len(sys.argv) > 1:
        target = sys.argv[1]
        split_sprites(target, "assets/sprites/raw")
    else:
        # Default behavior just to be safe
        split_sprites("assets/Beast Family.png", "assets/sprites/raw_beasts")
