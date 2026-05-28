import urllib.request
import re

url = "https://fashionistar-backend-259415881346.europe-west1.run.app/admin/login/"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)

try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        form_match = re.search(r"<form.*?</form>", html, re.DOTALL | re.IGNORECASE)
        if form_match:
            print(form_match.group(0))
        else:
            print("Form not found!")
except Exception as e:
    print("Error:", e)
