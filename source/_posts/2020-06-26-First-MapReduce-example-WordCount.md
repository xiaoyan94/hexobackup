---
title: 'Hadoop入门案例（一）: WordCount'
date: 2020-06-26 17:01:36
tags: [Hadoop,MapReduce]
---

## MapReduce作业的输入与输出

MapRecude计算框架是在键值对<key, value>上进行操作的。MapReduce计算框架将作业的输入视为一组<key，value>对，并生成一组<key, value>对作为其输出，可能是不同类型的。<key, value>中：

- key和value的类都要由框架实现序列化，所以都需要实现`org.apache.hadoop.io.Writable`接口；
- 除此之外key的类还需要实现`org.apache.hadoop.io.WritableComparable`接口，因为在map操作之后还需要对key进行排序操作。

MapReduce作业的输入和输出类型：

> (input) <k1, v1> -> **map** -> <k2, v2> -> **combine** -> <k2, v2> -> **reduce** -> <k3, v3> (output)

<!--more-->

---

## MapReduce入门程序——WordCount

WordCount是一个简单的应用程序，可以计算给定输入数据集中每个单词的出现次数。

WordCountApp.java代码：

```java
package org.example;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

import java.io.IOException;

public class WordCountApp {

    /**
     * Map：读取输入文件
     */
    public static class MyMapper extends Mapper<LongWritable, Text, Text,
            LongWritable> {
        LongWritable one = new LongWritable(1);

        @Override
        protected void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
            String line = value.toString(); //每一行的数据
            String[] words = line.split(" "); //按空格 分隔符拆分
            for (String word : words) {
                context.write(new Text(word), one);
            }
        }
    }

    /**
     * Reduce：归并操作
     */
    public static class MyReducer extends Reducer<Text, LongWritable, Text,
            LongWritable> {
        @Override
        protected void reduce(Text key, Iterable<LongWritable> values, Context context) throws IOException, InterruptedException {

            long sum = 0;
            for (LongWritable value :
                    values) {
                //求key总次数
                sum += value.get();
            }
            // 输出此次reduce统计结果
            context.write(key, new LongWritable(sum));
        }
    }

    /**
     * 定义Driver：
     *
     * @param args 第一个参数是输入文件路径，第二个参数是输出文件路径
     */
    public static void main(String[] args) throws IOException, ClassNotFoundException, InterruptedException {

        Configuration configuration = new Configuration();

        // 删除已存在的输出目录
        Path outPath = new Path(args[1]);
        FileSystem fs = FileSystem.get(configuration);
        if (fs.exists(outPath)){
            fs.delete(outPath, true);
            System.out.println("output file exists, but is has been deleted");
        }

        Job job = Job.getInstance(configuration, "wordcount");

        // 设置Job处理的类
        job.setJarByClass(WordCountApp.class);

        // 设置作业处理的输入路径
        FileInputFormat.setInputPaths(job, new Path(args[0]));

        // 设置map相关参数
        job.setMapperClass(MyMapper.class);
        job.setMapOutputKeyClass(Text.class);
        job.setMapOutputValueClass(LongWritable.class);

        // 设置reduce相关参数
        job.setReducerClass(MyReducer.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(LongWritable.class);

        // 设置作业处理的输出路径
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
```

### 代码分析

Mapper的实现类如下：在map方法中，一次处理一行的数据，由`TextInputFormat`指定，它将一行字符串以空格为分隔符拆分成单词，并输出 `单词-次数` 键值对 `<<word>,1>`

```java
    public static class MyMapper extends Mapper<LongWritable, Text, Text,
            LongWritable> {
        LongWritable one = new LongWritable(1);

        @Override
        protected void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
            String line = value.toString(); //每一行的数据
            String[] words = line.split(" "); //按空格 分隔符拆分
            for (String word : words) {
                context.write(new Text(word), one);
            }
        }
    }
```

Reducer的实现类如下：在reduce方法中，只是对values进行求和，这些values是每个key的出现次数（在本示例中单词出现的次数）。

```java
    public static class MyReducer extends Reducer<Text, LongWritable, Text,
            LongWritable> {
        @Override
        protected void reduce(Text key, Iterable<LongWritable> values, Context context) throws IOException, InterruptedException {

            long sum = 0;
            for (LongWritable value :
                    values) {
                //求key总次数
                sum += value.get();
            }
            // 输出此次reduce统计结果
            context.write(key, new LongWritable(sum));
        }
    }
```

最后，在main方法指定作业的各个方面，例如作业中的输入/输出路径(通过命令行传递)、键/值类型、输入/输出格式等。 然后，它调用`job.waitForCompletion`方法来提交作业并监视其进度。

### 提交作业

将写好的程序提交到YARN执行：

