import os
import re

files_to_update = [
    'Login.js', 'Register.js', 'Insights.js', 'Placement.js', 
    'Skills.js', 'Achievements.js', 'Profile.js', 'AdminDashboard.js', 'DataQuality.js'
]

base_dir = r'E:\edupulse\edupulse\frontend\src\pages'

for file in files_to_update:
    file_path = os.path.join(base_dir, file)
    if not os.path.exists(file_path):
        print(f'File not found: {file}')
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'PageBackground' in content:
        print(f'Already updated: {file}')
        continue
        
    # Remove existing manual circuit SVGs or background orbs if they exist (mostly in Login/Register)
    content = re.sub(r'\{/\*\s*Background orb\s*\*/\}.*?</svg>', '', content, flags=re.DOTALL)
    
    # Also for any other standalone circuit-bg SVGs right after the first div
    content = re.sub(r'<svg className="circuit-bg".*?</svg>', '', content, flags=re.DOTALL)
    
    # Add import
    import_statement = "import PageBackground from '../components/PageBackground';\n"
    content = import_statement + content
    
    # Find the first return ( <div... and insert <PageBackground />
    pattern = r'(return\s*\(\s*<div[^>]*>)'
    
    def replacer(match):
        # We also need to ensure the outermost div has position: relative and background: #03060f
        div_str = match.group(1)
        if 'style={{' in div_str:
            div_str = re.sub(r'style=\{\{\s*', r'style={{ position: \'relative\', background: \'#03060f\', ', div_str, count=1)
        else:
            div_str = re.sub(r'>\s*$', r' style={{ position: \'relative\', background: \'#03060f\', minHeight: \'100vh\' }}>', div_str)
            
        return div_str + '\n      <PageBackground />'

    content = re.sub(pattern, replacer, content, count=1)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {file}')
