'use strict';
module.exports = ({ app }) => {
  return async function verify(ctx, next) {
    // 把前端发送过来的token替换出来
    const token = ctx.request.header.authorization.replace('Bearer ', '');
    try {
      // 去解密token
      const ret = app.jwt.verify(token, app.config.jwt.secret);
      // 解密出来的token里会有账户的邮箱和ID 然后把他挂在到全局
      // 当然这里库里的密码什么的也被查询出去了所以我们需要在model文件里user.js去设置一下不返还密码之类的字段
      ctx.state.email = ret.email;
      ctx.state.userid = ret.id;
      await next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        ctx.body = { code: -666, message: 'token过期了请登录' };
        return ctx.body;
      }
      console.log(err);
    }

  };
}
;
