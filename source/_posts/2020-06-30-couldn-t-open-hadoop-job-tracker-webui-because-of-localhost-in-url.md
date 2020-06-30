---
title: 8088端口能打开但是打不开hadoop job history Tracking UI和日志Logs等页面
date: 2020-06-30 15:54:19
tags: [Hadoop]
---

<!-- more -->

**问题描述：**

通过`http://ip:8088/`能够访问`All Applications`页面，但是在执行一个application完之后，通过网页中的`Tracking UI` -> `History`链接跳转到`http://localhost:8088/proxy/application_..._0001/jobhistory/job/job_..._0001`,`http://localhost:19888/jobhistory`页面。但是因为Hadoop服务器是部署在公网的，而8088端口的管理界面中的jobhistory链接和Logs链接、Node链接中的主机名（hostname）都是 localhost 而不是服务器的公网ip地址。

而且查看Mapreduce执行时终端的日志信息有这么一句：  
`INFO mapreduce.Job: The url to track the job: http://localhost:8088/proxy/application_..._0001/`  
这说明了jobtracker服务的url地址是服务器本地主机，并不是公网ip，所以job tracker url没能正确被生成。

**解决方法：**

在NameNode节点的服务器上执行`netstat -nltp | grep LISTEN`命令之后发现几个重要端口如8088、8042等服务监听都正常，试着手动将浏览器url地址中的localhost改成服务器的公网ip地址，发现是能够打开Logs和Job History等页面的。所以推测是在生成jobtracker url的时候将hostname设置成了localhost。

解决步骤： 在修改了`$HADOOP_HOME/etc/hadoop/mapred-site.xml` 和 `$HADOOP_HOME/etc/hadoop/yarn-site.xml` 两个配置文件中的几处address hostname为服务器的公网ip或者域名之后就正常了。*注意：不能填0.0.0.0！*

- $HADOOP_HOME/etc/hadoop/mapred-site.xml

```xml
<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
    <property>
     <name>mapreduce.jobhistory.address</name>
     <value>23.105.206.170:10020</value>
    </property>
    <property>
     <name>mapreduce.jobhistory.webapp.address</name>
     <value>23.105.206.170:19888</value>
    </property>
    <property>
     <name>mapreduce.jobhistory.done-dir</name>
     <value>/history/done</value>
    </property>
    <property>
     <name>mapreduce.jobhistory.intermediate-done-dir</name>
     <value>/history/done_intermediate</value>
    </property>
    <property>
     <name>mapreduce.jobtracker.address</name>
     <value>23.105.206.170</value>
    </property>

</configuration>
```

- $HADOOP_HOME/etc/hadoop/yarn-site.xml

```xml
<configuration>

    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>

    <!--开启日志聚合-->
    <property>
        <name>yarn.log-aggregation-enable</name>
        <value>true</value>
        <source>yarn-default.xml</source>
    </property>
<!-- Site specific YARN configuration properties -->
    <property>
        <name>yarn.nodemanager.bind-host</name>
        <value>23.105.206.170</value>
    </property>
    <property>
        <name>yarn.nodemanager.hostname</name>
        <value>23.105.206.170</value>
    </property>

    <property>
        <name>yarn.resourcemanager.webapp.address</name>
        <value>23.105.206.170:8088</value>
    </property>
</configuration>
```

修改完这两个配置文件之后重启HDFS和YARN服务，再次用`hadoop jar`执行一个application：  
`INFO mapreduce.Job: The url to track the job: http://23.105.206.170.16clouds.com:8088/proxy/application_1593439350379_0001/`  
终端输出的日志信息中的jobtracker url从localhost变成了服务器的ip地址或者域名，此时应该就正常了。再次浏览器打开8088 applications页面，发现网页中的所有超链接都正常指向了公网ip或域名。

---

默认配置项及配置项说明文件：  

- <https://hadoop.apache.org/docs/r2.4.1/hadoop-mapreduce-client/hadoop-mapreduce-client-core/mapred-default.xml>
- <https://hadoop.apache.org/docs/r2.9.2/hadoop-yarn/hadoop-yarn-common/yarn-default.xml>
