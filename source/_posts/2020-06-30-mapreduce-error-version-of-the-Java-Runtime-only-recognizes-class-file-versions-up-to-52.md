---
title: Hadoop Mapreduce作业执行过程中报错 this version of the Java Runtime only recognizes class file versions up to 52.0
date: 2020-06-30 16:48:46
tags: [Hadoop,Java,Maven]
---

该错误告诉我们，我们的类是在比尝试运行它的版本更高的Java版本下编译的。 更具体地说，在这种情况下，我们使用Java 11编译了我们的类，并尝试使用Java 8运行它。

<!-- more -->

**问题描述：**

```bash
20/06/29 09:49:35 INFO mapreduce.Job: Job job_1593438508655_0001 running in uber mode : false
20/06/29 09:49:35 INFO mapreduce.Job:  map 0% reduce 0%
20/06/29 09:49:45 INFO mapreduce.Job: Task Id : attempt_1593438508655_0001_m_000000_0, Status : FAILED
Error: com/kumkee/userAgent/UserAgentParser has been compiled by a more recent version of the Java Runtime (class file version 55.0), this version of the Java Runtime only recognizes class file versions up to 52.0
20/06/29 09:49:51 INFO mapreduce.Job: Task Id : attempt_1593438508655_0001_m_000000_1, Status : FAILED
-->
Error: com/kumkee/userAgent/UserAgentParser has been compiled by a more recent version of the Java Runtime (class file version 55.0), this version of the Java Runtime only recognizes class file versions up to 52.0
20/06/29 09:49:58 INFO mapreduce.Job: Task Id : attempt_1593438508655_0001_m_000000_2, Status : FAILED
Error: com/kumkee/userAgent/UserAgentParser has been compiled by a more recent version of the Java Runtime (class file version 55.0), this version of the Java Runtime only recognizes class file versions up to 52.0
20/06/29 09:50:06 INFO mapreduce.Job:  map 100% reduce 100%
20/06/29 09:50:07 INFO mapreduce.Job: Job job_1593438508655_0001 failed with state FAILED due to: Task failed task_1593438508655_0001_m_000000
Job failed as tasks failed. failedMaps:1 failedReduces:0
```

**解决方法：**

[参考这篇文章得到](https://www.baeldung.com/java-lang-unsupportedclassversion)：这个错误是因为类com/kumkee/userAgent/UserAgentParser的编译版本与Hadoop服务器本地所用的Java版本不一致，只要重新用支持的版本号去重新编译引入的这个jar包就行了。

this version of the Java Runtime only recognizes class file versions up to 52.0 表示Java运行时的版本最高支持到52.0，也就是Java 8，因为机器上装的JDK版本就是JDK 1.8的。

修改报错的类的`pom.xml`,将编译器的版本数字从原本的11改为8，也就是java8：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.kumkee</groupId>
  <artifactId>UserAgentParser</artifactId>
  <version>0.0.1</version>

   <dependencies>
        <dependency>
                <groupId>junit</groupId>
                <artifactId>junit</artifactId>
                <version>4.8.2</version>
                <scope>test</scope>
        </dependency>
 </dependencies>
      <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.encoding>UTF-8</maven.compiler.encoding>
        <java.version>8</java.version>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>
</project>
```

然后使用maven重新编译安装到本地仓库：`mvn clean install`

再在Hadoop项目根目录下重新编译项目，将重新用java8编译的jar包包含进来：`mvn assembly:assembly`

最后将hadoop项目的jar文件重新上传至hadoop服务器即可正常运行。

---

关于主版本号和JAVA版本的对应关系如下：

major version | Java/JDK version
--------------|-----------------
45 | Java 1.1
46 | Java 1.2
47 | Java 1.3
48 | Java 1.4
49 | Java 5
50 | Java 6
51 | Java 7
52 | Java 8
53 | Java 9
54 | Java 10
55 | Java 11
56 | Java 12
57 | Java 13

最后，这种错误的意思就是程序的编译使用的版本与运行版本不一致所导致的，使用更高的java版本编译在低版本的java当然不能运行。

```bash
Exception in thread "main" java.lang.UnsupportedClassVersionError: com/baeldung/MajorMinorApp
  has been compiled by a more recent version of the Java Runtime (class file version 55.0),
  this version of the Java Runtime only recognizes class file versions up to 52.0
```
