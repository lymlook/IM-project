#!/bin/bash
#查找/tmp/mysqldump/目录下两天前的文件，并删除
find /tmp/mysqldump/ -mtime +0.5 -name "*" -exec rm -rf {} \;
