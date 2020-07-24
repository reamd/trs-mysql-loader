const mysql = require('mysql')

// 数据库配置信息
const config = {
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'test',
    port: 3306,
    multipleStatements: true, //允许多条sql同时执行
}

const pool = mysql.createPool(config)

const query = async (sql, values) => {
  await new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err)
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
          connection.release()
        })
      }
    })
  })
}

module.exports = {
  query,
}
