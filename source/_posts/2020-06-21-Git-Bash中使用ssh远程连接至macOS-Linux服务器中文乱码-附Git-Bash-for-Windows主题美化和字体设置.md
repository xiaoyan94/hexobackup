---
title: Git Bash中使用ssh远程连接至macOS/Linux服务器中文乱码 附Git Bash for Windows主题美化和字体设置
date: 2020-06-21 23:36:03
tags: [Git Bash,ssh,中文乱码]
---

## Windows Git Bash 主题美化和字体设置

### ssh远程连接至服务器，终端命令提示符等乱码

**问题描述**：  

远程服务器上我使用的是oh-my-zsh终端并且使用了agnoster主题以及`Meslo LG L DZ Regular for Powerline`字体，在Windows上使用ssh远程连接至服务器时由于Windows没有Powerline字体，终端命令提示符有些非ASCII字符会乱码。

**解决方法**：  
1. 下载并安装字体  
在Windows上安装上述字体，点击 [Meslo LG L DZ Regular for Powerline][font] 下载字体至本地，双击下载的字体文件，安装字体。 
2. 修改Git Bash配置文件使用安装好的字体  
在Git Bash的Option中的Text选项卡也能设置字体，但是它的字体列表显示的不完全，很多Windows上已有的和上述新安装的Powerline字体在Git bash的设置里面都找不到。解决方法是直接修改Git Bash的配置文件，一般这个配置文件都是用户目录下的.minttyrc文件，即`~/.minttyrc`，如果没有这个文件也不影响下面的操作，会自动创建。在`~/.minttyrc`文件中填写以下配置：  

```plain
Font=Meslo LG L DZ Regular for Powerline
FontHeight=14
ForegroundColour=131,148,150
BackgroundColour=0,43,54
CursorColour=222,222,0

Black=7,54,66
BoldBlack=0,43,54
Red=220,50,47
BoldRed=203,75,22
Green=133,153,0
BoldGreen=88,110,117
Yellow=181,137,0
BoldYellow=101,123,131
Blue=38,139,210
BoldBlue=131,148,150
Magenta=211,54,130
BoldMagenta=108,113,196
Cyan=42,161,152
BoldCyan=147,161,161
White=238,232,213
BoldWhite=253,246,227
Locale=zh_CN 
Charset=UTF-8
CursorType=block

```

### 主题配色和隐藏用户主机名 

1. 主题美化：  
主题美化很简单，事实上已经配置完成了。以上配置文件中已经配置了字体`Font`和字体大小`FontHeight`，同时也配置了MinGW的主题配色为[mintty-colors-solarized][mintty]。重启Git Bash就能看到新的主题配色和字体。  
2. 隐藏命令提示符前的 '用户名@主机名'：  
打开Git Bash，输入命令`vi ~/.profile`打开.profile文件，按`i`进入`INSERT`模式，在文件末尾添加一行`export PS1="\W\[\033[32m\]\$(parse_git_branch)\[\033[00m\] $ "` ，按`ESC`，输入`:wq`保存退出。再次重启Git Bash，用户名和主机名都不会显示啦。如果想只显示用户名而不显示电脑主机名，就把输入的那一行改为~改成啥来着，忘了，百度一下吧~。  

---

## 使用ssh远程连接时中文乱码

**问题描述**：  
在本地Windows系统的Git Bash上使用ssh连接至远程的macOS服务器（Linux同理），中文还是乱码。  

**解决方法**:  
1. 在Windows上编辑`~/.minttyrc`文件，填入`Locale=zh_CN`和`Charset=UTF-8`这两行（上面修改主题部分给出的配置中已经有了这两行，没有就添加）以修改字符集为UTF-8；  
2. 在`ssh username@host`连接上远程服务器之后，输入`export LANG="zh_CN.UTF-8"`，中文即可显示正常。  
3. 第2点的命令只对本次连接有效，下次使用ssh重新连接远程服务器时还是会出现中文乱码。为使之永久生效，可以将上述export命令添加到远程主机（macOS/Linux）的环境变量中。  

---

写完才发现我远程oh-my-zsh（[macOS上][1]）使用的字体是 [Menlo-for-Powerline][font2] ，虽然Windows本地的Git Bash上配置的字体和远程终端不一样，但是也不影响，因为两者都是支持非ASCII字符显示的Powerline字体。  

链接：macOS终端iTerm2及其主题美化：  
1. [macOS使用oh-my-zsh美化Terminal,iTerm2,VSCode命令行终端配置教程][1]
2. [Mac OS 終端機美化(Mac OS Terminal)][2]

---

  [1]: https://www.ioiox.com/archives/34.html
  [2]: https://hsiangfeng.github.io/other/20200123/1105303313/
  [font2]: https://github.com/abertsch/Menlo-for-Powerline
  [font]: https://github.com/powerline/fonts/raw/master/Meslo%20Dotted/Meslo%20LG%20L%20DZ%20Regular%20for%20Powerline.ttf
  [mintty]: https://github.com/mavnn/mintty-colors-solarized

