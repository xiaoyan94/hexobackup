---
title: CDH Hadoop安装过程
date: 2020-06-08 18:56:47
tags: [Hadoop,安装教程]
---

## 1. 安装环境

- 操作系统：Ubuntu 18.04 64位
- [Hadoop][1]版本：hadoop-2.6.0-cdh5.7.0.tar.gz
- JDK版本：jdk-8u241-linux-x64.tar.gz

## 2. [Hadoop伪分布式安装][2]

操作环境：macOS终端 `ssh` 远程连接Ubuntu  

### 2.1. 下载地址

```bash
wget https://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0.tar.gz #Hadoop安装包
wget http://enos.itcollege.ee/~jpoial/allalaadimised/jdk8/jdk-8u241-linux-x64.tar.gz #JDK安装包
```

<!-- more -->

### 2.2. JDK安装

```bash
tar -xvzf jdk-8u241-linux-x64.tar.gz -C ~/app #解压到~/app目录下
vi ~/.bash_profile #设置系统环境变量
```

vi编辑器添加以下内容

```bash
export JAVA_HOME=/root/app/jdk1.8.0_241
export PATH=$JAVA_HOME/bin:$PATH
```

生效环境变量

```bash
source ~/.bash_profile
java -version
```

### 2.3. Hadoop安装

```bash
apt install rsync
apt install ssh
ssh-keygen -t rsa
cp ~/.ssh/id_rsa.pub ~/.ssh/authorized_keys
ssh localhost -p 26885 #不用输入密码就能连接上了
tar -zxvf hadoop-2.6.0-cdh5.7.0.tar.gz -C ~/app/ #解压hadoop
```

### 2.4. Hadoop配置

```bash
vi app/hadoop-2.6.0-cdh5.7.0/etc/hadoop/hadoop-env.sh
```

配置`hadoop-env.sh`文件，修改JAVA_HOME；如果ssh端口不是默认的22则设置ssh端口

```bash
export JAVA_HOME=/root/app/jdk1.8.0_241
export HADOOP_SSH_OPTS="-p 26885"
```

> 如果控制台出现错误提示：Hadoop: connect to host localhost port 22: Connection refused when running start-dfs.sh  
那么可能的原因是ssh端口不是默认的22。需要在`hadoop安装目录`/etc/hadoop/hadoop-env.sh中添加`export HADOOP_SSH_OPTS="-p 26885"`，其中-p后面的参数是当前ssh使用的端口号  

配置`core-site.xml`,端口改为8020,配置`hadoop.tmp.dir`临时文件目录，因为默认为Linux临时目录每次重启都会清空

```xml
<configuration>
   <property>
      <name>fs.defaultFS</name>
      <value>hdfs://ip:8020</value>
   </property>
   <property>
      <name>hadoop.tmp.dir</name>
      <value>/home/root/app/tmp</value>
   </property>
</configuration>
```

上面的配置中，需要通过JavaAPI远程操作则ip不能配置为localhost，需要公网ip。

配置`hdfs-site.xml`

```xml
<configuration>
   <property>
      <name>dfs.replication</name>
      <value>1</value>
   </property>
</configuration>
```

---

### 2.5. 启动HDFS

格式化文件系统（仅仅第一次需要执行格式化）

```bash
bin/hdfs namenode -format
```

启动hdfs

```bash
sbin/start-dfs.sh
```

验证是否启动成功

```bash
jps
```

如果有以下java进程，说明启动成功

```bash
root@brave-post-2:~/app/hadoop-2.6.0-cdh5.7.0# jps
5745 Jps
5330 NameNode
5641 SecondaryNameNode
5439 DataNode
```
>
> - 也可以通过浏览器访问 <http://localhost:50070>（本地服务器），<http://ip:50070/>（远程服务器）  
>   - 如果浏览器打不开 HADOOP WEB 页面，请配置防火墙开放 **50070** 端口。Ubuntu可以使用 `ufw` 命令配置防火墙。  
> - `jps` 命令是JDK 1.5之后自带的查看Java进程的指令。

### 2.6. 停止HDFS

