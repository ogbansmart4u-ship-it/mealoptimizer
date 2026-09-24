import os
import shutil
import time
import cv2
import numpy as np
from PIL import Image, ImageSequence

BASE_DIR = r"c:\Users\ogban\OneDrive\Documents\GitHub\mealoptimizer\public\assets\mascot"
BACKUP_DIR = os.path.join(BASE_DIR, ".orig_backup")

TARGET_FILES = [
    "avo-idle.webp",
    "avo-wave.webp",
    "avo-thumbsup.webp",
    "avo-jump.webp",
    "avo-sad.webp",
]

def process_file(fname: str):
    src_path = os.path.join(BASE_DIR, fname)
    backup_path = os.path.join(BACKUP_DIR, fname)
    
    # Ensure backup exists from untouched original
    if not os.path.exists(backup_path):
        shutil.copy2(src_path, backup_path)
        print(f"Backed up {fname} -> {backup_path}")
    
    # We always read from backup to guarantee we start from pristine original
    im = Image.open(backup_path)
    durations = [frame.info.get("duration", 33) for frame in ImageSequence.Iterator(im)]
    loop = im.info.get("loop", 0)
    total_frames = getattr(im, "n_frames", 1)
    
    print(f"\nProcessing {fname} ({total_frames} frames)...")
    t0 = time.time()
    
    out_frames = []
    for f_idx, frame in enumerate(ImageSequence.Iterator(im)):
        rgb = np.array(frame.convert("RGB"))
        h, w = rgb.shape[:2]
        
        # Mask for flood fill (h+2, w+2)
        mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
        flags = 4 | cv2.FLOODFILL_MASK_ONLY | cv2.FLOODFILL_FIXED_RANGE | (255 << 8)
        
        # 1. Flood fill from 4 corners
        for pt in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
            if mask[pt[1] + 1, pt[0] + 1] == 0:
                cv2.floodFill(rgb, mask, pt, (0, 0, 0), loDiff=(25, 25, 25), upDiff=(25, 25, 25), flags=flags)
        
        # 2. Check borders for any dark background pockets
        for x in [0, w - 1]:
            for y in range(0, h, 16):
                if mask[y + 1, x + 1] == 0 and rgb[y, x].max() < 30:
                    cv2.floodFill(rgb, mask, (x, y), (0, 0, 0), loDiff=(25, 25, 25), upDiff=(25, 25, 25), flags=flags)
        for y in [0, h - 1]:
            for x in range(0, w, 16):
                if mask[y + 1, x + 1] == 0 and rgb[y, x].max() < 30:
                    cv2.floodFill(rgb, mask, (x, y), (0, 0, 0), loDiff=(25, 25, 25), upDiff=(25, 25, 25), flags=flags)
        
        # 3. Create anti-aliased alpha boundary
        bg_binary = (mask[1:-1, 1:-1] == 255).astype(np.uint8)
        dist = cv2.distanceTransform(1 - bg_binary, cv2.DIST_L2, 3)
        alpha = np.clip(dist / 1.2, 0, 1) * 255
        alpha = alpha.astype(np.uint8)
        
        # 4. De-fringe: un-premultiply dark edge pixels to eliminate any black halo
        alpha_norm = np.maximum(alpha.astype(np.float32) / 255.0, 0.001)[:, :, None]
        rgb_clean = np.clip(rgb.astype(np.float32) / alpha_norm, 0, 255).astype(np.uint8)
        
        rgba = np.dstack([rgb_clean, alpha])
        out_frames.append(Image.fromarray(rgba))
    
    # Save to temp path first, then atomically replace
    temp_out = os.path.join(BASE_DIR, f".tmp_{fname}")
    out_frames[0].save(
        temp_out,
        save_all=True,
        append_images=out_frames[1:],
        duration=durations,
        loop=loop,
        quality=85,
        method=4,
        lossless=False
    )
    
    if os.path.exists(src_path):
        os.remove(src_path)
    os.rename(temp_out, src_path)
    
    elapsed = time.time() - t0
    
    # Verification
    verified = Image.open(src_path)
    verified.seek(0)
    v_arr = np.array(verified)
    zero_pct = (v_arr[:, :, 3] == 0).mean() * 100
    solid_pct = (v_arr[:, :, 3] == 255).mean() * 100
    corner_rgba = v_arr[0, 0]
    
    print(f"DONE {fname} in {elapsed:.2f}s:")
    print(f"  Frames: {verified.n_frames}")
    print(f"  Corner RGBA: {corner_rgba} (Must be [0 0 0 0])")
    print(f"  Zero alpha %: {zero_pct:.1f}%")
    print(f"  Solid alpha %: {solid_pct:.1f}%")
    assert verified.n_frames >= total_frames - 10, f"Frame count too low for {fname}: got {verified.n_frames}, expected ~{total_frames}"
    assert corner_rgba[3] == 0, f"Corner not transparent for {fname}: {corner_rgba}"
    assert zero_pct > 60.0, f"Transparency too low for {fname}: {zero_pct}%"

def main():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    print(f"Starting transparency cleaning for {len(TARGET_FILES)} animated WebP files...")
    
    for fname in TARGET_FILES:
        process_file(fname)
        
    print("\nAll mascot assets successfully converted to true 100% transparent RGBA!")

if __name__ == "__main__":
    main()
