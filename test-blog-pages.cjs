const http = require("http");

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, length: data.length, data }));
    }).on("error", reject);
  });
}

async function main() {
  try {
    console.log("Testing http://localhost:3000 (homepage) ...");
    const home = await fetchPage("http://localhost:3000");
    console.log("Homepage - Status:", home.status, "Length:", home.length);
    console.log("Has homepage testid:", home.data.includes('data-testid="homepage"'));
    console.log("Has server-only error:", home.data.includes("server-only"));
    console.log("");

    console.log("Testing http://localhost:3000/blog ...");
    const blogList = await fetchPage("http://localhost:3000/blog");
    console.log("Blog list - Status:", blogList.status, "Length:", blogList.length);
    console.log("Has Fashionistar Blog:", blogList.data.includes("Fashionistar Blog"));
    console.log("Has data-testid:", blogList.data.includes("data-testid"));
    console.log("Has server-only error:", blogList.data.includes("server-only"));
    console.log("");

    const slugMatch = blogList.data.match(/href="\/blog\/([^"]+)"/);
    if (slugMatch) {
      const slug = slugMatch[1];
      console.log("Testing http://localhost:3000/blog/" + slug + " ...");
      const blogDetail = await fetchPage("http://localhost:3000/blog/" + slug);
      console.log("Blog detail - Status:", blogDetail.status, "Length:", blogDetail.length);
      console.log("Has blog-detail-page:", blogDetail.data.includes("blog-detail-page"));
      console.log("Has social-proof-bar:", blogDetail.data.includes("social-proof-bar"));
      console.log("Has trust-badges:", blogDetail.data.includes("trust-badges"));
      console.log("Has urgency-timer:", blogDetail.data.includes("urgency-timer"));
      console.log("Has inline-product-recommendations:", blogDetail.data.includes("inline-product-recommendations"));
      console.log("Has blog-related:", blogDetail.data.includes("blog-related"));
      console.log("Has blog-newsletter-cta:", blogDetail.data.includes("blog-newsletter-cta"));
      console.log("Has JSON-LD:", blogDetail.data.includes("application/ld+json"));
      console.log("Has server-only error:", blogDetail.data.includes("server-only"));
    }

    console.log("\n=== All Tests Complete ===");
  } catch (err) {
    console.error("Test failed:", err.message);
    process.exit(1);
  }
}

main();
