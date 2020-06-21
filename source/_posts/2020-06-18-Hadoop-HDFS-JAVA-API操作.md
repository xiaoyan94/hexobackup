---
title: Hadoop HDFS JAVA API操作
date: 2020-06-18 10:48:47
tags: [Hadoop,HDFS,大数据]
---

## 1. 环境搭建

- IntelliJ IDEA 新建 Maven 项目
  - 勾选 `Create from archetype`
  - 选择 `org.apache.maven.archetypes:maven-archetype-quickstart`,点击`Next`
  - Maven home directory可以默认，也可以选择自己安装的Maven目录
  - User settings file勾选`Override`，选择用户自定义的`~/.m2/settings.xml`文件
- `pom.xml` 配置

<!-- more -->

```xml
<?xml version="1.0" encoding="UTF-8"?>

<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>org.example</groupId>
  <artifactId>hadoop-train</artifactId>
  <version>1.0</version>

  <name>hadoop-train</name>
  <!-- FIXME change it to the project's website -->
  <url>http://www.example.com</url>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>1.7</maven.compiler.source>
    <maven.compiler.target>1.7</maven.compiler.target>

    <!-- 自定义属性 -->
    <hadoop.version>2.6.0-cdh5.7.0</hadoop.version>

  </properties>

  <repositories>
    <!-- 默认仓库没有cdh版本的hadoop，需要添加CDH仓库 -->
    <repository>
      <id>cloudera</id>
      <url>https://repository.cloudera.com/artifactory/cloudera-repos/</url>
    </repository>
  </repositories>

  <dependencies>
    <!--添加Hadoop依赖-->
    <dependency>
      <groupId>org.apache.hadoop</groupId>
      <artifactId>hadoop-client</artifactId>
      <!-- 使用${}使用上面自定义的properties -->
      <version>${hadoop.version}</version>
    </dependency>
    <!--添加单元测试-->
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.11</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <pluginManagement><!-- lock down plugins versions to avoid using Maven defaults (may be moved to parent pom) -->
      <plugins>
        <!-- clean lifecycle, see https://maven.apache.org/ref/current/maven-core/lifecycles.html#clean_Lifecycle -->
        <plugin>
          <artifactId>maven-clean-plugin</artifactId>
          <version>3.1.0</version>
        </plugin>
        <!-- default lifecycle, jar packaging: see https://maven.apache.org/ref/current/maven-core/default-bindings.html#Plugin_bindings_for_jar_packaging -->
        <plugin>
          <artifactId>maven-resources-plugin</artifactId>
          <version>3.0.2</version>
        </plugin>
        <plugin>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>3.8.0</version>
        </plugin>
        <plugin>
          <artifactId>maven-surefire-plugin</artifactId>
          <version>2.22.1</version>
        </plugin>
        <plugin>
          <artifactId>maven-jar-plugin</artifactId>
          <version>3.0.2</version>
        </plugin>
        <plugin>
          <artifactId>maven-install-plugin</artifactId>
          <version>2.5.2</version>
        </plugin>
        <plugin>
          <artifactId>maven-deploy-plugin</artifactId>
          <version>2.8.2</version>
        </plugin>
        <!-- site lifecycle, see https://maven.apache.org/ref/current/maven-core/lifecycles.html#site_Lifecycle -->
        <plugin>
          <artifactId>maven-site-plugin</artifactId>
          <version>3.7.1</version>
        </plugin>
        <plugin>
          <artifactId>maven-project-info-reports-plugin</artifactId>
          <version>3.0.0</version>
        </plugin>
      </plugins>
    </pluginManagement>
  </build>
</project>
```

## 2. 编写测试类

### 2.1. 调用`fileSystem.mkdir`方法创建文件夹

测试代码：

```java
package org.example;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.net.URI;

/**
 * Hadoop HDFS Java API 操作
 */
public class HDFSApp {

    public static String HDFS_PATH = "hdfs://23.105.206.170:8020";

    FileSystem fileSystem = null;
    Configuration configuration = null;

    @Test
    public void mkdir() throws Exception{
        fileSystem.mkdirs(new Path("/hdfsapi/test"));
    }

    @Before
    public void setUp() throws Exception{
        System.out.println("HDFSApp.setUp");
        configuration = new Configuration();
        fileSystem = FileSystem.get(new URI(HDFS_PATH), configuration, "root");

    }

    @After
    public void tearDown() throws Exception{
        configuration = null;
        fileSystem = null;

        System.out.println("HDFSApp.tearDown");
    }
}
```

