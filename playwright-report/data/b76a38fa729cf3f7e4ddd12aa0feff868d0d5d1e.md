# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order_lifecycle.spec.ts >> Catalog Browsing >> category navigation works
- Location: e2e\order_lifecycle.spec.ts:32:3

# Error details

```
Tearing down "context" exceeded the test timeout of 45000ms.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - status "Loading Fashionistar AI" [ref=e3]:
    - generic [ref=e4]:
      - paragraph [ref=e8]: FASHIONISTAR
      - paragraph [ref=e9]: AI Precision • Perfect Fit • Seamless Fashion Commerce
  - generic [ref=e17]:
    - heading "404" [level=1] [ref=e18]
    - heading "This page could not be found." [level=2] [ref=e20]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e26] [cursor=pointer]:
    - generic [ref=e29]:
      - text: Compiling
      - generic [ref=e30]:
        - generic [ref=e31]: .
        - generic [ref=e32]: .
        - generic [ref=e33]: .
```