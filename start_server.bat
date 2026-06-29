@echo off
start /B /MIN node D:\AKSCI\backend\server.js > %TEMP%\server_out.txt 2> %TEMP%\server_err.txt
