---
title: 检测断网自动重连WiFi脚本
tags: 脚本
date: 2023-01-14 08:46:32
---


最近公司网络出毛病老是隔段时间就自动断开连接，写了这个批处理脚本可以自动检测网络状态、断网自动重连WiFi，并记录断网重连日志。

<!-- more -->

```BAT
@echo off
if "%1"=="h" goto begin
start mshta vbscript:createobject("wscript.shell").run("""%~nx0"" h",0)(window.close)&&exit
echo %DATE%%TIME%
echo WIFI自动重连服务正在进行中.......
echo 停止服务请按 Ctrl+C
:begin
echo %date% %time%
ping google.com
rem echo %errorlevel%
if %errorlevel%==1 goto flushdns
if %errorlevel%==0 echo DNS google.com 解析正常...
goto loop

:flushdns
echo 尝试刷新DNS.......
ipconfig /flushdns
rem echo %errorlevel%
if %errorlevel%==0 goto ping2
goto loop

:ping2
@REM ping 10.20.30.40
ping baidu.com
rem echo %errorlevel%
if %errorlevel%==1 goto reconnect
if %errorlevel%==0 echo baidu.com 连接检测正常...
goto loop

:reconnect
echo ------------------------------------------------------------------ >> log.txt
echo %date% %time% 检测到断网状态，尝试重连中... >> log.txt
echo %date% %time% 执行网络主动断开命令 >> log.txt
netsh wlan disconnect
echo %date% %time% 正在重新连接中.... >> log.txt
netsh wlan connect ssid=Google name=Google
echo %date% %time% 已发送连接请求....ssid=Google >> log.txt
goto loop
 
:loop
timeout 60
cls
goto begin
```
