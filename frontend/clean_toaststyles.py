import os
import re

filepath = r"c:\Users\zied\Desktop\runaini_1.0-main\runaini_1.0-main\frontend\src\pages\administration\settings\hooks\useSettingsData.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove , toastStyles.success and , toastStyles.error args from all toast calls
content = re.sub(r',\s*toastStyles\.\w+', '', content)

# Remove the import of toastStyles if it's the only import from settingsConstants
content = re.sub(r"import \{ toastStyles \} from '../utils/settingsConstants';\n", '', content)
# Handle case where it's imported alongside other exports
content = re.sub(r",?\s*toastStyles\s*,?", '', content)
# Clean up any accidental "import {  }" left behind
content = re.sub(r"import \{\s*\} from '[^']+';?\n?", '', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done - toastStyles cleaned from useSettingsData.js")