#### 2.1.1. 异常处理

- 连接异常：`java.net.ConnectException: Connection refused`  

异常代码：

```java
HDFSApp.setUp
log4j:WARN No appenders could be found for logger (org.apache.hadoop.metrics2.lib.MutableMetricsFactory).
log4j:WARN Please initialize the log4j system properly.
log4j:WARN See http://logging.apache.org/log4j/1.2/faq.html#noconfig for more info.
WARNING: An illegal reflective access operation has occurred
WARNING: Illegal reflective access by org.apache.hadoop.security.authentication.util.KerberosUtil (file:/Users/yan/.m2/repository/org/apache/hadoop/hadoop-auth/2.6.0-cdh5.7.0/hadoop-auth-2.6.0-cdh5.7.0.jar) to method sun.security.krb5.Config.getInstance()
WARNING: Please consider reporting this to the maintainers of org.apache.hadoop.security.authentication.util.KerberosUtil
WARNING: Use --illegal-access=warn to enable warnings of further illegal reflective access operations
WARNING: All illegal access operations will be denied in a future release
HDFSApp.tearDown

java.net.ConnectException: Call From Mac-mini.local/127.0.0.1 to 23.105.206.170.16clouds.com:8020 failed on connection exception: java.net.ConnectException: Connection refused; For more details see:  http://wiki.apache.org/hadoop/ConnectionRefused

 at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
 ...(省略)
 at com.intellij.rt.junit.JUnitStarter.main(JUnitStarter.java:58)

Caused by: java.net.ConnectException: Connection refused
 at java.base/sun.nio.ch.Net.pollConnect(Native Method)
 ...
 ... 44 more


Process finished with exit code 255

```

---

解决方法：  
（1）使用`jps`命令查看Hdfs是否运行；  
（2）查看服务器防火墙是否开放`8020`端口；  
（3）查看服务器Hadoop安装目录下etc/core-site.xml中地址是否配置为服务器公网ip；  

```bash
root@brave-post-2:~# $HADOOP_HOME/sbin/start-dfs.sh  
20/06/12 02:10:20 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
Starting namenodes on [localhost]
localhost: starting namenode, logging to /root/app/hadoop-2.6.0-cdh5.7.0/logs/hadoop-root-namenode-brave-post-2.localdomain.out
localhost: starting datanode, logging to /root/app/hadoop-2.6.0-cdh5.7.0/logs/hadoop-root-datanode-brave-post-2.localdomain.out
Starting secondary namenodes [0.0.0.0]
0.0.0.0: starting secondarynamenode, logging to /root/app/hadoop-2.6.0-cdh5.7.0/logs/hadoop-root-secondarynamenode-brave-post-2.localdomain.out
20/06/12 02:10:40 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable

root@brave-post-2:~# ufw status
Status: inactive
root@brave-post-2:~# jps
1210 NameNode
1868 Jps
1326 DataNode
1535 SecondaryNameNode

root@brave-post-2:~# cat $HADOOP_HOME/etc/hadoop/core-site.xml  
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<!--
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. See accompanying LICENSE file.
-->

<!-- Put site-specific property overrides in this file. -->

<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://localhost:8020</value>
        #将localhost改为公网IP地址！！！！实测不能为0.0.0.0，写文件时会报异常,下面的异常和这里配置错误有关
    </property>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/home/root/app/tmp</value>
    </property>
</configuration>

root@brave-post-2:~# $HADOOP_HOME/sbin/stop-all.sh  
This script is Deprecated. Instead use stop-dfs.sh and stop-yarn.sh
20/06/12 03:14:37 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
Stopping namenodes on [localhost]
localhost: stopping namenode
localhost: stopping datanode
Stopping secondary namenodes [0.0.0.0]
0.0.0.0: stopping secondarynamenode
20/06/12 03:14:59 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
stopping yarn daemons
no resourcemanager to stop
localhost: no nodemanager to stop
no proxyserver to stop

root@brave-post-2:~# vi $HADOOP_HOME/etc/hadoop/core-site.xml
root@brave-post-2:~# cat $HADOOP_HOME/etc/hadoop/core-site.xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<!--
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. See accompanying LICENSE file.
-->

<!-- Put site-specific property overrides in this file. -->

<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://0.0.0.0:8020</value> #这里得填公网IP地址，不能为0.0.0.0
    </property>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/home/root/app/tmp</value>
    </property>
</configuration>

root@brave-post-2:~# $HADOOP_HOME/sbin/start-dfs.sh
20/06/12 03:16:35 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
Starting namenodes on [0.0.0.0]
0.0.0.0: starting namenode, logging to /root/app/hadoop-2.6.0-cdh5.7.0/logs/hadoop-root-namenode-brave-post-2.localdomain.out
localhost: starting datanode, logging to /root/app/hadoop-2.6.0-cdh5.7.0/logs/hadoop-root-datanode-brave-post-2.localdomain.out
Starting secondary namenodes [0.0.0.0]
0.0.0.0: starting secondarynamenode, logging to /root/app/hadoop-2.6.0-cdh5.7.0/logs/hadoop-root-secondarynamenode-brave-post-2.localdomain.out
20/06/12 03:16:55 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
root@brave-post-2:~#  
```

