---
title: 'MapReduce用户接口Mapper、Reducer——job的核心'
date: 2020-06-27 20:40:01
tags: [Hadoop,MapReduce]
---

## 作业的核心

应用程序通常实现`Mapper`和`Reducer`接口以提供`map`和`reduce`方法。 这些构成了`job`（作业）的核心。

### `Mapper`

`Mapper`将输入的键/值对`key/value`映射为一组中间键/值对`key/value`。映射是将输入记录转换为中间记录的单个任务。 转换后的中间记录不必与输入记录具有相同的类型。 给定的输入对可能映射为零或许多输出对。

Hadoop MapReduce框架为每个InputSplit生成一个map任务。InputSplit是由InputFormat生成的。

总体而言，`Mapper` 的实现类要传递给 `Job` 使用，须调用 `Job.setMapperClass(Class)` 方法设置job的map函数；然后，MP框架为该任务的 `InputSplit` 中的每个键/值对调用`map(WritableComparable,Writable,Context)`方法。 然后，应用程序可以重写`cleanup(Context)`方法来执行任何必需的清理。

`map函数`的输出对的类型不一定要与输入对的类型一样。 给定的输入对可能 map 映射为零或许多个输出对。 通过调用 `context.write(WritableComparable, Writable)` 方法来收集输出对。

`Application应用程序`可以使用`Counter`来报告它的统计信息。

与给定输出键 `key` 相关联的所有中间值 `values` 随后被MR框架分组，然后传递给 `Reducer` 以得到最终输出。用户可以通过 `Job.setGroupingCompatorClass(Class)` 方法指定一个 `Comparator` 来控制分组。

对`Mapper`的输出进行排序，然后按每个`Reducer`进行划分（`partition`）。分区(`partitions`) 的总数与作业（`job`）的`reduce`任务数相同。

用户可以通过实现自定义的 `Partitioner` 类来控制哪些键 `key` (以及记录 `records` )进入哪个`Reducer`进行处理。

用户还可以通过 `Job.setCombinerClass(Class)` 方法指定一个 `Combiner` ，以在本地执行中间输出的聚合（local aggregation）操作，这样可以减少`Mapper`到`Reducer`之间的数据传输量。实际上就是在`map`操作之后，在本地再执行一次 `reduce`操作，可以参考前面写的`PartitionApp`类的代码。

The intermediate, sorted outputs are always stored in a simple (key-len, key, value-len, value) format. Applications can control if, and how, the intermediate outputs are to be compressed and the [`CompressionCodec`](https://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/api/org/apache/hadoop/io/compress/CompressionCodec.html) to be used via the `Configuration`.
> 原文是这样，这句话不是很理解。

#### 多少个 `Map`

`map` 的数量通常由输入的总大小（即输入文件的块总数 `the total number of blocks of the input files`）决定。

`map` 的正确并行度似乎是每个节点大约10-100个 `map` ，尽管已经为 `very cpu-light map`（*CPU非常轻的任务*）任务设置了300个`map`。 因为任务的设置需要一段时间，所以执行`map`的时间最好满足至少一分钟。

因此，如果您期望的输入数据大小为10TB，块大小为128MB，那么最终将获得82,000个映射`map`, （`10 * 1024 * 1024 ÷ 128 = 81920`），除非使用 `Configuration.set(MRJobConfig.NUM_MAPS, int)`(它只给框架提供了一个提示 `hint`)将其设置得更高。

### `Reducer`

[`Reducer`](https://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/api/org/apache/hadoop/mapreduce/Reducer.html) 将同一个 `key` 对应的一组中间值的集合归约为一个更小的`values`的集合。

用户通过 `Job.setNumReduceTasks(int)` 方法设置作业的 `reduce`的数量。

相似地，`Reducer` 的实现类要传递给 `Job` 使用，须调用 `Job.setReducerClass(Class)` 方法设置job的`reduce`函数；然后，MP框架为分组输入（grouped inputs）中的每个键/值对调用`reduce(WritableComparable, Iterable<Writable>, Context)`方法。 然后，应用程序可以重写`cleanup(Context)`方法来执行任何必需的清理。

`Reducer` 主要有三个主要阶段：`shuffle`, `sort` 和 `reduce`。

#### `Shuffle`

`Reducer` 的输入是 `Mapper` 的排序输出。在这个阶段，MP框架通过HTTP获取所有`mapper`输出的相关的分区（relevant partition）。

#### `Sort`

在此阶段，框架按键 `key`对Reducer的输入进行分组(因为不同的`mapper`可能输出相同的键`key`)。`shuffle`和`sort`阶段同时发生；当获取mapper的输出时，它们被合并。

#### `Secondary Sort`

如果 *将中间键分组的等价规则* 与 *归约前的键分组的等价规则* 需要不同，则可以通过 `Job.setSortCompatorClass(Class)` 指定一个 `Comparator`。由于 `Job.setGroupingComparatorClass(Class)`能够用来控制中间键（intermediate keys）的分组方式，这些可以被结合起来以模拟对值`values`的二次排序 `secondary sort`。

#### `Reduce`

在这个阶段对分组输入中的所有`<key, (list of values)> pair`调用 `reduce(WritableComparable, Iterable<Writable>, Context)`方法。

`reduce`任务的输出通常通过 `Context.write(WritableComparable,Writable)`写入HDFS文件系统（[`FileSystem`](https://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/api/org/apache/hadoop/fs/FileSystem.html)）。

和`Map`一样，`Applications`可以使用`Counter`来报告它的统计信息。

`Reducer`的输出是没有经过排序的。

#### 多少个 `Reduce`

正确的 `reduce` 数似乎是 `0.95或1.75乘以(<no.of nodes> * <no.of maximum containers per node>)` 。

对于0.95，所有的`reduce`都可以立即启动，并在`map`完成时开始传输`map`输出。对于1.75，速度更快的节点将完成他们的第一轮`reduce`，并启动第二轮`reduce`，在负载均衡方面做得更好。

增加`reduce`的数量，会增加框架的开销，但是也增加了负载均衡和降低了故障成本。

上面的缩放因子（如0.95,1.95）略小于整数 ( [`whole numbers`](https://www.mathsisfun.com/whole-numbers.html) )，以便在框架中为推测性任务和失败任务保留少部分的`reduce`插槽（*reduce slots*）。

#### Reducer NONE

如果不需要归约是可以将reduce tasks的数量设置为0的。

在这种情况下，map tasks的输出将直接写到FileSystem，输出的路径是通过 `FileOutputFormat.setOutputPath(Job, Path)`方法设置的路径。框架不会在将map的输出写到FileSystem之前对它们进行排序。

### `Partitioner`

`Partitioner`对`key`空间进行划分。

`Partitioner`控制map的中间输出的keys的划分。key或key的子集通常通过hash散列函数得到划分分区（partitions）。partitions的总数与`reduce`任务数相同。因此，这控制了中间`key`(以及记录`record`)被发送到m个reduce任务中哪一个reduce任务进行归约操作。

[`HashPertitioner`](https://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/api/org/apache/hadoop/mapreduce/lib/partition/HashPartitioner.html)是默认的`Partitioner`。

### `Counter`

[`Counter`](https://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/api/org/apache/hadoop/mapreduce/Counter.html)是MapReduce应用程序报告其统计信息的工具。`Mapper`和`Reducer`的实现类可以使用`Counter`报告统计信息。

Hadoop Mapreduce提供了一个library，[`org.apache.hadoop.mapreduce`](https://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/api/org/apache/hadoop/mapreduce/package-summary.html)包含有用的 mappers, reducers, partitioners。