1. 因为使用Maven搭建，在项目根目录下执行命令`mvn clean package -DskipTests`打包

   ```bash
   $ mvn clean package -DskipTests
    [INFO] Scanning for projects...
    [INFO]
    [INFO] ----------------------< org.example:hadoop-train >----------------------
    [INFO] Building hadoop-train 1.0
    [INFO] --------------------------------[ jar ]---------------------------------
    [INFO]
    [INFO] --- maven-clean-plugin:3.1.0:clean (default-clean) @ hadoop-train ---
    [INFO] Deleting /Users/yan/IdeaProjects/com.xxx.hadoop/com.xxx.hadoop/target
    [INFO]
    [INFO] --- maven-resources-plugin:3.0.2:resources (default-resources) @ hadoop-train ---
    [INFO] Using 'UTF-8' encoding to copy filtered resources.
    [INFO] skip non existing resourceDirectory /Users/yan/IdeaProjects/com.xxx.hadoop/com.xxx.hadoop/src/main/resources
    [INFO]
    [INFO] --- maven-compiler-plugin:3.8.0:compile (default-compile) @ hadoop-train ---
    [INFO] Changes detected - recompiling the module!
    [INFO] Compiling 5 source files to /Users/yan/IdeaProjects/com.xxx.hadoop/com.xxx.hadoop/target/classes
    [INFO]
    [INFO] --- maven-resources-plugin:3.0.2:testResources (default-testResources) @ hadoop-train ---
    [INFO] Using 'UTF-8' encoding to copy filtered resources.
    [INFO] skip non existing resourceDirectory /Users/yan/IdeaProjects/com.xxx.hadoop/com.xxx.hadoop/src/test/resources
    [INFO]
    [INFO] --- maven-compiler-plugin:3.8.0:testCompile (default-testCompile) @ hadoop-train ---
    [INFO] Changes detected - recompiling the module!
    [INFO] Compiling 1 source file to /Users/yan/IdeaProjects/com.xxx.hadoop/com.xxx.hadoop/target/test-classes
    [INFO]
    [INFO] --- maven-surefire-plugin:2.22.1:test (default-test) @ hadoop-train ---
    [INFO] Tests are skipped.
    [INFO]
    [INFO] --- maven-jar-plugin:3.0.2:jar (default-jar) @ hadoop-train ---
    [INFO] Building jar: /Users/yan/IdeaProjects/com.xxx.hadoop/com.xxx.hadoop/target/hadoop-train-1.0.jar
    [INFO] ------------------------------------------------------------------------
    [INFO] BUILD SUCCESS
    [INFO] ------------------------------------------------------------------------
    [INFO] Total time:  2.800 s
    [INFO] Finished at: 2020-06-24T20:17:52+08:00
    [INFO] ------------------------------------------------------------------------

   ```

2. 使用命令`scp -P26885 target/hadoop-train-1.0.jar root@23.105.206.170:~/hadoop/lib`将打包好的jar文件上传至远程服务器~/hadoop/lib目录下：

   ```bash
   $ scp -P26885 target/hadoop-train-1.0.jar root@23.105.206.170:~/hadoop/lib
   hadoop-train-1.0.jar     100%   17KB   6.7KB/s   00:02
   ```

3. 以如下流程在服务器上执行上传的程序：

   ```bash
   $ hadoop fs -put in.txt /in.txt # 将in.txt上传至HDFS根目录下
   ...
   $ hadoop jar ~/hadoop/lib/hadoop-train-1.0.jar org.example.WordCountApp /in.txt /mymprd/wordcount # 运行WordCount程序
   ...
   $ hadoop fs -cat /mymprd/wordcount/part-r-00000 #查看程序输出结果
   ...
   ```

