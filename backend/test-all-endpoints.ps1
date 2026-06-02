$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000/api/v1'
$results = @{}

function Set-Result([string]$endpoint, [int]$status, [string]$note = '') {
  $script:results[$endpoint] = [pscustomobject]@{ Endpoint = $endpoint; Status = $status; Ok = ($status -ge 200 -and $status -lt 300); Note = $note }
}

function Invoke-Api {
  param(
    [string]$Endpoint,
    [string]$Method,
    [string]$Url,
    [string]$Token = '',
    [object]$Body = $null
  )

  $headers = @{}
  if ($Token) { $headers['token'] = $Token }

  try {
    if ($null -ne $Body) {
      $payload = $Body | ConvertTo-Json -Depth 20
      $resp = Invoke-WebRequest -UseBasicParsing -Uri $Url -Method $Method -Headers $headers -ContentType 'application/json' -Body $payload -TimeoutSec 60
    } else {
      $resp = Invoke-WebRequest -UseBasicParsing -Uri $Url -Method $Method -Headers $headers -TimeoutSec 60
    }
    $status = [int]$resp.StatusCode
    $json = $null
    try { $json = $resp.Content | ConvertFrom-Json } catch {}
    if ($Endpoint) { Set-Result $Endpoint $status }
    return [pscustomobject]@{ Status = $status; Json = $json; Raw = $resp.Content }
  } catch {
    $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode.value__ } else { -1 }
    $raw = ''
    if ($_.Exception.Response) {
      try {
        $sr = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
        $raw = $sr.ReadToEnd()
        $sr.Close()
      } catch {}
    }
    if ($Endpoint) { Set-Result $Endpoint $status $raw }
    return [pscustomobject]@{ Status = $status; Json = $null; Raw = $raw }
  }
}

function Invoke-Multipart {
  param(
    [string]$Endpoint,
    [string]$Method,
    [string]$Url,
    [string]$Token,
    [string[]]$FormArgs
  )

  $cmd = @('-s', '-X', $Method, $Url, '-H', ("token: " + $Token)) + $FormArgs + @('-w', "`nHTTPSTATUS:%{http_code}")
  $text = & curl.exe @cmd
  $lines = $text -split "`n"
  $status = [int](($lines[-1] -replace 'HTTPSTATUS:', '').Trim())
  $body = ($lines[0..($lines.Length - 2)] -join "`n")
  $json = $null
  try { $json = $body | ConvertFrom-Json } catch {}
  if ($Endpoint) { Set-Result $Endpoint $status }
  return [pscustomobject]@{ Status = $status; Json = $json; Raw = $body }
}

# Ensure backend is up
$null = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000/' -TimeoutSec 10

# Prepare image file for multipart endpoints
$imgPath = Join-Path $env:TEMP 'nova-all-endpoints-test.png'
$png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6pY4UAAAAASUVORK5CYII='
[IO.File]::WriteAllBytes($imgPath, [Convert]::FromBase64String($png))

$ts = Get-Date -Format 'yyyyMMddHHmmss'
$userEmail = "all.user.$ts@example.com"
$user2Email = "all.user2.$ts@example.com"
$user3Email = "all.user3.$ts@example.com"
$adminEmail = "all.admin.$ts@example.com"
$userPass = 'Userpass1A'
$userNewPass = 'Userpass2A'
$adminPass = 'Adminpass1A'

# 1) Auth + users
$signup = Invoke-Api 'POST /api/v1/auth/signup' 'POST' "$base/auth/signup" '' @{ name='All User'; email=$userEmail; password=$userPass; rePassword=$userPass }
$signin = Invoke-Api 'POST /api/v1/auth/signin' 'POST' "$base/auth/signin" '' @{ email=$userEmail; password=$userPass }
$userToken = $signin.Json.token

$null = Invoke-Api 'POST /api/v1/users' 'POST' "$base/users" '' @{ name='All User2'; email=$user2Email; password='Usertwo1A'; rePassword='Usertwo1A'; age=29; role='user' }
$null = Invoke-Api '' 'POST' "$base/users" '' @{ name='All User3'; email=$user3Email; password='Userthree1A'; rePassword='Userthree1A'; age=30; role='user' }
$null = Invoke-Api '' 'POST' "$base/users" '' @{ name='All Admin'; email=$adminEmail; password=$adminPass; rePassword=$adminPass; age=35; role='admin' }

$adminSignin = Invoke-Api '' 'POST' "$base/auth/signin" '' @{ email=$adminEmail; password=$adminPass }
$adminToken = $adminSignin.Json.token

