import urllib.request
import urllib.parse
import http.cookiejar
import re

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
urllib.request.install_opener(opener)

login_url = "https://fashionistar-backend-259415881346.europe-west1.run.app/admin/login/"
req1 = urllib.request.Request(login_url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req1) as resp1:
        html1 = resp1.read().decode('utf-8')
        csrf_token = ""
        for cookie in cj:
            if cookie.name == 'csrftoken':
                csrf_token = cookie.value
        
        login_data = urllib.parse.urlencode({
            'csrfmiddlewaretoken': csrf_token,
            'username': 'admin@fashionistar.io',
            'password': 'FashionAdmin2026!',
            'next': '/admin/'
        }).encode('utf-8')
        
        req2 = urllib.request.Request(login_url, data=login_data, headers={'User-Agent': 'Mozilla/5.0', 'Referer': login_url})
        with urllib.request.urlopen(req2) as resp2:
            detail_url = "https://fashionistar-backend-259415881346.europe-west1.run.app/admin/authentication/unifieduser/019e6ced-2f57-705d-aaed-47ed3e96baa1/change/"
            print("[INFO] Fetching detail page:", detail_url)
            
            req4 = urllib.request.Request(detail_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req4) as resp4:
                html4 = resp4.read().decode('utf-8')
                
                print("\n=== BUTTONS/SUBMITS ON DETAIL PAGE ===")
                submits = re.findall(r"<(?:input|button)[^>]*(?:submit|name=)[^>]*>", html4, re.IGNORECASE)
                for sub in submits:
                    print("  ", sub.strip())
                        
except Exception as e:
    print("[ERROR]", e)