4. 输入路径也可以是一个文件夹，文件夹内有多个输入文件：

   ```bash
    root@brave-post-2:~/hadoop/script# cat input/in1.txt # 准备输入文件in1、in2
    Hello World Bye World
    root@brave-post-2:~/hadoop/script# cat input/in2.txt
    Hello Hadoop Goodbye Hadoop
    Hello Goodbye
    root@brave-post-2:~/hadoop/script# hadoop fs -put input / # -put也能上传一个文件夹至HDFS
    20/06/26 08:05:08 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
    root@brave-post-2:~/hadoop/script# hadoop fs -ls /input
    20/06/26 08:05:34 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
    Found 2 items
    -rw-r--r--   1 root supergroup         22 2020-06-26 08:05 /input/in1.txt
    -rw-r--r--   1 root supergroup         42 2020-06-26 08:05 /input/in2.txt
    root@brave-post-2:~/hadoop/script# hadoop jar ~/hadoop/lib/hadoop-train-1.0.jar org.example.WordCount2App /input /mymprd/wordcount # 以input文件夹作为输入路径
    20/06/26 08:06:08 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
    output file exists, but is has deleted
    20/06/26 08:06:10 INFO client.RMProxy: Connecting to ResourceManager at /0.0.0.0:8032
    20/06/26 08:06:13 WARN mapreduce.JobResourceUploader: Hadoop command-line option parsing not performed. Implement the Tool interface and execute your application with ToolRunner to remedy this.
    20/06/26 08:06:14 INFO input.FileInputFormat: Total input paths to process : 2
    20/06/26 08:06:14 INFO mapreduce.JobSubmitter: number of splits:2
    20/06/26 08:06:14 INFO mapreduce.JobSubmitter: Submitting tokens for job: job_1593005599056_0021
    20/06/26 08:06:15 INFO impl.YarnClientImpl: Submitted application application_1593005599056_0021
    20/06/26 08:06:15 INFO mapreduce.Job: The url to track the job: http://localhost:8088/proxy/application_1593005599056_0021/
    20/06/26 08:06:15 INFO mapreduce.Job: Running job: job_1593005599056_0021
    20/06/26 08:06:30 INFO mapreduce.Job: Job job_1593005599056_0021 running in uber mode : false
    20/06/26 08:06:30 INFO mapreduce.Job:  map 0% reduce 0%
    20/06/26 08:06:48 INFO mapreduce.Job:  map 50% reduce 0%
    20/06/26 08:06:49 INFO mapreduce.Job:  map 100% reduce 0%
    20/06/26 08:07:00 INFO mapreduce.Job:  map 100% reduce 100%
    20/06/26 08:07:04 INFO mapreduce.Job: Job job_1593005599056_0021 completed successfully
    20/06/26 08:07:05 INFO mapreduce.Job: Counters: 49
        File System Counters
            FILE: Number of bytes read=170
            FILE: Number of bytes written=334434
            FILE: Number of read operations=0
            FILE: Number of large read operations=0
            FILE: Number of write operations=0
            HDFS: Number of bytes read=274
            HDFS: Number of bytes written=41
            HDFS: Number of read operations=9
            HDFS: Number of large read operations=0
            HDFS: Number of write operations=2
        Job Counters
            Launched map tasks=2
            Launched reduce tasks=1
            Data-local map tasks=3
            Total time spent by all maps in occupied slots (ms)=31069
            Total time spent by all reduces in occupied slots (ms)=8852
            Total time spent by all map tasks (ms)=31069
            Total time spent by all reduce tasks (ms)=8852
            Total vcore-seconds taken by all map tasks=31069
            Total vcore-seconds taken by all reduce tasks=8852
            Total megabyte-seconds taken by all map tasks=31814656
            Total megabyte-seconds taken by all reduce tasks=9064448
        Map-Reduce Framework
            Map input records=3
            Map output records=10
            Map output bytes=144
            Map output materialized bytes=176
            Input split bytes=210
            Combine input records=0
            Combine output records=0
            Reduce input groups=5
            Reduce shuffle bytes=176
            Reduce input records=10
            Reduce output records=5
            Spilled Records=20
            Shuffled Maps =2
            Failed Shuffles=0
            Merged Map outputs=2
            GC time elapsed (ms)=634
            CPU time spent (ms)=3900
            Physical memory (bytes) snapshot=472780800
            Virtual memory (bytes) snapshot=7740059648
            Total committed heap usage (bytes)=264744960
        Shuffle Errors
            BAD_ID=0
            CONNECTION=0
            IO_ERROR=0
            WRONG_LENGTH=0
            WRONG_MAP=0
            WRONG_REDUCE=0
        File Input Format Counters
            Bytes Read=64
        File Output Format Counters
            Bytes Written=41
    root@brave-post-2:~/hadoop/script# hadoop fs -cat /mymprd/wordcount/part-r-00000 # 查看程序执行结果
    20/06/26 08:07:27 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
    Bye 1
    Goodbye 2
    Hadoop 2
    Hello 3
    World 2
    root@brave-post-2:~/hadoop/script#
    ```

## 作业的核心

应用程序通常实现`Mapper`和`Reducer`接口以提供`map`和`reduce`方法。 这些构成了`job`（作业）的核心。

### Mapper

`Mapper`将输入的键/值对`key/value`映射为一组中间键/值对`key/value`。映射是将输入记录转换为中间记录的单个任务。 转换后的中间记录不必与输入记录具有相同的类型。 给定的输入对可能映射为零或许多输出对。

Hadoop MapReduce框架为每个InputSplit生成一个map任务。InputSplit是由InputFormat生成的。

总体而言，Mapper
<https://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html>

### Reducer
