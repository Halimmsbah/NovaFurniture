$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000'

function Invoke-Json {
  param(
    [string]$Method,
    [string]$Path,
    [object]$Body = $null,
    [string]$Token = $null
  )

  $headers = @{}
  if ($Token) { $headers['token'] = $Token }

  try {
    if ($null -ne $Body) {
      $resp = Invoke-RestMethod -Uri ($base + $Path) -Method $Method -Headers $headers -ContentType 'application/json' -Body ($Body | ConvertTo-Json -Depth 10)
    } else {
      $resp = Invoke-RestMethod -Uri ($base + $Path) -Method $Method -Headers $headers
    }
    return @{ ok = $true; data = $resp; status = 200 }
  } catch {
    $status = -1
    if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode.value__ }
    $errBody = ''
    try {
      if ($_.ErrorDetails.Message) { $errBody = $_.ErrorDetails.Message }
    } catch {}
    return @{ ok = $false; data = $errBody; status = $status }
  }
}

$results = New-Object System.Collections.Generic.List[object]
function Add-Result {
  param([string]$Method,[string]$Path,[hashtable]$R)
  $results.Add([pscustomobject]@{Method=$Method;Path=$Path;Status=$R.status;Ok=($R.status -ge 200 -and $R.status -lt 300)})
}

# Ensure backend alive
$null = Invoke-WebRequest -UseBasicParsing -Uri "$base/" -TimeoutSec 10

# Prepare image file for multipart endpoints
$imgPath = Join-Path $PSScriptRoot 'uploads\test-api.png'
if (!(Test-Path (Split-Path $imgPath))) { New-Item -ItemType Directory -Path (Split-Path $imgPath) -Force | Out-Null }
$pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z4X8AAAAASUVORK5CYII='
[IO.File]::WriteAllBytes($imgPath, [Convert]::FromBase64String($pngBase64))

$rand = Get-Random -Minimum 10000 -Maximum 99999
$adminEmail = "admin$rand@example.com"
$userEmail = "user$rand@example.com"
$user2Email = "user2$rand@example.com"
$user3Email = "user3$rand@example.com"
$pass = 'Password123'

# 400 group -> make them 2xx with valid payloads
$r = Invoke-Json -Method POST -Path '/api/v1/auth/signup' -Body @{name="User $rand";email=$userEmail;password=$pass;rePassword=$pass}
Add-Result 'POST' '/api/v1/auth/signup' $r

$r = Invoke-Json -Method POST -Path '/api/v1/auth/signin' -Body @{email=$userEmail;password=$pass}
Add-Result 'POST' '/api/v1/auth/signin' $r
if (-not $r.ok) { throw 'User signin failed, cannot continue.' }
$userToken = $r.data.token

$r = Invoke-Json -Method POST -Path '/api/v1/users/' -Body @{name="User2 $rand";email=$user2Email;password=$pass;rePassword=$pass;age=30;role='user'}
Add-Result 'POST' '/api/v1/users/' $r

$r = Invoke-Json -Method POST -Path '/api/v1/users/' -Body @{name="User3 $rand";email=$user3Email;password=$pass;rePassword=$pass;age=33;role='user'}

# Create admin user + token
$rAdminCreate = Invoke-Json -Method POST -Path '/api/v1/users/' -Body @{name="Admin $rand";email=$adminEmail;password=$pass;rePassword=$pass;age=35;role='admin'}
$rAdminSignIn = Invoke-Json -Method POST -Path '/api/v1/auth/signin' -Body @{email=$adminEmail;password=$pass}
if (-not $rAdminSignIn.ok) { throw 'Admin signin failed, cannot continue.' }
$adminToken = $rAdminSignIn.data.token

# Fetch users to get ids
$rUser2 = Invoke-Json -Method GET -Path ("/api/v1/users/?email=" + $user2Email)
$rUser3 = Invoke-Json -Method GET -Path ("/api/v1/users/?email=" + $user3Email)
if (-not $rUser2.ok -or -not $rUser2.data.users) { throw 'Cannot fetch secondary user by email.' }
if (-not $rUser3.ok -or -not $rUser3.data.users) { throw 'Cannot fetch third user by email.' }
$user2Row = $rUser2.data.users | Select-Object -First 1
$user3Row = $rUser3.data.users | Select-Object -First 1
if (-not $user2Row) { throw 'Secondary user id not found.' }
if (-not $user3Row) { throw 'Third user id not found.' }
$userId = [string]$user2Row._id
$user2Id = [string]$user2Row._id
$user3Id = [string]$user3Row._id

