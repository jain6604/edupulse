import os
import re

files = ['Insights.js', 'Placement.js', 'Skills.js', 'Achievements.js', 'Profile.js', 'AdminDashboard.js', 'DataQuality.js', 'Register.js', 'Login.js']
base = r'E:\edupulse\edupulse\frontend\src\pages'

for file in files:
    path = os.path.join(base, file)
    if not os.path.exists(path): continue
    
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()

    changed = False

    if 'import PageBackground' not in c:
        c = "import PageBackground from '../components/PageBackground';\n" + c
        changed = True

    if '<PageBackground />' not in c:
        c = re.sub(r'(return\s*\(\s*<div[^>]*>)', r'\1\n      <PageBackground />', c, count=1)
        changed = True

    # Fix the outermost div to have style={{ position:'relative', minHeight:'100vh' }}
    # We find the first return ( <div ...>
    # If it has style={{...}}, we inject position:'relative', minHeight:'100vh'
    def fix_outer_div(match):
        div_tag = match.group(1)
        if 'style={{' in div_tag:
            if 'position:' not in div_tag and 'position :' not in div_tag and 'position\'' not in div_tag:
                div_tag = div_tag.replace('style={{', "style={{ position: 'relative', minHeight: '100vh', ")
        else:
            div_tag = div_tag.replace('<div', "<div style={{ position: 'relative', minHeight: '100vh' }}")
        return div_tag

    new_c = re.sub(r'(return\s*\(\s*<div[^>]*>)', fix_outer_div, c, count=1)
    if new_c != c:
        c = new_c
        changed = True

    # Fix content inside to have position:'relative', zIndex:1
    # We can just look for the first <div after <PageBackground /> and add style={{ position:'relative', zIndex:1 }}
    def fix_inner_div(match):
        pre = match.group(1)
        div_tag = match.group(2)
        if 'style={{' in div_tag:
            if 'zIndex:' not in div_tag and 'zIndex :' not in div_tag and 'zIndex\'' not in div_tag:
                div_tag = div_tag.replace('style={{', "style={{ position: 'relative', zIndex: 1, ")
        else:
            div_tag = div_tag.replace('<div', "<div style={{ position: 'relative', zIndex: 1 }}")
        return pre + div_tag

    new_c2 = re.sub(r'(<PageBackground />\s*)(<div[^>]*>)', fix_inner_div, c, count=1)
    if new_c2 != c:
        c = new_c2
        changed = True

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f'Updated {file}')
    else:
        print(f'Already correct {file}')
