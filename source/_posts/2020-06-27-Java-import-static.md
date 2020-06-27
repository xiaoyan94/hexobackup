---
title: Java中的静态导入import static（导入类的静态成员）
date: 2020-06-27 15:27:22
tags: [Java]
---

## import static 是什么

`import static`是静态导入的声明。静态导入声明 `import static` 类似于普通导入声明 `import` 。 普通的导入声明从包中导入类，从而允许在没有包限定的情况下使用类，而静态导入声明从类中导入静态成员，从而允许在没有类限定的情况下使用静态成员。

使用`import static`用法，可以导入`class`中的静态成员。

<!-- more -->

举个例子，仅使用`import`关键字时，代码可能是这样的：

```java
import static java.lang.Math;
//使用类名.静态成员调用
double r = Math.cos(Math.PI * theta);
```

使用`import static`语法导入`Math`类的静态变量和静态方法之后，代码就更简洁了：

```java
import static java.lang.Math.*;
//直接调用静态成员
double r = cos(PI * theta);
```

---

再来一个例子，使用`import static`语法的 HelloWorld 长这样：

```java
import static java.lang.System.out;

public class HelloWorld {
    public static void main(String[] args) {
        out.println("Hello! World!");
    }
}
```

可以直接在类中使用`java.lang.System.out`成员。

---

如果想要导入类中的所有静态成员可以使用 `*` 通配符：

```java
import static java.lang.System.*;
import static java.util.Arrays.*;

public class UseImportStatic {
    public static void main(String[] args) {
        int[] array = {2, 5, 3, 1, 7, 6, 8};

        sort(array);

        for(int i : array) {
            out.print(i + " ");
        }
    }
}
```

> 当自己定义了一个静态的`sort`方法与从`Arrays`类导入的`sort`方法冲突之后，编译器会报异常:
>
> ```java
> reference to sort is ambiguous, both method sort(float[]) in onlyfun.caterpillar.Arrays and method sort(float[]) in java.util.Arrays match
> ```

## import static 什么时候用

**最好不用！** 为什么呢？

因为 `import static` 与 `import` 背道而驰，理由如下：

* 违背面向对象的设计原则；
* 容易造成命名冲突，污染命名空间，产生歧义；
* 仅仅是为了偷懒少写一点代码，却让代码难以阅读和维护，时间久了连自己都不知道静态成员是从哪个类引入的了；

如果非用不可呢，尽量遵守以下原则：

* **谨慎使用**！当需要频繁访问一两个类的静态成员时，可以使用它。
* 从类中导入所有静态成员可能对可读性特别有害； 如果只需要一个或两个成员，则分别导入它们。
* 通过适当地使用，静态导入可以消除重复的类名样板，从而使程序更具可读性。

---

参考： <https://docs.oracle.com/javase/7/docs/technotes/guides/language/static-import.html>
