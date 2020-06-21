---
title: Linux/macOS终端命令之————basename / dirname,从完整文件名获取文件名/路径名
date: 2020-06-21 19:57:45
tags: [Shell,Linux命令]
---

## Linux/macOS终端命令，如何从包含完整路径的文件名 获取 不包含文件夹路径只包含文件名的 基本名称

一个简单的提示，如果你正在编写一个 Linux shell 脚本，并且需要从一个完整的(规范的)目录 / 文件路径中获取文件名，你可以像这样使用 Linux basename 命令:

```bash
$ basename /foo/bar/baz/foo.txt
foo.txt
```

<!-- more -->

或者，如果您知道文件名扩展名并希望获取文件名的第一部分（基本文件名，即扩展名之前的部分），则也可以使用以下命令：

```bash
$ basename /foo/bar/baz/foo.txt .txt
foo
```

---

反之，如果想要只获得文件完整路径名的文件夹路径，去掉文件名称，则可以使用`dirname`命令：  

```bash
$ dirname /foo/bar/baz/foo.txt
/foo/bar/baz
```

---

结合 `find` 命令，实现查找指定目录及其子目录下所有以.pdf结尾的文件，并在find的查找结果中只显示文件名，不显示文件夹路径：

```bash
$ find . -iname "*python*.pdf" -exec basename {} \;
Python_Programming.pdf
Python核心编程(第二版).pdf
Python编程入门  第3版.pdf
think python.pdf
Python编程：从入门到实践.pdf
Flask Web开发 基于Python的Web应用开发实战 .pdf
PythonWeb开发 测试驱动方法 .pdf
Python数据分析基础.pdf
Python数据挖掘入门与实践.pdf
Python机器学习经典实例.pdf
```

关于`find`命令：  
`-name` 参数严格区分大小写，如`python`和`Python`不同，`.PDF`和`.pdf`也不同；  
`-iname` 参数则不区分大小写，包括文件名和扩展名都不区分，`python`和`Python`都会匹配，`.PDF`和`.pdf`也都会匹配。  

---

关于`basename`命令的更多功能：

```bash

BASENAME(1)               BSD General Commands Manual              BASENAME(1)

NAME
     basename, dirname -- return filename or directory portion of pathname

SYNOPSIS
     basename string [suffix]
     basename [-a] [-s suffix] string [...]
     dirname string

DESCRIPTION
     The basename utility deletes any prefix ending with the last slash `/'
     character present in string (after first stripping trailing slashes), and
     a suffix, if given.  The suffix is not stripped if it is identical to the
     remaining characters in string.  The resulting filename is written to the
     standard output.  A non-existent suffix is ignored.  If -a is specified,
     then every argument is treated as a string as if basename were invoked
     with just one argument.  If -s is specified, then the suffix is taken as
     its argument, and all other arguments are treated as a string.

     The dirname utility deletes the filename portion, beginning with the last
     slash `/' character to the end of string (after first stripping trailing
     slashes), and writes the result to the standard output.

EXAMPLES
     The following line sets the shell variable FOO to /usr/bin.

           FOO=`dirname /usr/bin/trail`

DIAGNOSTICS
     The basename and dirname utilities exit 0 on success, and >0 if an error
     occurs.

SEE ALSO
     csh(1), sh(1)

STANDARDS
     The basename and dirname utilities are expected to be IEEE Std 1003.2
     (``POSIX.2'') compatible.

BSD                             April 18, 1994                             BSD
```

---
[参考文章](https://alvinalexander.com/linux-unix/get-basename-from-full-filename-extension/)