$users2 = Invoke-Api '' 'GET' ("$base/users?email=" + $user2Email)
$users3 = Invoke-Api '' 'GET' ("$base/users?email=" + $user3Email)
$user2Id = [string]$users2.Json.users[0]._id
$user3Id = [string]$users3.Json.users[0]._id

# 2) Brand + category + product + review + coupon setup
$brand = Invoke-Multipart 'POST /api/v1/brands' 'POST' "$base/brands" $adminToken @('-F', "name=All Brand $ts", '-F', ("logo=@" + $imgPath + ';type=image/png'))
$brandId = [string]$brand.Json.brand._id

$category = Invoke-Multipart 'POST /api/v1/categories' 'POST' "$base/categories" $adminToken @('-F', "name=All Category $ts", '-F', ("img=@" + $imgPath + ';type=image/png'))
$categoryId = [string]$category.Json.category._id

$product = Invoke-Multipart 'POST /api/v1/products' 'POST' "$base/products" $adminToken @(
  '-F', "title=All Product $ts",
  '-F', 'description=All product description',
  '-F', 'price=1400',
  '-F', 'priceAfterDiscount=1200',
  '-F', 'quantity=20',
  '-F', ("category=$categoryId"),
  '-F', ("brand=$brandId"),
  '-F', ("imgCover=@" + $imgPath + ';type=image/png'),
  '-F', ("images=@" + $imgPath + ';type=image/png')
)
$productId = [string]$product.Json.product._id

$review = Invoke-Api 'POST /api/v1/reviews' 'POST' "$base/reviews" $userToken @{ text='all review'; rate=4; product=$productId }
$reviewId = [string]$review.Json.review._id

$couponCode = "ALL$ts"
$coupon = Invoke-Api '' 'POST' "$base/coupons" $adminToken @{ code=$couponCode; discount=15; expires='2035-01-01' }
$couponId = [string]$coupon.Json.coupon._id

# 3) Address + wishlist
$addr = Invoke-Api 'PATCH /api/v1/addresses' 'PATCH' "$base/addresses" $userToken @{ street='Street 1'; city='Cairo'; phone='01000000000' }
$addressId = [string]$addr.Json.address[0]._id
$null = Invoke-Api 'GET /api/v1/addresses' 'GET' "$base/addresses" $userToken

$null = Invoke-Api 'PATCH /api/v1/wishlist' 'PATCH' "$base/wishlist" $userToken @{ product=$productId }
$null = Invoke-Api 'GET /api/v1/wishlist' 'GET' "$base/wishlist" $userToken

# 4) Cart flows
$cart1 = Invoke-Api 'POST /api/v1/carts' 'POST' "$base/carts" $userToken @{ product=$productId; quantity=1 }
$cartId1 = [string]$cart1.Json.cart._id
$itemId1 = [string]$cart1.Json.cart.cartItems[0]._id

$null = Invoke-Api 'GET /api/v1/carts' 'GET' "$base/carts" $userToken
$null = Invoke-Api 'PUT /api/v1/carts/{id}' 'PUT' "$base/carts/$itemId1" $userToken @{ quantity=2 }
$null = Invoke-Api 'POST /api/v1/carts/applyCoupon' 'POST' "$base/carts/applyCoupon" $userToken @{ coupon=$couponCode }

# checkout endpoint before cash order deletes cart
$null = Invoke-Api 'POST /api/v1/orders/checkOut/{id}' 'POST' "$base/orders/checkOut/$cartId1" $userToken @{ shippingAddress=@{ street='Checkout St'; city='Cairo'; phone='01000000000' } }

$null = Invoke-Api 'DELETE /api/v1/carts/{id}' 'DELETE' "$base/carts/$itemId1" $userToken
$null = Invoke-Api '' 'POST' "$base/carts" $userToken @{ product=$productId; quantity=1 }
$null = Invoke-Api 'DELETE /api/v1/carts/clear' 'DELETE' "$base/carts/clear" $userToken

# create another cart for cash order
$cart2 = Invoke-Api '' 'POST' "$base/carts" $userToken @{ product=$productId; quantity=1 }
$cartId2 = [string]$cart2.Json.cart._id
$order = Invoke-Api 'POST /api/v1/orders/{id}' 'POST' "$base/orders/$cartId2" $userToken @{ id=$cartId2; shippingAddress=@{ street='Order St'; city='Giza'; phone='01111111111' } }
$orderId = [string]$order.Json.order._id

