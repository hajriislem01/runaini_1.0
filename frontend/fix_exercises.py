path = r'c:\Users\zied\Desktop\runaini_1.0-main\runaini_1.0-main\frontend\src\pages\coach\CoachAgenda.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("s.{t('event.exercises')}", "s.exercises")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