```bash
   root@brave-post-2:~/app/hadoop-2.6.0-cdh5.7.0# sbin/stop-dfs.sh
   20/06/08 09:18:17 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
   Stopping namenodes on [localhost]
   localhost: stopping namenode
   localhost: stopping datanode
   Stopping secondary namenodes [0.0.0.0]
   0.0.0.0: stopping secondarynamenode
   20/06/08 09:18:39 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
   root@brave-post-2:~/app/hadoop-2.6.0-cdh5.7.0#
   root@brave-post-2:~/app/hadoop-2.6.0-cdh5.7.0# jps # 再次输入jps查看Java进程，hdfs已经停止
   6943 Jps
   root@brave-post-2:~/app/hadoop-2.6.0-cdh5.7.0#
```

---

## 3. HDFS SHELL 常用命令

### 3.1. 将Hadoop bin目录添加到环境变量

```bash
vi ~/.bash_profile #设置系统环境变量
```

vi 编辑器添加以下内容

```bash
export HADOOP_HOME=/root/app/hadoop-2.6.0-cdh5.7.0
export PATH=$HADOOP_HOME/bin:$PATH
```

生效环境变量

```bash
root@brave-post-2:~/app/hadoop-2.6.0-cdh5.7.0# vi ~/.bash_profile
root@brave-post-2:~/app/hadoop-2.6.0-cdh5.7.0# source ~/.bash_profile
```

终端键入`hdfs`，若有输出hdfs命令的用法提示则环境变量配置成功。

### 3.2. HDFS SHELL 命令用法

```bash
root@brave-post-2:~/app/hadoop-2.6.0-cdh5.7.0# hdfs
   Usage: hdfs [--config confdir] COMMAND
      where COMMAND is one of:
   dfs                  run a filesystem command on the file systems supported in Hadoop.
   namenode -format     format the DFS filesystem
   secondarynamenode    run the DFS secondary namenode
   namenode             run the DFS namenode
   journalnode          run the DFS journalnode
   zkfc                 run the ZK Failover Controller daemon
   datanode             run a DFS datanode
   dfsadmin             run a DFS admin client
   haadmin              run a DFS HA admin client
   fsck                 run a DFS filesystem checking utility
   balancer             run a cluster balancing utility
   jmxget               get JMX exported values from NameNode or DataNode.
   mover                run a utility to move block replicas across
                     storage types
   oiv                  apply the offline fsimage viewer to an fsimage
   oiv_legacy           apply the offline fsimage viewer to an legacy fsimage
   oev                  apply the offline edits viewer to an edits file
   fetchdt              fetch a delegation token from the NameNode
   getconf              get config values from configuration
   groups               get the groups which users belong to
   snapshotDiff         diff two snapshots of a directory or diff the
                     current directory contents with a snapshot
   lsSnapshottableDir   list all snapshottable dirs owned by the current user
                     Use -help to see options
   portmap              run a portmap service
   nfs3                 run an NFS version 3 gateway
   cacheadmin           configure the HDFS cache
   crypto               configure HDFS encryption zones
   storagepolicies      list/get/set block storage policies
   version              print the version

   Most commands print help when invoked w/o parameters.
root@brave-post-2:~/app/hadoop-2.6.0-cdh5.7.0#

root@brave-post-2:~# hdfs dfs
Usage: hadoop fs [generic options]  #也可以使用Hadoop fs命令
   [-appendToFile <localsrc> ... <dst>]
   [-cat [-ignoreCrc] <src> ...]
   [-checksum <src> ...]
   [-chgrp [-R] GROUP PATH...]
   [-chmod [-R] <MODE[,MODE]... | OCTALMODE> PATH...]
   [-chown [-R] [OWNER][:[GROUP]] PATH...]
   [-copyFromLocal [-f] [-p] [-l] <localsrc> ... <dst>]
   [-copyToLocal [-p] [-ignoreCrc] [-crc] <src> ... <localdst>]
   [-count [-q] [-h] [-v] <path> ...]
   [-cp [-f] [-p | -p[topax]] <src> ... <dst>]
   [-createSnapshot <snapshotDir> [<snapshotName>]]
   [-deleteSnapshot <snapshotDir> <snapshotName>]
   [-df [-h] [<path> ...]]
   [-du [-s] [-h] <path> ...]
   [-expunge]
   [-find <path> ... <expression> ...]
   [-get [-p] [-ignoreCrc] [-crc] <src> ... <localdst>]
   [-getfacl [-R] <path>]
   [-getfattr [-R] {-n name | -d} [-e en] <path>]
   [-getmerge [-nl] <src> <localdst>]
   [-help [cmd ...]]
   [-ls [-d] [-h] [-R] [<path> ...]]
   [-mkdir [-p] <path> ...]
   [-moveFromLocal <localsrc> ... <dst>]
   [-moveToLocal <src> <localdst>]
   [-mv <src> ... <dst>]
   [-put [-f] [-p] [-l] <localsrc> ... <dst>]
   [-renameSnapshot <snapshotDir> <oldName> <newName>]
   [-rm [-f] [-r|-R] [-skipTrash] <src> ...]
   [-rmdir [--ignore-fail-on-non-empty] <dir> ...]
   [-setfacl [-R] [{-b|-k} {-m|-x <acl_spec>} <path>]|[--set <acl_spec> <path>]]
   [-setfattr {-n name [-v value] | -x name} <path>]
   [-setrep [-R] [-w] <rep> <path> ...]
   [-stat [format] <path> ...]
   [-tail [-f] <file>]
   [-test -[defsz] <path>]
   [-text [-ignoreCrc] <src> ...]
   [-touchz <path> ...]
   [-usage [cmd ...]]

Generic options supported are
-conf <configuration file>     specify an application configuration file
-D <property=value>            use value for given property
-fs <local|namenode:port>      specify a namenode
-jt <local|resourcemanager:port>    specify a ResourceManager
-files <comma separated list of files>    specify comma separated files to be copied to the map reduce cluster
-libjars <comma separated list of jars>    specify comma separated jar files to include in the classpath.
-archives <comma separated list of archives>    specify comma separated archives to be unarchived on the compute machines.

The general command line syntax is
bin/hadoop command [genericOptions] [commandOptions]

root@brave-post-2:~#
```

