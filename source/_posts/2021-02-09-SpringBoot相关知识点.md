---
title: SpringBoot项目相关知识点
tags:
  - Java
  - SpringBoot
date: 2021-02-09 14:22:09
---

## Spring与SpringBoot

Spring框架，它的主要功能包括IoC容器、AOP支持、事务支持、MVC开发以及强大的第三方集成功能等。

那么，Spring Boot又是什么？**它和Spring是什么关系**？

[Spring Boot](https://spring.io/projects/spring-boot)是一个基于Spring的套件，它帮我们预组装了Spring的一系列组件，以便以尽可能少的代码和配置来开发基于Spring的Java应用程序。

<!-- more -->

* [Spring与SpringBoot](#spring与springboot)
* [springboot配置](#springboot配置)
  * [配置文件格式](#配置文件格式)
  * [自动配置和自动扫描](#自动配置和自动扫描)
  * [springboot自动重新加载](#springboot自动重新加载)
    * [解决idea中自动重启不生效](#解决idea中自动重启不生效)
  * [打包springboot应用](#打包springboot应用)
    * [打jar包和运行jar包](#打jar包和运行jar包)
    * [打包时排除开发者工具](#打包时排除开发者工具)
    * [指定打包文件名称](#指定打包文件名称)
  * [**瘦身打包**应用减小jar包体积](#瘦身打包应用减小jar包体积)
    * [打包后体积过大问题原因](#打包后体积过大问题原因)
    * [**瘦身打包配置**](#瘦身打包配置)
    * [瘦身打包插件原理](#瘦身打包插件原理)
      * [瘦身打包——预热](#瘦身打包预热)
  * [使用环境变量](#使用环境变量)
  * [使用profiles进行不同环境的配置](#使用profiles进行不同环境的配置)
    * [使用profiles进行条件装配](#使用profiles进行条件装配)
  * [使用conditional进行条件装配](#使用conditional进行条件装配)
  * [加载配置到bean中](#加载配置到bean中)

本文Spring Boot版本是3.x版，如果使用Spring Boot 2.x则需注意，两者有以下不同：

|  | Spring Boot 2.x | Spring Boot 3.x |
| --- | --- | --- |
| Spring版本 | Spring 5.x | Spring 6.x |
| JDK版本 | \>= 1.8 | \>= 17 |
| Tomcat版本 | 9.x | 10.x |
| Annotation包 | javax.annotation | jakarta.annotation |
| Servlet包 | javax.servlet | jakarta.servlet |
| JMS包 | javax.jms | jakarta.jms |
| JavaMail包 | javax.mail | jakarta.mail |

## springboot配置

### 配置文件格式

`application.properties`作为默认配置文件。也可以使用YAML格式，将前者删除，再新建`application.yml`文件即可，SpringBoot 会自动识别和读取该配置文件。

### 自动配置和自动扫描

Spring Boot是一个基于Spring提供了开箱即用的一组套件，它可以让我们基于很少的配置和代码快速搭建出一个完整的应用程序。

Spring Boot有非常强大的`AutoConfiguration`功能，它是通过**自动扫描+条件装配**实现的。

启动Spring Boot应用程序只需要一行代码加上一个注解`@SpringBootApplication`，这样一个注解就相当于启动了**自动配置和自动扫描**。

### springboot自动重新加载

只需添加如下依赖到`pom.xml`：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
</dependency>

```

直接启动应用程序，然后试着修改源码，保存，观察日志输出，Spring Boot会自动重新加载。

默认配置下，针对`/static`、`/public`和`/templates`目录中的文件修改，不会自动重启，因为禁用缓存后，这些文件的修改可以实时更新。

经常要修改代码，然后重启Spring Boot应用。经常手动停止再启动，比较麻烦。

Spring Boot 提供的 `devtools` 可以监控 classpath 路径上的文件。只要源码或配置文件发生修改，Spring Boot 应用可以自动重启。在开发阶段，这个功能比较有用。

#### 解决idea中自动重启不生效

修改了类文件后，idea不会自动编译，得修改idea设置。需要两步操作：

 1. 打开 Idea 的`偏好设置——构建、执行、部署——编译器`，勾选`自动构建项目`
 2. 打开 Idea 的`运行——编辑配置——（构建并运行）修改选项——Spring Boot——执行“更新”操作时`，选择`更新类和资源`

以上在IntelliJ IDEA 2022.3.2中测试ok。

### 打包springboot应用

Spring Boot提供了一个Maven插件用于打包所有依赖到单一jar文件，此插件十分易用，无需配置。

#### 打jar包和运行jar包

在Spring Boot应用中，打包更加简单，因为Spring Boot自带一个更简单的`spring-boot-maven-plugin`插件用来打包，我们只需要在`pom.xml`中加入以下配置：

```xml
<project ...>
    ...
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>

```

无需任何配置，Spring Boot的这款插件会自动定位应用程序的入口Class，执行以下Maven命令即可打包：

```shell
mvn clean package
```

使用`java -jar`命令即可运行。

#### 打包时排除开发者工具

使用早期的Spring Boot版本时，需要配置一下才能排除`spring-boot-devtools`这个依赖：

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <excludeDevtools>true</excludeDevtools>
    </configuration>
</plugin>

```

#### 指定打包文件名称

如果不喜欢默认的项目名+版本号作为文件名，可以加一个配置指定文件名：

```xml
<project ...>
    ...
    <build>
        <finalName>awesome-app</finalName>
        ...
    </build>
</project>

```

这样打包后的文件名就是`awesome-app.jar`。

### **瘦身打包**应用减小jar包体积

#### 打包后体积过大问题原因

使用Spring Boot提供的`spring-boot-maven-plugin`打包Spring Boot应用，可以直接获得一个完整的可运行的jar包，把它上传到服务器上再运行就极其方便。

但是这种方式也不是没有缺点。最大的缺点就是包太大了，动不动几十MB，在网速不给力的情况下，上传服务器非常耗时。并且，其中我们引用到的Tomcat、Spring和其他第三方组件，只要版本号不变，这些jar就相当于每次都重复打进去，再重复上传了一遍。

真正经常改动的代码其实是我们自己编写的代码。如果只打包我们自己编写的代码，通常jar包也就几百KB。但是，运行的时候，classpath中没有依赖的jar包，肯定会报错。

所以问题来了：如何只打包我们自己编写的代码，同时又自动把依赖包下载到某处，并自动引入到classpath中。解决方案就是使用`spring-boot-thin-launcher`。

#### **瘦身打包配置**

给原来的`spring-boot-maven-plugin`增加一个`<dependency>`：

```xml
<project ...>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.0.2</version>
    </parent>

    ...
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
        </dependency>
        ...
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludeDevtools>true</excludeDevtools>
                </configuration>
                <dependencies>
                    <dependency>
                        <groupId>org.springframework.boot.experimental</groupId>
                        <artifactId>spring-boot-thin-layout</artifactId>
                        <!--瘦身插件:版本应该是和org.springframework.boot版本有关系,版本不匹配会运行报错-->
                        <version>1.0.28.RELEASE</version>
                        <!--java -Dthin.root=. -jar target/springboot-hello-1.0-SNAPSHOT.jar-->
                        <!--java -Dthin.dryrun=true -Dthin.root=. -jar
           target/springboot-hello-1.0-SNAPSHOT.jar-->
                    </dependency>
                </dependencies>
            </plugin>
        </plugins>
    </build>
</project>
```

**注意版本问题**：

* SpringBoot版本：`3.0.2`
* spring-boot-thin-layout版本：`1.0.28.RELEASE`

打包命令：

```shell
mvn clean package 
ll target # 查看打包输出
```

#### 瘦身打包插件原理

利用`spring-boot-thin-launcher`可以给Spring Boot应用瘦身。其原理是**记录app依赖的jar包，在首次运行时先下载依赖项并缓存到本地**。

实际上`spring-boot-thin-launcher`这个插件改变了`spring-boot-maven-plugin`的默认行为。它输出的jar包只包含我们自己代码编译后的class，一个很小的`ThinJarWrapper`，以及解析`pom.xml`后得到的所有依赖jar的列表。

运行的时候，入口实际上是`ThinJarWrapper`，它会先在指定目录搜索看看依赖的jar包是否都存在，如果不存在，先从Maven中央仓库下载到本地，然后，再执行我们自己编写的`main()`入口方法。这种方式有点类似很多在线安装程序：用户下载后得到的是一个很小的exe安装程序，执行安装程序时，会首先在线下载所需的若干巨大的文件，再进行真正的安装。

这个`spring-boot-thin-launcher`在启动时搜索的默认目录是用户主目录的`.m2`，我们也可以指定下载目录，例如，将下载目录指定为当前目录：

运行命令：

```shell
java -Dthin.root=. -jar awesome-app.jar
```

上述命令通过环境变量`thin.root`传入当前目录，执行后发现当前目录下自动生成了一个`repository`目录，这和Maven的默认下载目录`~/.m2/repository`的结构是完全一样的，只是它仅包含`awesome-app.jar`所需的运行期依赖项。

注意：只有首次运行时会自动下载依赖项，再次运行时由于无需下载，所以启动速度会大大加快。如果删除了repository目录，再次运行时就会再次触发下载。

##### 瘦身打包——预热

把79KB大小的`awesome-app.jar`直接扔到服务器执行，上传过程就非常快。但是，第一次在服务器上运行`awesome-app.jar`时，仍需要从Maven中央仓库下载大量的jar包，所以，`spring-boot-thin-launcher`还提供了一个`dryrun`选项，专门用来下载依赖项而不执行实际代码：

```shell
java -Dthin.dryrun=true -Dthin.root=. -jar awesome-app.jar
```

***如果执行报错，可能是版本的原因，换个版本试试***。

执行上述代码会在当前目录创建`repository`目录，并下载所有依赖项，但并不会运行我们编写的`main()`方法。此过程称之为“预热”（warm up）。

如果服务器由于安全限制不允许从外网下载文件，那么可以在本地预热，然后把`awesome-app.jar`和`repository`目录上传到服务器。只要依赖项没有变化，后续改动只需要上传`awesome-app.jar`即可。

### 使用环境变量

在配置文件中，我们经常使用如下的格式对某个key进行配置：

```xml
server:
  port: ${APP_PORT:18081}
spring:
  application:
    name: ${APP_NAME:unnamed}
```

这种`${APP_PORT:18081}`意思是，首先从环境变量查找`APP_PORT`，如果环境变量定义了，那么使用环境变量的值，否则，使用默认值`18081`。

这使得我们在开发和部署时更加方便，因为开发时无需设定任何环境变量，直接使用默认值即本地数据库，而实际线上运行的时候，只需要传入环境变量即可：

```shell
APP_PORT=801 java -Dthin.dryrun=false -Dthin.root=. -jar target/springboot-hello-1.0-SNAPSHOT.jar
```

### 使用profiles进行不同环境的配置

* 通过Profile可以实现一套代码在不同环境启用不同的配置和功能。
* Spring Boot允许在一个配置文件中针对不同Profile进行配置；
* Spring Boot在未指定Profile时默认为default。

Profile本身是Spring提供的功能，Profile表示一个环境的概念，如开发、测试和生产这3个环境：

* native
* test
* production

或者按git分支定义master、dev这些环境：

* master
* dev

在启动一个Spring应用程序的时候，可以传入一个或多个环境，例如：

```shell
-Dspring.profiles.active=test,master
```

Spring Boot对Profiles的支持在于，可以在application.yml中为每个环境进行配置。下面是一个示例配置：

```yml
server:
  port: ${APP_PORT:18081}

spring:
  application:
    name: ${APP_NAME:unnamed}
  datasource:
    url: jdbc:hsqldb:file:testdb
    username: sa
    password:
    driver-class-name: org.hsqldb.jdbc.JDBCDriver
    # HikariCP配置:
    hikari:
      auto-commit: false
      connection-timeout: 3000
      validation-timeout: 3000
      max-lifetime: 60000
      maximum-pool-size: 20
      minimum-idle: 1

pebble:
  suffix:
  cache: false

#  Spring Boot对Profiles的支持在于，可以在application.yml中为每个环境进行配置。下面是一个示例配置：
---
spring:
  config:
    activate:
      on-profile: test,debug
management:
  endpoints:
    web:
      exposure:
        include: info, health, beans, env, metrics
server:
  port: ${APP_PORT:8000}
  # 使用环境变量: APP_PORT=801 java -Dthin.dryrun=false -Dthin.root=. -Dspring.profiles.active=test -jar target/springboot-hello-1.0-SNAPSHOT.jar

---
spring:
  config:
    activate:
      on-profile: production
server:
  port: 80

pebble:
  cache: true
#  注意到分隔符---，最前面的配置是默认配置，不需要指定Profile，后面的每段配置都必须以spring.config.activate.on-profile.profiles: xxx开头，表示一个Profile。
#  上述配置默认使用的前面配置的端口，但是在test环境下，使用8000端口，在production环境下，使用80端口，并且启用Pebble的缓存。
#  如果不指定任何Profile，直接启动应用程序，那么Profile实际上就是default，可以从Spring Boot启动日志看
#  可以使用条件装配 @Profile("default") @Profile("test") @Profile("production")实现不同环境下使用不同的bean

```

指定了`-Dspring.profiles.active=test`，那么Profile实际上就是`test`，，可以从Spring Boot启动日志看出：

```shell
  APP_PORT=801 java -Dthin.dryrun=false -Dthin.root=. -Dspring.profiles.active=test -jar target/springboot-hello-1.0-SNAPSHOT.jar

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.0.2)

...

2023-02-06T22:44:23.010+08:00  INFO 2452 --- [           main] com.itranswarp.learnjava.Application     : The following 1 profile is active: "test"
...
2023-02-06T22:44:24.419+08:00  INFO 2452 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 801 (http)
...
2023-02-06T22:44:25.837+08:00  INFO 2452 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 801 (http) with context path ''
...
```

#### 使用profiles进行条件装配

在接口实现类的 Bean 上使用`@Profile("default")`注解，即默认启用该 Bean；在另一个实现类上使用`@Profile("!default")`注解，即非`default`环境时，启用该 Bean。

这样，一套代码，就实现了不同环境启用不同的配置。根据`Component`的不同`@Profile`注解，决定装配哪个`Component`的过程就是**条件装配**。

### 使用conditional进行条件装配

### 加载配置到bean中
