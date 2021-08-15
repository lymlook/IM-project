#!/bin/bash
Date=`date +%Y%m%d%H`
database=yfchat
passWD='123qqq...A'
innobackupex --user=root --password=$passWD  /tmp/mysqldump1/ >> /dev/null
tar -czvf /tmp/mysqldump/$database$Date.tar.gz /tmp/mysqldump1/ >> /dev/null
#数据备份后，会定时被专门的备份服务器scp走
#rm -rf /tmp/mysqldump/$database$Date.sql
cd /tmp/mysqldump1/
rm -rf ./* >> /dev/null

