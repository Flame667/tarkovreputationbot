@echo off

set NodePackagesPath=C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Node.js

set Path=%NodePackagesPath%\node_modules\.bin;%PATH%
set Path=%NodePackagesPath%;%PATH%

set NODE_PATH=%NodePackagesPath%\node_modules;%NODE_PATH%
set NODE_ENV=production

echo Starting Bot

node bot
