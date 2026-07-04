import os
files = ['Login.js', 'Register.js', 'Insights.js', 'Placement.js', 'Skills.js', 'Achievements.js', 'Profile.js', 'AdminDashboard.js', 'DataQuality.js']
base = r'E:\edupulse\edupulse\frontend\src\pages'
for file in files:
    path = os.path.join(base, file)
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace("\\'", "'")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Fixed', file)