# Create brand (multipart)
$brandName = "Brand $rand"
$brandRaw = curl.exe -s -X POST "$base/api/v1/brands/" -H "token: $adminToken" -F "name=$brandName" -F "logo=@$imgPath"
$brandObj = $brandRaw | ConvertFrom-Json
$brandId = [string]$brandObj.brand._id
if (-not $brandId) { throw "Brand creation failed: $brandRaw" }

# Create category (multipart)
$catName = "Category $rand"
$catRaw = curl.exe -s -X POST "$base/api/v1/categories/" -H "token: $adminToken" -F "name=$catName" -F "img=@$imgPath"
$catObj = $catRaw | ConvertFrom-Json
$categoryId = [string]$catObj.category._id
if (-not $categoryId) { throw "Category creation failed: $catRaw" }

# Create product (multipart)
$productTitle = "Product $rand"
$productDesc = "Description $rand"
$productRaw = curl.exe -s -X POST "$base/api/v1/products/" -H "token: $adminToken" -F "title=$productTitle" -F "description=$productDesc" -F "price=1000" -F "priceAfterDiscount=900" -F "quantity=20" -F "category=$categoryId" -F "brand=$brandId" -F "imgCover=@$imgPath" -F "images=@$imgPath"
$productObj = $productRaw | ConvertFrom-Json
$productId = [string]$productObj.product._id
if (-not $productId) { throw "Product creation failed: $productRaw" }

# Create review for product
$r = Invoke-Json -Method POST -Path '/api/v1/reviews/' -Token $userToken -Body @{text="Review $rand";rate=5;product=$productId}
if (-not $r.ok) { throw "Review creation failed: $($r.data)" }
$reviewId = [string]$r.data.review._id

# Create coupon
$r = Invoke-Json -Method POST -Path '/api/v1/coupons/' -Token $adminToken -Body @{code="SAVE$rand";discount=10;expires='2035-12-31'}
if (-not $r.ok) { throw "Coupon creation failed: $($r.data)" }
$couponId = [string]$r.data.coupon._id

# Address endpoints
$r = Invoke-Json -Method PATCH -Path '/api/v1/addresses/' -Token $userToken -Body @{street='Street 1';city='Cairo';phone='01000000000'}
Add-Result 'PATCH' '/api/v1/addresses/' $r
$addressId = ''
if ($r.ok -and $r.data.address -and $r.data.address.Count -gt 0) { $addressId = [string]$r.data.address[0]._id }
$r = Invoke-Json -Method GET -Path '/api/v1/addresses/' -Token $userToken
Add-Result 'GET' '/api/v1/addresses/' $r
if (-not $addressId -and $r.ok -and $r.data.addresses -and $r.data.addresses.Count -gt 0) { $addressId = [string]$r.data.addresses[0]._id }
if ($addressId) { $r = Invoke-Json -Method DELETE -Path "/api/v1/addresses/$addressId" -Token $userToken; Add-Result 'DELETE' '/api/v1/addresses/{id}' $r }

# Wishlist endpoints
$r = Invoke-Json -Method PATCH -Path '/api/v1/wishlist/' -Token $userToken -Body @{product=$productId}
Add-Result 'PATCH' '/api/v1/wishlist/' $r
$r = Invoke-Json -Method GET -Path '/api/v1/wishlist/' -Token $userToken
Add-Result 'GET' '/api/v1/wishlist/' $r
$r = Invoke-Json -Method DELETE -Path "/api/v1/wishlist/$productId" -Token $userToken
Add-Result 'DELETE' '/api/v1/wishlist/{id}' $r

