---
title: mysqldump备份还原相关
date: 2025-02-25 09:46:26
tags: [SQL, 数据库]
---

* [mysqldump备份还原相关](#mysqldump备份还原相关)
  * [使用mysqldump备份](#使用mysqldump备份)
    * [备份前可查询表大小](#备份前可查询表大小)
    * [备份时可忽略指定表](#备份时可忽略指定表)
    * [备份时只备份表结构](#备份时只备份表结构)
    * [备份时可同时备份存储过程](#备份时可同时备份存储过程)
    * [备份时可以指定where条件](#备份时可以指定where条件)
  * [数据库备份文件还原](#数据库备份文件还原)
    * [还原指定表](#还原指定表)

## mysqldump备份还原相关

### 使用mysqldump备份

#### 备份前可查询表大小

```SQL
select table_name as '表名',
       round((data_length + index_length) / 1024 / 1024, 2) as '表大小(MB)'
from information_schema.tables
where table_schema = 'alpsmes'
order by round((data_length + index_length) / 1024 / 1024, 2) desc
limit 20;
```

#### 备份时可忽略指定表

  使用 `--ignore-table` 选项

```bash
mysqldump -uzy_mes -p12345 alpsmes \
--ignore-table=alpsmes.biz_electr_inspection_data \
--ignore-table=alpsmes.tmp_biz_electr_inspection_data \
--ignore-table=alpsmes.sys_log_his \
--ignore-table=alpsmes.act_ru_meter_log \
--ignore-table=alpsmes.biz_technics_opc_quality \
--ignore-table=alpsmes.sys_log \
--ignore-table=alpsmes.biz_3rd_andon_api_log \
--ignore-table=alpsmes.biz_order_report_record_bak \
> alpsmes20240306.sql
```

#### 备份时只备份表结构

  使用 `--no-data` 选项
  
```bash
mysqldump -uzy_mes -p122345 alpsmes \
biz_electr_inspection_data \
tmp_biz_electr_inspection_data \
sys_log_his \
act_ru_meter_log \
biz_technics_opc_quality \
sys_log \
biz_3rd_andon_api_log \
biz_order_report_record_bak \
--no-data \
> alpsmes_no_data_20240306.sql
```

#### 备份时可同时备份存储过程

```bash
mysqldump -uzy_mes -p12345 --routines --no-data --databases dengqimes > /tmp/dengqimes_structure.sql
```

#### 备份时可以指定where条件

  使用 `--where` 选项

* 备份时只备份数据不备份表结构

  使用 `--no-create-info` 选项

```bash
mysqldump -uzy_mes -p122345 dengqimes biz_technics_opc_quality --where="factoryid=3 and deviceid between 88 and 91" --no-create-info > output_technics_91.sql
```

### 数据库备份文件还原

#### 还原指定表

* mysqldump备份的历史数据库文件(.sql)，不想恢复整个数据库，只想取出其中一张表
  
  原理是使用 `sed` 工具

```bash
sed -n -e '/CREATE TABLE `biz_order_child`/,/UNLOCK TABLES/p' dengqimes20240118000001.sql > orderchild.sql
```

或者

```bash
sed -n -e '/Table structure for.*`biz_order_child/,/Table structure for/p' dengqimes20250207000001.sql > biz_order_child.sql
```

或者

```bash
sed -n -e '/DROP TABLE IF EXISTS `biz_product`/,/UNLOCK TABLES/p' cloudmes20241121000001.sql > biz_product.sql
```

* mysql还原备份的sql时，可能由于字符集编码和转义问题会报错

  ```BASH
  mysql --database=dengqimesprod --user=root --host=127.0.0.1 --port=3306 < C:\Users\zhiyin\Downloads\dengqimes20240311.sql
  ERROR at line 33162: Unknown command '\"'.
  ```

  需要指定字符集和数据库的字符集一样

  ```BASH
  mysql --database=dengqimes --user=root -p --host=127.0.0.1 --port=3306  --default-character-set=utf8mb4 < C:\Users\zhiyin\Downloads\dengqimes20240413.sql
  ```