---

- 访问控制权限异常：`org.apache.hadoop.security.AccessControlException: Permission denied: user=yan, access=WRITE, inode="/":root:supergroup:drwxr-xr-x`
  - 解决方法：使用`FileSystem.get` 的重载方法，给出user参数值为root

### 2.2. 调用`FileSystem.create`方法创建文件

测试代码：

```java
    @Test
    public void createFile() throws Exception{
        FSDataOutputStream fsDataOutputStream = fileSystem.create(new Path("/hdfsapi/test/a.txt"));
        fsDataOutputStream.write("Hello hadoop字节数组".getBytes());
        fsDataOutputStream.flush();
        fsDataOutputStream.close();
    }

```

---

#### 2.2.1. 异常处理

运行上面方法，hdfs无法写入内容，出现以下异常

```java
org.apache.hadoop.ipc.RemoteException(java.io.IOException): File /hdfsapi/test/a.txt could only be replicated to 0 nodes instead of minReplication (=1).  There are 1 datanode(s) running and 1 node(s) are excluded in this operation.
 at org.apache.hadoop.hdfs.server.blockmanagement.BlockManager.chooseTarget4NewBlock(BlockManager.java:1595)
 at org.apache.hadoop.hdfs.server.namenode.FSNamesystem.getAdditionalBlock(FSNamesystem.java:3287)
 at org.apache.hadoop.hdfs.server.namenode.NameNodeRpcServer.addBlock(NameNodeRpcServer.java:677)
 at org.apache.hadoop.hdfs.server.namenode.AuthorizationProviderProxyClientProtocol.addBlock(AuthorizationProviderProxyClientProtocol.java:213)
 at org.apache.hadoop.hdfs.protocolPB.ClientNamenodeProtocolServerSideTranslatorPB.addBlock(ClientNamenodeProtocolServerSideTranslatorPB.java:485)
 at org.apache.hadoop.hdfs.protocol.proto.ClientNamenodeProtocolProtos$ClientNamenodeProtocol$2.callBlockingMethod(ClientNamenodeProtocolProtos.java)
 at org.apache.hadoop.ipc.ProtobufRpcEngine$Server$ProtoBufRpcInvoker.call(ProtobufRpcEngine.java:617)
 at org.apache.hadoop.ipc.RPC$Server.call(RPC.java:1073)
 at org.apache.hadoop.ipc.Server$Handler$1.run(Server.java:2086)
 at org.apache.hadoop.ipc.Server$Handler$1.run(Server.java:2082)
 at java.security.AccessController.doPrivileged(Native Method)
 at javax.security.auth.Subject.doAs(Subject.java:422)
 at org.apache.hadoop.security.UserGroupInformation.doAs(UserGroupInformation.java:1693)
 at org.apache.hadoop.ipc.Server$Handler.run(Server.java:2080)


 at org.apache.hadoop.ipc.Client.call(Client.java:1471)
 at org.apache.hadoop.ipc.Client.call(Client.java:1408)
 at org.apache.hadoop.ipc.ProtobufRpcEngine$Invoker.invoke(ProtobufRpcEngine.java:230)
 at com.sun.proxy.$Proxy15.addBlock(Unknown Source)
 at org.apache.hadoop.hdfs.protocolPB.ClientNamenodeProtocolTranslatorPB.addBlock(ClientNamenodeProtocolTranslatorPB.java:404)
 at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
 at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
 at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
 at java.base/java.lang.reflect.Method.invoke(Method.java:567)
 at org.apache.hadoop.io.retry.RetryInvocationHandler.invokeMethod(RetryInvocationHandler.java:256)
 at org.apache.hadoop.io.retry.RetryInvocationHandler.invoke(RetryInvocationHandler.java:104)
 at com.sun.proxy.$Proxy16.addBlock(Unknown Source)
 at org.apache.hadoop.hdfs.DFSOutputStream$DataStreamer.locateFollowingBlock(DFSOutputStream.java:1704)
 at org.apache.hadoop.hdfs.DFSOutputStream$DataStreamer.nextBlockOutputStream(DFSOutputStream.java:1500)
 at org.apache.hadoop.hdfs.DFSOutputStream$DataStreamer.run(DFSOutputStream.java:668)
```

