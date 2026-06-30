import urllib.request
import urllib.parse
import http.cookiejar
import re

# Setup cookie jar to maintain session
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
urllib.request.install_opener(opener)

# Step 1: Fetch login page to get CSRF token
login_url = "https://fashionistar-backend-259415881346.europe-west1.run.app/admin/login/"
req1 = urllib.request.Request(login_url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req1) as resp1:
        html1 = resp1.read().decode('utf-8')
        
        csrf_token = ""
        for cookie in cj:
            if cookie.name == 'csrftoken':
                csrf_token = cookie.value
                
        if not csrf_token:
            # Fallback to search in html
            token_match = re.search(r'name="csrfmiddlewaretoken" value="([^"]+)"', html1)
            if token_match:
                csrf_token = token_match.group(1)

        print("[INFO] CSRF Token:", csrf_token)

        # Step 2: POST login details
        login_data = urllib.parse.urlencode({
            'csrfmiddlewaretoken': csrf_token,
            'username': 'admin@fashionistar.io',
            'password': 'FashionAdmin2026!',
            'next': '/admin/'
        }).encode('utf-8')
        
        req2 = urllib.request.Request(
            login_url, 
            data=login_data, 
            headers={
                'User-Agent': 'Mozilla/5.0',
                'Referer': login_url
            }
        )
        
        with urllib.request.urlopen(req2) as resp2:
            print("[INFO] Logged in successfully. Current URL:", resp2.geturl())
            
            # Step 3: Fetch UnifiedUser list page
            list_url = "https://fashionistar-backend-259415881346.europe-west1.run.app/admin/authentication/unifieduser/"
            req3 = urllib.request.Request(list_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req3) as resp3:
                html3 = resp3.read().decode('utf-8')
                print("[INFO] List page loaded. Status:", resp3.getcode())
                
                # Let's search for form elements, search bars, inputs
                print("\n=== INPUTS ON LIST PAGE ===")
                inputs = re.findall(r"<input[^>]*>", html3, re.IGNORECASE)
                for inp in inputs:
                    if 'search' in inp.lower() or 'name="q"' in inp.lower() or 'id=' in inp.lower():
                        print("  ", inp)
                        
                print("\n=== BUTTONS ON LIST PAGE ===")
                buttons = re.findall(r"<button[^>]*>.*?</button>", html3, re.IGNORECASE | re.DOTALL)
                for btn in buttons:
                    if 'search' in btn.lower() or 'submit' in btn.lower():
                        print("  ", btn.strip().replace('\n', ' '))
                        
except Exception as e:
    print("[ERROR]", e)