# 5) Reads and admin endpoints
$null = Invoke-Api 'GET /api/v1/orders' 'GET' "$base/orders" $userToken
$null = Invoke-Api 'GET /api/v1/orders/all' 'GET' "$base/orders/all"
$null = Invoke-Api 'GET /api/v1/orders/admin/filters' 'GET' "$base/orders/admin/filters" $adminToken

$null = Invoke-Api 'GET /api/v1/dashboard/stats' 'GET' "$base/dashboard/stats" $adminToken
$null = Invoke-Api 'GET /api/v1/dashboard/revenue' 'GET' "$base/dashboard/revenue" $adminToken
$null = Invoke-Api 'GET /api/v1/dashboard/top-products' 'GET' "$base/dashboard/top-products" $adminToken
$null = Invoke-Api 'GET /api/v1/dashboard/recent-orders' 'GET' "$base/dashboard/recent-orders" $adminToken
$null = Invoke-Api 'GET /api/v1/dashboard/low-stock' 'GET' "$base/dashboard/low-stock" $adminToken
$null = Invoke-Api 'GET /api/v1/dashboard/out-of-stock' 'GET' "$base/dashboard/out-of-stock" $adminToken
$null = Invoke-Api 'GET /api/v1/dashboard/sales-by-category' 'GET' "$base/dashboard/sales-by-category" $adminToken
$null = Invoke-Api 'GET /api/v1/dashboard/user-growth' 'GET' "$base/dashboard/user-growth" $adminToken

$null = Invoke-Api 'GET /api/v1/brands' 'GET' "$base/brands"
$null = Invoke-Api 'GET /api/v1/brands/{id}' 'GET' "$base/brands/$brandId"
$null = Invoke-Api 'GET /api/v1/categories' 'GET' "$base/categories"
$null = Invoke-Api 'GET /api/v1/categories/{id}' 'GET' "$base/categories/$categoryId"
$null = Invoke-Api 'GET /api/v1/products' 'GET' "$base/products"
$null = Invoke-Api 'GET /api/v1/products/{id}' 'GET' "$base/products/$productId"
$null = Invoke-Api 'GET /api/v1/reviews' 'GET' "$base/reviews"
$null = Invoke-Api 'GET /api/v1/reviews/{id}' 'GET' "$base/reviews/$reviewId"
$null = Invoke-Api 'GET /api/v1/coupons/{id}' 'GET' "$base/coupons/$couponId" $adminToken
$null = Invoke-Api 'GET /api/v1/users' 'GET' "$base/users"
$null = Invoke-Api 'GET /api/v1/users/{id}' 'GET' "$base/users/$user2Id"

# 6) Updates
$null = Invoke-Api 'PUT /api/v1/brands/{id}' 'PUT' "$base/brands/$brandId" $adminToken @{ id=$brandId; name="All Brand Updated $ts" }
$null = Invoke-Api 'PUT /api/v1/categories/{id}' 'PUT' "$base/categories/$categoryId" $adminToken @{ id=$categoryId; name="All Category Updated $ts" }
$null = Invoke-Api 'PUT /api/v1/products/{id}' 'PUT' "$base/products/$productId" $adminToken @{ id=$productId; title="All Product Updated $ts"; description='Updated desc'; price=1500; priceAfterDiscount=1300; quantity=10; category=$categoryId; brand=$brandId }
$null = Invoke-Api 'PUT /api/v1/reviews/{id}' 'PUT' "$base/reviews/$reviewId" $userToken @{ id=$reviewId; text='updated review'; rate=5; product=$productId }
$null = Invoke-Api 'PUT /api/v1/coupons/{id}' 'PUT' "$base/coupons/$couponId" $adminToken @{ id=$couponId; discount=20 }
$null = Invoke-Api 'PUT /api/v1/users/{id}' 'PUT' "$base/users/$user2Id" '' @{ id=$user2Id; name='All User2 Updated'; email=$user2Email; age=31 }

$change = Invoke-Api 'PATCH /api/v1/auth/changePassword' 'PATCH' "$base/auth/changePassword" $userToken @{ password=$userPass; newPassword=$userNewPass }
if ($change.Json.token) { $userToken = $change.Json.token }

$null = Invoke-Api 'PATCH /api/v1/orders/admin/{id}/delivery' 'PATCH' "$base/orders/admin/$orderId/delivery" $adminToken @{ isDelivered = $true }
$null = Invoke-Api 'PATCH /api/v1/orders/admin/{id}/payment' 'PATCH' "$base/orders/admin/$orderId/payment" $adminToken @{ isPaid = $true }

