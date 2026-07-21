const storeUrl = "https://darkorange-newt-323940.hostingersite.com/";
const consumerKey = "ck_84d2c8308f3df111e4cf428d92c7c0716696983c";
const consumerSecret = "cs_711e8bfcd430b61aced90d628d4747be1460ecb5";

async function run() {
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
  // Get token for the main test user (who probably has a wishlist?)
  const tokenRes = await fetch(`${storeUrl}wp-json/jwt-auth/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'thoufeermall@gmail.com', 
      password: 'testpassword'
    })
  });
  
  const tokenData = await tokenRes.json();
  const token = tokenData.token;
  if (!token) return;
  
  console.log("Adding to YITH wishlist...");
  const rootRes = await fetch(`${storeUrl}wp-json/`);
  const rootData = await rootRes.json();
  console.log("Namespaces:", rootData.namespaces);
}
run();
