@echo off
title cfwk-firadio-build-run
cd %~dp0..\
copy node_modules\sqlite3\build\Release\node_sqlite3.node build\node_sqlite3.node
node esbuild.js
pause