# Cart endpoints
$r = Invoke-Json -Method POST -Path '/api/v1/carts/' -Token $userToken -Body @{product=$productId;quantity=1}
Add-Result 'POST' '/api/v1/carts/' $r
$cartId = ''
$cartItemId = ''
if ($r.ok) {
  $cartId = [string]$r.data.cart._id
  if ($r.data.cart.cartItems -and $r.data.cart.cartItems.Count -gt 0) { $cartItemId = [string]$r.data.cart.cartItems[0]._id }
}
$r = Invoke-Json -Method GET -Path '/api/v1/carts/' -Token $userToken
Add-Result 'GET' '/api/v1/carts/' $r
if (-not $cartId -and $r.ok) { $cartId = [string]$r.data.cart._id }
if (-not $cartItemId -and $r.ok -and $r.data.cart.cartItems -and $r.data.cart.cartItems.Count -gt 0) { $cartItemId = [string]$r.data.cart.cartItems[0]._id }
if ($cartItemId) { $r = Invoke-Json -Method PUT -Path "/api/v1/carts/$cartItemId" -Token $userToken -Body @{quantity=2}; Add-Result 'PUT' '/api/v1/carts/{id}' $r }
if ($cartItemId) { $r = Invoke-Json -Method DELETE -Path "/api/v1/carts/$cartItemId" -Token $userToken; Add-Result 'DELETE' '/api/v1/carts/{id}' $r }
# add again then clear
$r = Invoke-Json -Method POST -Path '/api/v1/carts/' -Token $userToken -Body @{product=$productId;quantity=1}
$r = Invoke-Json -Method DELETE -Path '/api/v1/carts/clear' -Token $userToken
Add-Result 'DELETE' '/api/v1/carts/clear' $r

# Order endpoints: create cart then create order
$r = Invoke-Json -Method POST -Path '/api/v1/carts/' -Token $userToken -Body @{product=$productId;quantity=1}
if ($r.ok) { $cartId = [string]$r.data.cart._id }
$r = Invoke-Json -Method POST -Path "/api/v1/orders/$cartId" -Token $userToken -Body @{id=$cartId;shippingAddress=@{street='Street 2';city='Giza';phone='01111111111'}}
Add-Result 'POST' '/api/v1/orders/{id}' $r
$orderId = ''
if ($r.ok) { $orderId = [string]$r.data.order._id }
$r = Invoke-Json -Method GET -Path '/api/v1/orders/' -Token $userToken
Add-Result 'GET' '/api/v1/orders/' $r
$r = Invoke-Json -Method GET -Path '/api/v1/orders/admin/filters' -Token $adminToken
Add-Result 'GET' '/api/v1/orders/admin/filters' $r
if ($orderId) {
  $r = Invoke-Json -Method PATCH -Path "/api/v1/orders/admin/$orderId/delivery" -Token $adminToken -Body @{isDelivered=$true}
  Add-Result 'PATCH' '/api/v1/orders/admin/{orderId}/delivery' $r
  $r = Invoke-Json -Method PATCH -Path "/api/v1/orders/admin/$orderId/payment" -Token $adminToken -Body @{isPaid=$true}
  Add-Result 'PATCH' '/api/v1/orders/admin/{orderId}/payment' $r
  $r = Invoke-Json -Method DELETE -Path "/api/v1/orders/admin/$orderId" -Token $adminToken
  Add-Result 'DELETE' '/api/v1/orders/admin/{orderId}' $r
}

# Dashboard endpoints
foreach($p in @('/api/v1/dashboard/low-stock','/api/v1/dashboard/out-of-stock','/api/v1/dashboard/recent-orders','/api/v1/dashboard/revenue','/api/v1/dashboard/sales-by-category','/api/v1/dashboard/stats','/api/v1/dashboard/top-products','/api/v1/dashboard/user-growth')){
  $r = Invoke-Json -Method GET -Path $p -Token $adminToken
  Add-Result 'GET' $p $r
}

# Brand endpoints from NOT OK list
$r = Invoke-Json -Method GET -Path "/api/v1/brands/$brandId"
Add-Result 'GET' '/api/v1/brands/{id}' $r
$r = Invoke-Json -Method PUT -Path "/api/v1/brands/$brandId" -Token $adminToken -Body @{id=$brandId;name="Brand Updated $rand"}
Add-Result 'PUT' '/api/v1/brands/{id}' $r
$r = Invoke-Json -Method DELETE -Path "/api/v1/brands/$brandId" -Token $adminToken
Add-Result 'DELETE' '/api/v1/brands/{id}' $r

