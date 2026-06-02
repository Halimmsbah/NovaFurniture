const base = 'http://localhost:3000/api/v1'
const ts = Date.now()
const email = `tmp.user.${ts}@example.com`
const pass = 'Userpass1A'

async function main(){
  console.log('signup', email)
  let r = await fetch(`${base}/auth/signup`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ name:'Tmp', email, password: pass, rePassword: pass }) })
  console.log('signup status', r.status)
  let js = await r.json().catch(()=>null)
  console.log('signup body', js)

  r = await fetch(`${base}/auth/signin`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email, password: pass }) })
  console.log('signin status', r.status)
  js = await r.json().catch(()=>null)
  console.log('signin body', js)
  const token = js?.token

  r = await fetch(`${base}/addresses`, { method: 'PATCH', headers: {'content-type':'application/json', token}, body: JSON.stringify({ street:'S', city:'C', phone:'01000000000' }) })
  console.log('patch addresses status', r.status)
  js = await r.json().catch(()=>null)
  console.log('patch addresses body', JSON.stringify(js, null, 2))
}

main().catch(e=>{console.error(e); process.exit(1)})
