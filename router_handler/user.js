//导入数据库操作模块
const db = require('../db/index')
    //导入 bcryptjs
const bcrypt = require('bcryptjs')
    //导入生成 Token 的包
const jwt = require('jsonwebtoken')
    //导入全局的配置文件
const config = require('../config')
    //注册新用户的处理函数
exports.regUser = (req, res) => {
    //接受表单数据
    const userinfo = req.body
        // console.log(userinfo)
        // 判断数据是否合法
        // if (!userinfo.username || !userinfo.password) {
        //     return res.send({ status: 1, message: '用户名或密码不能为空！' })
        // }
        //定义sql 语句 查询用户名是否被占用
    const sqlStr = 'select * from ev_users where username=?'
    db.query(sqlStr, [userinfo.username], (err, results) => {
        // 执行 SQL 语句失败
        if (err) {
            // return res.send({ status: 1, message: err.message })
            return res.cc(err)
        }
        // 用户名被占用
        if (results.length > 0) {
            // return res.send({ status: 1, message: '用户名被占用，请更换其他用户名' })
            return res.cc('用户名被占用，请更换其他用户名')
        }
        // bcrypt.hashSync(明文密码, 随机盐的长度) 方法，对用户的密码进行加密处理：
        // console.log(userinfo);
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)
            // console.log(userinfo);
            //定义插入新用户的插入语句
        const sql = 'insert into ev_users set?'
        db.query(sql, { username: userinfo.username, password: userinfo.password }, (err, results) => {
            // 执行 SQL 语句失败
            // if (err) return res.send({ status: 1, message: err.message })
            if (err) return res.cc(err)
                // SQL 语句执行成功，但影响行数不为 1
            if (results.affectedRows !== 1) {
                // return res.send({ status: 1, message: '注册用户失败，请稍后再试！' })
                return res.cc('注册用户失败，请稍后再试！')
            }
            // 注册成功
            // res.send({ status: 0, message: '注册成功！' })
            res.cc('注册成功！', 0)
        })

    })


}

//登陆的处理函数
exports.login = (req, res) => {
    //接收表单数据
    const userinfo = req.body

    //定义 SQL 语句
    const sql = `select * from ev_users where username=?`
        //执行 SQL 语句，查询用户的数据：
    db.query(sql, userinfo.username, function(err, results) {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)
            // 执行 SQL 语句成功，但是查询到数据条数不等于 1
        if (results.length !== 1) return res.cc('登录失败！')
            // TODO：判断用户输入的登录密码是否和数据库中的密码一致

        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
        if (!compareResult) return res.cc('登陆失败！')
            // TODO：登录成功，生成 Token 字符串
        const user = {...results[0], password: '', user_pic: '' }
            //对用户的信息进行加密，生成Token 字符串
        const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
            //将生成的 Token 字符串响应给客户端：
        res.send({
            status: 0,
            message: '登录成功！',
            // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
            token: 'Bearer ' + tokenStr,
        })
    })


}