import os

pages_dir = 'src/pages'
files = [f for f in os.listdir(pages_dir) if f.endswith('.js')]

missing_import = []
missing_render = []

for file in files:
    if file == 'Landing.js':
        continue # Landing page has inline background
        
    path = os.path.join(pages_dir, file)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    has_import = "import PageBackground" in content
    has_render = "<PageBackground />" in content
    
    if not has_import:
        missing_import.append(file)
    if not has_render:
        missing_render.append(file)

print("--- Background Check Results ---")
print(f"Total files checked: {len(files) - 1}")
print(f"Missing Import: {missing_import}")
print(f"Missing Render: {missing_render}")