---

### 3.3. `ls`、`put`命令

- 查看目录列表 `ls`  
- 将本地文件保存到HDFS中 `put`  

```bash
root@brave-post-2:~# mkdir ~/data
root@brave-post-2:~# cd ~/data
root@brave-post-2:~/data# ls
root@brave-post-2:~/data# vi hello.txt
root@brave-post-2:~/data# cat hello.txt
hadoop welcome
hadoop hdfs
hadoop hello
root@brave-post-2:~/data# hadoop fs -ls /
20/06/08 21:59:27 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
ls: Call From localhost/127.0.0.1 to localhost:8020 failed on connection exception: java.net.ConnectException: Connection refused; For more details see:  http://wiki.apache.org/hadoop/ConnectionRefused
root@brave-post-2:~/data# $HADOOP_HOME/sbin/start-dfs.sh
20/06/08 22:02:12 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
Starting namenodes on [localhost]
localhost: starting namenode, logging to /root/app/hadoop-2.6.0-cdh5.7.0/logs/hadoop-root-namenode-brave-post-2.localdomain.out
localhost: starting datanode, logging to /root/app/hadoop-2.6.0-cdh5.7.0/logs/hadoop-root-datanode-brave-post-2.localdomain.out
Starting secondary namenodes [0.0.0.0]
0.0.0.0: starting secondarynamenode, logging to /root/app/hadoop-2.6.0-cdh5.7.0/logs/hadoop-root-secondarynamenode-brave-post-2.localdomain.out
20/06/08 22:02:31 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~/data# hadoop fs -ls /  #没有文件
20/06/08 22:02:36 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~/data# hadoop fs -put hello.txt /
20/06/08 22:03:08 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~/data# hadoop fs -ls /  #有了hello.txt
20/06/08 22:03:30 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
Found 1 items
-rw-r--r--   1 root supergroup         40 2020-06-08 22:03 /hello.txt
```

---

### 3.4. 查看文件内容  `text`、`cat`

