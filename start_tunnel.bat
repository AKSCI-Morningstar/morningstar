@echo off
start /B /MIN node D:\AKSCI\tunnel.js > %TEMP%\tunnel_out.txt 2> %TEMP%\tunnel_err.txt
