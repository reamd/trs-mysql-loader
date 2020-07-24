# trs数据入库脚本
## 一、准备工作
1. 安装nodejs运行环境
2. 执行`npm i`安装脚本依赖包

## 二、程序配置及启动（严格按顺序执行配置）
1. 根据 `./config/createtable.sql`建立数据库表
2. 修改数据库信息 `./config/sql.js`，涉及如下信息：
```js
host
user
password
database
port
```

3. 修改程序启动配置 `TRS_FILE_PATH`
4. 开始执行`npm run app`