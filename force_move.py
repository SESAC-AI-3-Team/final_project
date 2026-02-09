import os
import shutil

base = r'c:\Users\User\Desktop\최종프로젝트\final_project'
legacy_root = os.path.join(base, 'frontend', 'legacy')
templates_src = os.path.join(base, 'main', 'templates')
static_src = os.path.join(base, 'main', 'static')

def robust_move(src_root, dest_root, exclude=None):
    if exclude is None:
        exclude = []
    
    if not os.path.exists(src_root):
        print(f"Source not found: {src_root}")
        return

    os.makedirs(dest_root, exist_ok=True)
    
    for item in os.listdir(src_root):
        if item in exclude:
            continue
            
        s = os.path.join(src_root, item)
        d = os.path.join(dest_root, item)
        
        try:
            if os.path.isdir(s):
                if os.path.exists(d):
                    shutil.rmtree(d)
                shutil.copytree(s, d)
                shutil.rmtree(s)
            else:
                shutil.copy2(s, d)
                os.remove(s)
            print(f"Processed: {item}")
        except Exception as e:
            print(f"Error with {item}: {e}")

if __name__ == "__main__":
    print("Moving templates...")
    robust_move(templates_src, os.path.join(legacy_root, 'templates'), exclude=['react_index.html'])
    print("Moving static...")
    robust_move(static_src, os.path.join(legacy_root, 'static'))
    print("Relocation finished.")
