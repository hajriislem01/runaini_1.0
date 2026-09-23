import os
import re

admin_dir = r"c:\Users\zied\Desktop\runaini_1.0-main\runaini_1.0-main\frontend\src\pages\administration"
toaster_import_regex = re.compile(r"import\s+(?:toast,\s*)?{\s*Toaster\s*}\s*from\s*'react-hot-toast';")
toast_import_regex = re.compile(r"import\s+toast\s*from\s*'react-hot-toast';")

toaster_tag_regex = re.compile(r"<Toaster[^>]*/>")

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "Toaster" not in content or "react-hot-toast" not in content:
        return

    # Calculate relative path to shared/AdminToaster.jsx
    rel_dir = os.path.relpath(os.path.join(admin_dir, "shared"), os.path.dirname(filepath)).replace("\\", "/")
    if not rel_dir.startswith('.'):
        rel_dir = "./" + rel_dir
    admin_toaster_import = f"import AdminToaster from '{rel_dir}/AdminToaster';"

    # Replace Toaster import with toast (if needed) and AdminToaster
    if "import toast, { Toaster }" in content:
        content = content.replace("import toast, { Toaster } from 'react-hot-toast';", 
                                 f"import toast from 'react-hot-toast';\n{admin_toaster_import}")
    elif "import { Toaster } from 'react-hot-toast';" in content:
        # Check if toast is used without import? (Usually not, but replace just in case)
        content = content.replace("import { Toaster } from 'react-hot-toast';", admin_toaster_import)
    
    # Check for isRtl condition in Toaster tag
    if "isRtl ? 'top-left' : 'top-right'" in content or 'isRtl ? "top-left" : "top-right"' in content:
        content = toaster_tag_regex.sub(r"<AdminToaster position={isRtl ? 'top-left' : 'top-right'} />", content)
    else:
        content = toaster_tag_regex.sub(r'<AdminToaster position="top-right" />', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated: {filepath}")

for root, dirs, files in os.walk(admin_dir):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Done")
