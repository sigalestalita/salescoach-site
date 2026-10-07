"""Cliente mínimo da API da Higgsfield para o reel.
A credencial vem da variável HF_AUTH ("KEY_ID:SECRET"), nunca do repositório.

  python3 hf.py estimate <endpoint> '<json>'
  python3 hf.py run <endpoint> '<json>' <arquivo-de-saída>
"""
import json, os, sys, time, uuid, urllib.request

API = 'https://api.higgsfield.ai'
AUTH = {'Authorization': 'Key ' + os.environ['HF_AUTH'], 'Content-Type': 'application/json'}

def req(method, url, body=None, extra=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method, headers={**AUTH, **(extra or {})})
    with urllib.request.urlopen(r, timeout=60) as resp:
        return json.loads(resp.read())

def run(endpoint, args, out):
    sub = req('POST', f'{API}/{endpoint}', args, {'Idempotency-Key': str(uuid.uuid4())})
    print('enviado', sub['request_id'], flush=True)
    delay = 2.0
    while True:
        st = req('GET', sub['status_url'])
        if st['status'] in ('completed', 'failed', 'nsfw', 'canceled'):
            break
        time.sleep(delay); delay = min(delay * 1.5, 10)
    if st['status'] != 'completed':
        sys.exit(f"falhou: {st['status']} {json.dumps(st)[:400]}")
    url = (st.get('images') or [{}])[0].get('url') or (st.get('video') or {}).get('url')
    urllib.request.urlretrieve(url, out)
    with open(out + '.json', 'w') as f:
        json.dump({'endpoint': endpoint, 'args': args, 'url': url, 'request_id': sub['request_id']}, f, indent=1)
    print('ok', out, flush=True)

if __name__ == '__main__':
    cmd, endpoint, args = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
    if cmd == 'estimate':
        print(req('POST', f'{API}/estimate/{endpoint}', args))
    else:
        run(endpoint, args, sys.argv[4])