---

出现上面异常的原因有很多，具体信息可以查看日志文件`hadoop-root-datanode-brave-post-2.localdomain.log`：  
经过一番盘查试错，终，之前在`core-site.xml`文件中，将localhost改为0.0.0.0，导致了这个问题。  
**正确配置**应为  

```xml
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://公网ip:8020</value>
    </property>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/home/root/app/tmp</value>
    </property>
</configuration>
```

---

重新启动HDFS之后，打开浏览器查看DataNode info：  

![正确配置时DataNode信息](imgs/datanode_ip.png)
此时DN节点显示的是公网ip+端口，客户端重新运行测试类`createFile`方法，成功创建并写入文本文件内容。Hadoop运行在公网服务器时，想要Java客户端能够通过Java API操作HDFS，必须通过配置让节点在 Datanode Information 中显示的是正在使用公网ip地址。

- 试错期间还遇到了clusterID不一致的问题，查看datanode节点的日志输出异常`java.io.IOException: Incompatible clusterIDs`：

```log
2020-06-12 07:16:54,343 WARN org.apache.hadoop.hdfs.server.common.Storage: java.io.IOException: Incompatible clusterIDs in /home/root/app/tmp/dfs/data: namenode clusterID = CID-401a9f8e-e699-4aa9-9f8c-0ef5bd016863; datanode clusterID = CID-42b312a4-8c81-4582-8d33-d8dafa23fe4e
2020-06-12 07:16:54,344 FATAL org.apache.hadoop.hdfs.server.datanode.DataNode: Initialization failed for Block pool <registering> (Datanode Uuid unassigned) service to /0.0.0.0:8020. Exiting.
java.io.IOException: All specified directories are failed to load.
 at org.apache.hadoop.hdfs.server.datanode.DataStorage.recoverTransitionRead(DataStorage.java:478)
 at org.apache.hadoop.hdfs.server.datanode.DataNode.initStorage(DataNode.java:1394)
 at org.apache.hadoop.hdfs.server.datanode.DataNode.initBlockPool(DataNode.java:1355)
 at org.apache.hadoop.hdfs.server.datanode.BPOfferService.verifyAndSetNamespaceInfo(BPOfferService.java:317)
 at org.apache.hadoop.hdfs.server.datanode.BPServiceActor.connectToNNAndHandshake(BPServiceActor.java:228)
 at org.apache.hadoop.hdfs.server.datanode.BPServiceActor.run(BPServiceActor.java:829)
 at java.lang.Thread.run(Thread.java:748)
2020-06-12 07:16:54,349 WARN org.apache.hadoop.hdfs.server.datanode.DataNode: Ending block pool service for: Block pool <registering> (Datanode Uuid unassigned) service to /0.0.0.0:8020
2020-06-12 07:16:54,352 INFO org.apache.hadoop.hdfs.server.datanode.DataNode: Removed Block pool <registering> (Datanode Uuid unassigned)
2020-06-12 07:16:56,352 WARN org.apache.hadoop.hdfs.server.datanode.DataNode: Exiting Datanode
2020-06-12 07:16:56,354 INFO org.apache.hadoop.util.ExitUtil: Exiting with status 0
2020-06-12 07:16:56,355 INFO org.apache.hadoop.hdfs.server.datanode.DataNode: SHUTDOWN_MSG:
/************************************************************
SHUTDOWN_MSG: Shutting down DataNode at localhost/127.0.0.1
```

---

找到[解决方法](https://blog.csdn.net/u011630575/article/details/61191443)：  
出现该问题的原因：在第一次格式化dfs后，启动并使用了hadoop，后来又重新执行了格式化命令（hdfs namenode -format)，这时namenode的clusterID会重新生成，而datanode的clusterID 保持不变。  
解决方法：将datanode的clusterID改成和上面日志中的namenode的clusterID一样。

