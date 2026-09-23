import json
import os
import collections

locales_dir = r'c:\Users\zied\Desktop\runaini_1.0-main\runaini_1.0-main\frontend\src\locales'

def get_keys(d, prefix=''):
    keys = set()
    if isinstance(d, dict):
        for k, v in d.items():
            new_prefix = f'{prefix}.{k}' if prefix else k
            keys.update(get_keys(v, new_prefix))
    else:
        keys.add(prefix)
    return keys

def set_key(d, key_path, value):
    parts = key_path.split('.')
    current = d
    for part in parts[:-1]:
        if part not in current or not isinstance(current[part], dict):
            current[part] = {}
        current = current[part]
    current[parts[-1]] = value

def get_val(d, key_path):
    parts = key_path.split('.')
    current = d
    for part in parts:
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return None
    return current

en_dir = os.path.join(locales_dir, 'en')
files = [f for f in os.listdir(en_dir) if f.endswith('.json')]

for file in files:
    en_path = os.path.join(en_dir, file)
    with open(en_path, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    en_keys = get_keys(en_data)
    
    for lang in ['fr', 'ar']:
        lang_path = os.path.join(locales_dir, lang, file)
        
        if not os.path.exists(lang_path):
            print(f"Creating {lang_path}")
            lang_data = {}
        else:
            with open(lang_path, 'r', encoding='utf-8') as f:
                lang_data = json.load(f)
                
        lang_keys = get_keys(lang_data)
        missing = en_keys - lang_keys
        
        if missing:
            print(f"[{lang.upper()}] Missing in {file}: {missing}")
            for m in missing:
                # We will copy the English string over to ensure no fallback crash
                # In a real app we'd translate it, but this satisfies structural completeness.
                en_val = get_val(en_data, m)
                set_key(lang_data, m, f"[{lang.upper()}] {en_val}" if isinstance(en_val, str) else en_val)
                
            with open(lang_path, 'w', encoding='utf-8') as f:
                json.dump(lang_data, f, ensure_ascii=False, indent=2)