# 7) Deletes
$null = Invoke-Api 'DELETE /api/v1/addresses/{id}' 'DELETE' "$base/addresses/$addressId" $userToken
$null = Invoke-Api 'DELETE /api/v1/wishlist/{id}' 'DELETE' "$base/wishlist/$productId" $userToken
$null = Invoke-Api 'DELETE /api/v1/reviews/{id}' 'DELETE' "$base/reviews/$reviewId" $userToken
$null = Invoke-Api 'DELETE /api/v1/orders/admin/{id}' 'DELETE' "$base/orders/admin/$orderId" $adminToken
$null = Invoke-Api 'DELETE /api/v1/coupons/{id}' 'DELETE' "$base/coupons/$couponId" $adminToken
$null = Invoke-Api 'DELETE /api/v1/products/{id}' 'DELETE' "$base/products/$productId" $adminToken
$null = Invoke-Api 'DELETE /api/v1/categories/{id}' 'DELETE' "$base/categories/$categoryId" $adminToken
$null = Invoke-Api 'DELETE /api/v1/brands/{id}' 'DELETE' "$base/brands/$brandId" $adminToken
$null = Invoke-Api 'DELETE /api/v1/users/{id}' 'DELETE' "$base/users/$user3Id"

$expected = @(
'DELETE /api/v1/addresses/{id}','DELETE /api/v1/brands/{id}','DELETE /api/v1/carts/{id}','DELETE /api/v1/carts/clear','DELETE /api/v1/categories/{id}','DELETE /api/v1/coupons/{id}','DELETE /api/v1/orders/admin/{id}','DELETE /api/v1/products/{id}','DELETE /api/v1/reviews/{id}','DELETE /api/v1/users/{id}','DELETE /api/v1/wishlist/{id}',
'GET /api/v1/addresses','GET /api/v1/brands','GET /api/v1/brands/{id}','GET /api/v1/carts','GET /api/v1/categories','GET /api/v1/categories/{id}','GET /api/v1/coupons/{id}','GET /api/v1/dashboard/low-stock','GET /api/v1/dashboard/out-of-stock','GET /api/v1/dashboard/recent-orders','GET /api/v1/dashboard/revenue','GET /api/v1/dashboard/sales-by-category','GET /api/v1/dashboard/stats','GET /api/v1/dashboard/top-products','GET /api/v1/dashboard/user-growth','GET /api/v1/orders','GET /api/v1/orders/admin/filters','GET /api/v1/orders/all','GET /api/v1/products','GET /api/v1/products/{id}','GET /api/v1/reviews','GET /api/v1/reviews/{id}','GET /api/v1/users','GET /api/v1/users/{id}','GET /api/v1/wishlist',
'PATCH /api/v1/addresses','PATCH /api/v1/auth/changePassword','PATCH /api/v1/orders/admin/{id}/delivery','PATCH /api/v1/orders/admin/{id}/payment','PATCH /api/v1/wishlist',
'POST /api/v1/auth/signin','POST /api/v1/auth/signup','POST /api/v1/brands','POST /api/v1/carts','POST /api/v1/carts/applyCoupon','POST /api/v1/categories','POST /api/v1/orders/{id}','POST /api/v1/orders/checkOut/{id}','POST /api/v1/products','POST /api/v1/reviews','POST /api/v1/users',
'PUT /api/v1/brands/{id}','PUT /api/v1/carts/{id}','PUT /api/v1/categories/{id}','PUT /api/v1/coupons/{id}','PUT /api/v1/products/{id}','PUT /api/v1/reviews/{id}','PUT /api/v1/users/{id}'
)

$final = @()
foreach($e in $expected) {
  if($results.ContainsKey($e)) { $final += $results[$e] }
  else { $final += [pscustomobject]@{ Endpoint=$e; Status=-1; Ok=$false; Note='not executed' } }
}

$ok = $final | Where-Object { $_.Ok }
$bad = $final | Where-Object { -not $_.Ok }

Write-Output ('EXPECTED_TOTAL=' + $expected.Count)
Write-Output ('OK_2XX=' + $ok.Count)
Write-Output ('NOT_OK=' + $bad.Count)
Write-Output '=== NOT_OK_LIST ==='
$bad | Sort-Object Endpoint | ForEach-Object { Write-Output ($_.Endpoint + ' => ' + $_.Status + ' ' + $_.Note) }
Write-Output '=== ALL_RESULTS ==='
$final | Sort-Object Endpoint | ForEach-Object { Write-Output ($_.Endpoint + ' => ' + $_.Status) }
