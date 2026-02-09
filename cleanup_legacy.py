import os
import shutil
import sys

# Set explicit paths
BASE_DIR = r'c:\Users\User\Desktop\최종프로젝트\final_project'
MAIN_TEMPLATES = os.path.join(BASE_DIR, 'main', 'templates')
MAIN_STATIC = os.path.join(BASE_DIR, 'main', 'static')
LEGACY_TEMPLATES = os.path.join(BASE_DIR, 'frontend', 'legacy', 'templates')
LEGACY_STATIC = os.path.join(BASE_DIR, 'frontend', 'legacy', 'static')

def safe_create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Created directory: {path}")

def move_contents(src, dst, exclude_files=[]):
    if not os.path.exists(src):
        print(f"Source directory not found: {src}")
        return

    safe_create_dir(dst)

    for item in os.listdir(src):
        if item in exclude_files:
            print(f"Skipping excluded item: {item}")
            continue

        s = os.path.join(src, item)
        d = os.path.join(dst, item)

        try:
            if os.path.exists(d):
                print(f"Destination exists, removing: {d}")
                if os.path.isdir(d):
                    shutil.rmtree(d)
                else:
                    os.remove(d)
            
            shutil.move(s, d)
            print(f"Moved: {item} -> {dst}")
        except Exception as e:
            print(f"Error moving {item}: {e}")

def main():
    print("Starting cleanup...")
    
    # 1. Move Templates (excluding react_index.html)
    print("\n--- Processing Templates ---")
    move_contents(MAIN_TEMPLATES, LEGACY_TEMPLATES, exclude_files=['react_index.html'])
    
    # 2. Move Static Files
    print("\n--- Processing Static Files ---")
    move_contents(MAIN_STATIC, LEGACY_STATIC)

    # 3. Cleanup Empty Directories involved in the move
    # (We don't remove main/templates completely because it holds react_index.html)
    # But we can try to remove subdirs if they were left empty (though move should handle them)
    
    print("\nCleanup finished.")

if __name__ == "__main__":
    main()