```bash
root@brave-post-2:/home/root/app/tmp/dfs/data/current# cat VERSION
#Fri Jun 12 06:46:01 EDT 2020
storageID=DS-af0a3f1e-d5a0-4141-95c2-a4615c461743
clusterID=CID-42b312a4-8c81-4582-8d33-d8dafa23fe4e
cTime=0
datanodeUuid=17c0f342-bbc3-45d1-b3c7-54e3fca3cda5
storageType=DATA_NODE
layoutVersion=-56

root@brave-post-2:/home/root/app/tmp/dfs/data/current# vi VERSION

root@brave-post-2:/home/root/app/tmp/dfs/data/current# cat VERSION
#Fri Jun 12 07:30:43 EDT 2020
storageID=DS-af0a3f1e-d5a0-4141-95c2-a4615c461743
clusterID=CID-401a9f8e-e699-4aa9-9f8c-0ef5bd016863
cTime=0
datanodeUuid=17c0f342-bbc3-45d1-b3c7-54e3fca3cda5
storageType=DATA_NODE
layoutVersion=-56

root@brave-post-2:/home/root/app/tmp/dfs/data/current#
```

### 2.3. 副本系数 replication factor

**问题**:我们已经在hdfs-site.xmL中设置了副本系数为1,为什么此时查询文件看到的是3呢?  

如果你是通过hdfs shell的方式put上去的，那么才采用xml配置中的副本系数1；  
如果我们是java api上传上去的，在本地我们并没有手工设置副本系数，所以采用的是hadoop默认的副本系数3.

测试代码：

```java
package org.example;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import org.apache.hadoop.io.IOUtils;
import org.apache.hadoop.util.Progressable;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.*;
import java.net.URI;

/**
 * Hadoop HDFS Java API 操作
 */
public class HDFSApp {

    public static String HDFS_PATH = "hdfs://23.105.206.170:8020";

    FileSystem fileSystem = null;
    Configuration configuration = null;

    /**
     * 查看文件内容
     * @throws IOException
     */
    @Test
    public void cat() throws IOException {
        FSDataInputStream in = fileSystem.open(new Path("/f.txt"));
        IOUtils.copyBytes(in, System.out, 1024);
        in.close();
    }

    @Test
    public void listFiles() throws IOException {
        FileStatus[] fileStatuses = fileSystem.listStatus(new Path("/"));
        for (FileStatus fileStatus:
             fileStatuses) {
            System.out.println(fileStatus);
        }
    }

    @Test
    public void delete() throws IOException{
        boolean delete = fileSystem.delete(new Path("/hdfsapi/test/e.txt"),
                false);
        System.out.println(delete);
    }

    @Test
    public void rename() throws IOException {
        boolean rename = fileSystem.rename(new Path("/f.txt"), new Path("/f2" +
                ".txt"));
        System.out.println(rename);
    }

    @Test
    public void copyToLocalFile() throws IOException {
        fileSystem.copyToLocalFile(new Path("/check.sh"),
                new Path("/Users/yan/testShell/check1.sh"));
    }

    @Test
    public void copyFromLocalFile() throws IOException {
        fileSystem.copyFromLocalFile(new Path("/Users/yan/testShell/check.sh"),
                new Path("/check.sh"));
    }

    @Test
    public void copyFromLocalFileWithProgress() throws IOException {
        String src = "/Users/yan/Downloads/考试安排表.xlsx";

        final Integer[] i = {0};

        InputStream in =
                new BufferedInputStream(new FileInputStream(new File(src)));
        FSDataOutputStream output = fileSystem.create(new Path("/wechat.dmg"), new Progressable() {
            @Override
            public void progress() {
                int size = i[0]++;

                System.out.println("上传进度" + size +"");

            }
        });
        IOUtils.copyBytes(in,output,1024);
    }

    @Test
    public void mkdir() throws Exception{
        fileSystem.mkdirs(new Path("/hdfsapi/test"));
    }

    @Test
    public void createFile() throws Exception{
        FSDataOutputStream fsDataOutputStream = fileSystem.create(new Path(
                "/f.txt"));
        fsDataOutputStream.write("Hello  hadoop字节数组".getBytes());
        fsDataOutputStream.flush();
        fsDataOutputStream.close();
    }

    @Before
    public void setUp() throws Exception{
        System.out.println("HDFSApp.setUp");
        configuration = new Configuration();
        fileSystem = FileSystem.get(new URI(HDFS_PATH), configuration, "root");

    }

    @After
    public void tearDown() throws Exception{
        configuration = null;
        fileSystem = null;

        System.out.println("HDFSApp.tearDown");
    }
}
```