```bash
root@brave-post-2:~/data# hadoop fs -text /hello.txt
20/06/08 22:08:59 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
hadoop welcome
hadoop hdfs
hadoop hello
root@brave-post-2:~/data# hadoop fs -cat /hello.txt
20/06/08 22:09:11 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
hadoop welcome
hadoop hdfs
hadoop hello
root@brave-post-2:~/data#
```

---

### 3.5. `mkdir、rmdir、get、copyFromLocal、rm`

- 创建目录 `mkdir`

```bash
root@brave-post-2:~/data# hadoop fs -mkdir /testdir
20/06/08 22:13:56 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~/data# hadoop fs  -ls /testdir
20/06/08 22:14:24 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~/data# hadoop fs  -ls /
20/06/08 22:14:32 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
Found 2 items
-rw-r--r--   1 root supergroup         40 2020-06-08 22:03 /hello.txt
drwxr-xr-x   - root supergroup          0 2020-06-08 22:13 /testdir
root@brave-post-2:~/data#  
```

- 递归创建目录 `-p` 参数

```bash
root@brave-post-2:~/data# hadoop fs -mkdir /a/b
20/06/08 22:17:12 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
mkdir: `/a/b': No such file or directory
root@brave-post-2:~/data# hadoop fs -mkdir -p /a/b
20/06/08 22:17:26 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~/data# hadoop fs  -ls /
20/06/08 22:17:53 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
Found 3 items
drwxr-xr-x   - root supergroup          0 2020-06-08 22:17 /a
-rw-r--r--   1 root supergroup         40 2020-06-08 22:03 /hello.txt
drwxr-xr-x   - root supergroup          0 2020-06-08 22:13 /testdir
```

- 递归列出所有目录和文件 `-R` 参数

```bash
root@brave-post-2:~/data# hadoop fs  -ls -R /
20/06/08 22:18:18 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
drwxr-xr-x   - root supergroup          0 2020-06-08 22:17 /a
drwxr-xr-x   - root supergroup          0 2020-06-08 22:17 /a/b
-rw-r--r--   1 root supergroup         40 2020-06-08 22:03 /hello.txt
drwxr-xr-x   - root supergroup          0 2020-06-08 22:13 /testdir
root@brave-post-2:~/data# hadoop fs  -lsr /  #或者lsr命令
lsr: DEPRECATED: Please use 'ls -R' instead.
20/06/08 22:18:40 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
drwxr-xr-x   - root supergroup          0 2020-06-08 22:17 /a
drwxr-xr-x   - root supergroup          0 2020-06-08 22:17 /a/b
-rw-r--r--   1 root supergroup         40 2020-06-08 22:03 /hello.txt
drwxr-xr-x   - root supergroup          0 2020-06-08 22:13 /testdir
root@brave-post-2:~/data#
```

- 从本地拷贝 `copyFromLocal`

```bash
root@brave-post-2:~/data# hadoop fs -copyFromLocal hello.txt /a/b/h.txt
20/06/08 22:25:06 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~/data# hadoop fs  -ls -R /
20/06/08 22:25:18 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
drwxr-xr-x   - root supergroup          0 2020-06-08 22:17 /a
drwxr-xr-x   - root supergroup          0 2020-06-08 22:25 /a/b
-rw-r--r--   1 root supergroup         40 2020-06-08 22:25 /a/b/h.txt
-rw-r--r--   1 root supergroup         40 2020-06-08 22:03 /hello.txt
drwxr-xr-x   - root supergroup          0 2020-06-08 22:13 /testdir
root@brave-post-2:~/data# hadoop fs -cat /a/b/h.txt
20/06/08 22:26:07 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
hadoop welcome
hadoop hdfs
hadoop hello
```

- 从HDFS获取文件 `get`

```bash
root@brave-post-2:~/data# ls
hello.txt
root@brave-post-2:~/data# hadoop fs -get /a/b/h.txt
20/06/08 22:27:09 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~/data# ls
hello.txt  h.txt
root@brave-post-2:~/data# cat h.txt
hadoop welcome
hadoop hdfs
hadoop hello
```

- 删除文件 `rm`

```bash
root@brave-post-2:~/data# hadoop fs -rm /hello.txt
20/06/08 22:28:16 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
Deleted /hello.txt
root@brave-post-2:~/data# hadoop fs -ls /
20/06/08 22:28:37 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
Found 2 items
drwxr-xr-x   - root supergroup          0 2020-06-08 22:17 /a
drwxr-xr-x   - root supergroup          0 2020-06-08 22:13 /testdir  
```

- 从本地 `put` 文件至HDFS

```bash
root@brave-post-2:~/data# hadoop fs -put hello.txt /
20/06/08 22:29:36 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~/data# ls -lh /root/software/hadoop-2.6.0-cdh5.7.0.tar.gz
-rw-r--r-- 1 root root 298M Feb 20  2018 /root/software/hadoop-2.6.0-cdh5.7.0.tar.gz
root@brave-post-2:~/data# hadoop fs -put /root/software/hadoop-2.6.0-cdh5.7.0.tar.gz /
20/06/08 22:33:27 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~/data# hadoop fs -ls -R /
20/06/08 22:33:59 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
drwxr-xr-x   - root supergroup          0 2020-06-08 22:17 /a
drwxr-xr-x   - root supergroup          0 2020-06-08 22:25 /a/b
-rw-r--r--   1 root supergroup         40 2020-06-08 22:25 /a/b/h.txt
-rw-r--r--   1 root supergroup  311585484 2020-06-08 22:33 /hadoop-2.6.0-cdh5.7.0.tar.gz
-rw-r--r--   1 root supergroup         40 2020-06-08 22:29 /hello.txt
drwxr-xr-x   - root supergroup          0 2020-06-08 22:13 /testdir
```

- 文件大小以GB、MB为单位显示而不是直接显示字节数 `-h` 参数

```bash
root@brave-post-2:~/data# hadoop fs -ls -R -h /
20/06/08 22:51:11 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
drwxr-xr-x   - root supergroup          0 2020-06-08 22:17 /a
drwxr-xr-x   - root supergroup          0 2020-06-08 22:25 /a/b
-rw-r--r--   1 root supergroup         40 2020-06-08 22:25 /a/b/h.txt
-rw-r--r--   1 root supergroup    297.2 M 2020-06-08 22:33 /hadoop-2.6.0-cdh5.7.0.tar.gz
-rw-r--r--   1 root supergroup         40 2020-06-08 22:29 /hello.txt
drwxr-xr-x   - root supergroup          0 2020-06-08 22:13 /testdir
root@brave-post-2:~/data#
```

- 删除文件夹 `rmdir`

```bash
root@brave-post-2:~/data# hadoop fs -mkdir -p /a/b/c
20/06/08 23:27:22 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~/data# hadoop fs -ls -R -h /a/
20/06/08 23:27:40 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
drwxr-xr-x   - root supergroup          0 2020-06-08 23:27 /a/b
drwxr-xr-x   - root supergroup          0 2020-06-08 23:27 /a/b/c
-rw-r--r--   1 root supergroup         40 2020-06-08 22:25 /a/b/h.txt
root@brave-post-2:~/data# hadoop fs -rmdir /a/b/c
20/06/08 23:27:51 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~/data# hadoop fs -ls -R -h /a/
20/06/08 23:27:58 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
drwxr-xr-x   - root supergroup          0 2020-06-08 23:27 /a/b
-rw-r--r--   1 root supergroup         40 2020-06-08 22:25 /a/b/h.txt
root@brave-post-2:~/data#
```

---

### 3.6. HDFS Web 管理页面

URL：<http://23.105.206.170:50070/explorer.html#/>

- 浏览HDFS文件系统目录，查看文件信息  

![浏览HDFS文件系统目录](./imgs/hdfs01.png)

---

- 查看block信息  

![查看文件block信息](./imgs/hdfs02.png)

---

## 4. 参考文档

- <https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html>
- <https://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/hadoop-project-dist/hadoop-common/SingleCluster.html>
- <https://www.youtube.com/watch?v=k3Bb0fVVTZk&list=PLhXu26RzZZTzveyPX8XgTBKf3tjxjA1tW&index=3>

---

 [1]: https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html
 [2]: https://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/hadoop-project-dist/hadoop-common/SingleCluster.html
