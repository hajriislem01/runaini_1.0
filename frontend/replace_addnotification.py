import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add toast import if missing
    if "import toast from 'react-hot-toast';" not in content and "import toast" not in content:
        content = content.replace("import React", "import React\nimport toast from 'react-hot-toast';")
    elif "import { Toaster }" in content:
        content = content.replace("import { Toaster } from 'react-hot-toast';", "import toast from 'react-hot-toast';")

    # Replace addNotification(..., 'error') -> toast.error(...)
    content = re.sub(r"addNotification\(([^,]+),\s*'error'\)", r"toast.error(\1)", content)
    # Replace addNotification(...) -> toast.success(...)
    content = re.sub(r"addNotification\(([^,]+)\)", r"toast.success(\1)", content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated: {filepath}")

# Update the two files
base = r"c:\Users\zied\Desktop\runaini_1.0-main\runaini_1.0-main\frontend\src\pages\administration\playermanagement"
process_file(os.path.join(base, "hooks", "usePlayerManagement.js"))
process_file(os.path.join(base, "PlayerManagement.js"))

print("Done")