# Category endpoints from NOT OK list
$r = Invoke-Json -Method GET -Path "/api/v1/categories/$categoryId"
Add-Result 'GET' '/api/v1/categories/{id}' $r
$r = Invoke-Json -Method PUT -Path "/api/v1/categories/$categoryId" -Token $adminToken -Body @{id=$categoryId;name="Category Updated $rand"}
Add-Result 'PUT' '/api/v1/categories/{id}' $r
$r = Invoke-Json -Method DELETE -Path "/api/v1/categories/$categoryId" -Token $adminToken
Add-Result 'DELETE' '/api/v1/categories/{id}' $r

# Product endpoints from NOT OK list
$r = Invoke-Json -Method GET -Path "/api/v1/products/$productId"
Add-Result 'GET' '/api/v1/products/{id}' $r
$r = Invoke-Json -Method PUT -Path "/api/v1/products/$productId" -Token $adminToken -Body @{id=$productId;title="Product Updated $rand";description="Desc Updated $rand";price=1200;priceAfterDiscount=1000;quantity=15;category=$categoryId;brand=$brandId}
Add-Result 'PUT' '/api/v1/products/{id}' $r
$r = Invoke-Json -Method DELETE -Path "/api/v1/products/$productId" -Token $adminToken
Add-Result 'DELETE' '/api/v1/products/{id}' $r

# Review endpoints from NOT OK list
$r = Invoke-Json -Method GET -Path "/api/v1/reviews/$reviewId"
Add-Result 'GET' '/api/v1/reviews/{id}' $r
$r = Invoke-Json -Method PUT -Path "/api/v1/reviews/$reviewId" -Token $userToken -Body @{id=$reviewId;text="Review Updated $rand";rate=4;product=$productId}
Add-Result 'PUT' '/api/v1/reviews/{id}' $r
$r = Invoke-Json -Method DELETE -Path "/api/v1/reviews/$reviewId" -Token $userToken
Add-Result 'DELETE' '/api/v1/reviews/{id}' $r

# Coupon endpoints from NOT OK list
$r = Invoke-Json -Method GET -Path "/api/v1/coupons/$couponId" -Token $adminToken
Add-Result 'GET' '/api/v1/coupons/{id}' $r
$r = Invoke-Json -Method PUT -Path "/api/v1/coupons/$couponId" -Token $adminToken -Body @{id=$couponId;code="SAVE${rand}X";discount=15;expires='2036-12-31'}
Add-Result 'PUT' '/api/v1/coupons/{id}' $r
$r = Invoke-Json -Method DELETE -Path "/api/v1/coupons/$couponId" -Token $adminToken
Add-Result 'DELETE' '/api/v1/coupons/{id}' $r

# User endpoints from NOT OK list
$r = Invoke-Json -Method GET -Path "/api/v1/users/$userId"
Add-Result 'GET' '/api/v1/users/{id}' $r
$r = Invoke-Json -Method PUT -Path "/api/v1/users/$userId" -Body @{id=$userId;name="User Updated $rand";age=31;email=$user2Email}
Add-Result 'PUT' '/api/v1/users/{id}' $r
$r = Invoke-Json -Method DELETE -Path "/api/v1/users/$user3Id"
Add-Result 'DELETE' '/api/v1/users/{id}' $r

# Change password from NOT OK list
$r = Invoke-Json -Method PATCH -Path '/api/v1/auth/changePassword/' -Token $userToken -Body @{password=$pass;newPassword='Password124'}
Add-Result 'PATCH' '/api/v1/auth/changePassword/' $r

$bad = $results | Where-Object { -not $_.Ok }
Write-Output ('TOTAL_RETESTED=' + $results.Count)
Write-Output ('OK_2XX=' + (($results | Where-Object { $_.Ok }).Count))
Write-Output ('NOT_OK_NON_2XX=' + $bad.Count)
Write-Output '--- NOT_OK_LIST ---'
$bad | Sort-Object Method,Path | ForEach-Object { Write-Output ($_.Method + ' ' + $_.Path + ' => ' + $_.Status) }
Write-Output '--- ALL_RESULTS ---'
$results | Sort-Object Method,Path | ForEach-Object { Write-Output ($_.Method + ' ' + $_.Path + ' => ' + $_.Status) }
