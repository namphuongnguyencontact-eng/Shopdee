@echo off
cd /d "c:\Users\Administrator\Shopdee"
"C:\caddy\caddy.exe" run --config "c:\Users\Administrator\Shopdee\Caddyfile" >> "c:\Users\Administrator\Shopdee\caddy.log" 2>&1
