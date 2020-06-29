---
title: Maven编译报错：[ERROR] 不再支持源选项 5。请使用 7 或更高版本。[ERROR] 不再支持目标选项 5。请使用 7 或更高版本
date: 2020-06-28 17:23:28
tags: [Maven]
---

<!-- more -->

## Maven编译报错：[ERROR] 不再支持源选项 5。请使用 7 或更高版本。[ERROR] 不再支持目标选项 5。请使用 7 或更高版本

- 执行 `mvn package -DskipTests`, Maven编译报错信息：

   ```bash
    ✘  yan  ~/data/UserAgentParser   master ●  mvn package -DskipTests
    [INFO] Scanning for projects...
    [INFO]
    [INFO] ---------------------< com.kumkee:UserAgentParser >---------------------
    [INFO] Building User Agent Parser 0.0.1
    [INFO] --------------------------------[ jar ]---------------------------------
    Downloading from central: https://repo.maven.apache.org/maven2/junit/junit/4.8.2/junit-4.8.2.pom
    Downloaded from central: https://repo.maven.apache.org/maven2/junit/junit/4.8.2/junit-4.8.2.pom (1.5 kB at 1.3 kB/s)
    Downloading from central: https://repo.maven.apache.org/maven2/junit/junit/4.8.2/junit-4.8.2.jar
    Downloaded from central: https://repo.maven.apache.org/maven2/junit/junit/4.8.2/junit-4.8.2.jar (237 kB at 204 kB/s)
    [INFO]
    [INFO] --- maven-resources-plugin:2.6:resources (default-resources) @ UserAgentParser ---
    [WARNING] Using platform encoding (UTF-8 actually) to copy filtered resources, i.e. build is platform dependent!
    [INFO] skip non existing resourceDirectory /Users/yan/data/UserAgentParser/src/main/resources
    [INFO]
    [INFO] --- maven-compiler-plugin:3.1:compile (default-compile) @ UserAgentParser ---
    [INFO] Changes detected - recompiling the module!
    [WARNING] File encoding has not been set, using platform encoding UTF-8, i.e. build is platform dependent!
    [INFO] Compiling 7 source files to /Users/yan/data/UserAgentParser/target/classes
    [INFO] -------------------------------------------------------------
    [ERROR] COMPILATION ERROR :
    [INFO] -------------------------------------------------------------
    [ERROR] 不再支持源选项 5。请使用 7 或更高版本。
    [ERROR] 不再支持目标选项 5。请使用 7 或更高版本。
    [INFO] 2 errors
    [INFO] -------------------------------------------------------------
    [INFO] ------------------------------------------------------------------------
    [INFO] BUILD FAILURE
    [INFO] ------------------------------------------------------------------------
    [INFO] Total time:  3.573 s
    [INFO] Finished at: 2020-06-28T17:16:58+08:00
    [INFO] ------------------------------------------------------------------------
    [ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.1:compile (default-compile) on project UserAgentParser: Compilation failure: Compilation failure:
    [ERROR] 不再支持源选项 5。请使用 7 或更高版本。
    [ERROR] 不再支持目标选项 5。请使用 7 或更高版本。
    [ERROR] -> [Help 1]
    [ERROR]
    [ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
    [ERROR] Re-run Maven using the -X switch to enable full debug logging.
    [ERROR]
    [ERROR] For more information about the errors and possible solutions, please read the following articles:
    [ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/MojoFailureException
   ```

   >[ERROR] 不再支持源选项 5。请使用 7 或更高版本。
    [ERROR] 不再支持目标选项 5。请使用 7 或更高版本。
    可以通过设置编译器版本来解决。
   >
   >可以看到除了编译Error报错，还有一个[WARNING] File encoding has not been set, using platform encoding UTF-8, i.e. build is platform dependent!，这个只需要设置文件编码即可。

- 解决方法：在 `pom.xml`文件中指定Maven编译所使用的JDK版本：
  
   ```xml
   <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
   <modelVersion>4.0.0</modelVersion>
   <groupId>com.kumkee</groupId>
   <artifactId>UserAgentParser</artifactId>
   <version>0.0.1</version>
   <name>User Agent Parser</name>
   <dependencies>
        <dependency>
                <groupId>junit</groupId>
                <artifactId>junit</artifactId>
                <version>4.8.2</version>
                <scope>test</scope>
        </dependency>
   </dependencies>
   <!-- 指定编译器版本和字符编码 -->
   <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.encoding>UTF-8</maven.compiler.encoding>
        <java.version>13</java.version>
        <maven.compiler.source>13</maven.compiler.source>
        <maven.compiler.target>13</maven.compiler.target>
   </properties>
   </project>
   ```
