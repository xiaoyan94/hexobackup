---
title: .NET 数据并行性（任务并行库） Data Parallelism (Task Parallel Library)
date: 2022-09-01 23:31:10
tags: [.NET,并行编程]
---

## Data Parallelism (数据并行性)

*Data parallelism* refers to scenarios in which the same operation is performed concurrently (that is, in parallel) on elements in a source collection or array. In data parallel operations, the source collection is partitioned so that multiple threads can operate on different segments concurrently.

The Task Parallel Library (TPL) supports data parallelism through the [System.Threading.Tasks.Parallel](https://docs.microsoft.com/en-us/dotnet/api/system.threading.tasks.parallel) class. This class provides method-based parallel implementations of [for](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements#the-for-statement) and [foreach](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements#the-foreach-statement) loops (`For` and `For Each` in Visual Basic). You write the loop logic for a [Parallel.For](https://docs.microsoft.com/en-us/dotnet/api/system.threading.tasks.parallel.for) or [Parallel.ForEach](https://docs.microsoft.com/en-us/dotnet/api/system.threading.tasks.parallel.foreach) loop much as you would write a sequential loop. You do not have to create threads or queue work items. In basic loops, you do not have to take locks. The TPL handles all the low-level work for you. For in-depth information about the use of [Parallel.For](https://docs.microsoft.com/en-us/dotnet/api/system.threading.tasks.parallel.for) and [Parallel.ForEach](https://docs.microsoft.com/en-us/dotnet/api/system.threading.tasks.parallel.foreach), download the document [Patterns for Parallel Programming: Understanding and Applying Parallel Patterns with the .NET Framework 4](https://www.microsoft.com/download/details.aspx?id=19222). The following code example shows a simple `foreach` loop and its parallel equivalent.

## Parallel.ForEach
