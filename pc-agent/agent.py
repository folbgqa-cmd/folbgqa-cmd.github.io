"""برنامج الكمبيوتر: يستقبل الأوامر من الموقع وينفذها.
التشغيل:  pip install websockets pyautogui  ثم  python agent.py
"""
import asyncio, json, os, platform, secrets, subprocess, webbrowser
import pyautogui, websockets

PORT = 8765
PIN = os.environ.get("REMOTE_PIN") or "".join(secrets.choice("0123456789") for _ in range(6))

# المهام المسموحة فقط (عدّلها كما تشاء). لا يُنفَّذ أي أمر خارج هذه القائمة.
SYSTEM = platform.system()
TASKS = {
    "chrome":  {"Windows": ["cmd", "/c", "start", "chrome"], "Darwin": ["open", "-a", "Google Chrome"], "Linux": ["google-chrome"]},
    "notepad": {"Windows": ["notepad"], "Darwin": ["open", "-a", "TextEdit"], "Linux": ["gedit"]},
    "lock":    {"Windows": ["rundll32.exe", "user32.dll,LockWorkStation"], "Darwin": ["pmset", "displaysleepnow"], "Linux": ["loginctl", "lock-session"]},
    "sleep":   {"Windows": ["rundll32.exe", "powrprof.dll,SetSuspendState", "0,1,0"], "Darwin": ["pmset", "sleepnow"], "Linux": ["systemctl", "suspend"]},
}
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0

def run(msg):
    t = msg.get("type")
    if t == "move":
        pyautogui.moveRel(int(msg["dx"]), int(msg["dy"]), _pause=False)
    elif t == "click":
        pyautogui.click(button=msg.get("button", "left"), clicks=int(msg.get("clicks", 1)))
    elif t == "scroll":
        pyautogui.scroll(int(msg["amount"]))
    elif t == "type":
        pyautogui.write(str(msg["text"])[:500], interval=0.01)
    elif t == "key":
        keys = [k for k in str(msg["key"]).split("+") if k]
        pyautogui.hotkey(*keys) if len(keys) > 1 else pyautogui.press(keys[0])
    elif t == "url":
        u = str(msg["url"])
        if u.startswith(("http://", "https://")):
            webbrowser.open(u)
    elif t == "task":
        cmd = TASKS.get(msg.get("name"), {}).get(SYSTEM)
        if cmd:
            subprocess.Popen(cmd)

async def handler(ws):
    try:
        auth = json.loads(await asyncio.wait_for(ws.recv(), 10))
        if auth.get("type") != "auth" or not secrets.compare_digest(str(auth.get("pin")), PIN):
            await ws.send(json.dumps({"type": "auth", "ok": False}))
            await asyncio.sleep(2)
            return
        await ws.send(json.dumps({"type": "auth", "ok": True}))
        async for raw in ws:
            try:
                run(json.loads(raw))
            except Exception as e:
                print("خطأ:", e)
    except Exception:
        pass

async def main():
    print(f"\nرمز الدخول (PIN): {PIN}\nالمنفذ: {PORT}\n")
    async with websockets.serve(handler, "127.0.0.1", PORT):
        await asyncio.Future()

asyncio.run(main())
