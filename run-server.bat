@echo off
cd /d "c:\Users\Administrator\Shopdee"
"C:\Program Files\nodejs\node.exe" "c:\Users\Administrator\Shopdee\node_modules\next\dist\bin\next" start -p 3000 >> "c:\Users\Administrator\Shopdee\server.log" 2>&1
