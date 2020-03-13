'use strict';
const md5 = require('md5');
const BaseController = require('./base');
class UserController extends BaseController {
  async index() {
    const { ctx } = this;
    ctx.body = '测试数据';
  }
  async detail() {
    const { ctx } = this;
    const user = await this.checkEmail(ctx.state.email);
    // 这里就把去数据库查出来的用户信息传递了前台
    this.success(user);
  }
  // 登录
  async login() {
    const { ctx, app } = this;
    // 接收前台传过来的参数
    const { email, password } = ctx.request.body;
    // 然后去User的表里查询
    const user = await ctx.model.User.findOne({
      email,
      password: md5(password),
    });
    if (user) {
      const { nickname } = user;
      const token = app.jwt.sign({
        nickname,
        email,
        id: user._id,
      }, app.config.jwt.secret, {
        expiresIn: '1h',
      });
      this.success({ token, email });
    } else {
      this.error('用户名或者密码错误');
    }

  }
  // 查询数据库邮箱是否重名
  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email });
    return user;
  }
  async create() {
    const { ctx } = this;
    console.log(ctx.request.body);
    const { email, password, emailcode, captcha, nickname } = ctx.request.body;
    if (emailcode !== ctx.session.emailcode) {
      return this.error('邮箱验证码出错');
    }
    console.log(captcha, ctx.session.captcha);
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('图片验证码错误');
    }
    if (await this.checkEmail(email)) {
      return this.error('邮箱已经存在');
    }
    const ret = await ctx.model.User.create({
      email,
      nickname,
      password: md5(password),
    });
    if (ret._id) {
      this.success('注册成功');
    }
  }
  // 如片验证码
  async captcha() {
    const { ctx } = this;
    // 调用了service的文件夹里tolls的方法 生成了随机的图片验证码
    const captcha = await this.service.tools.captcha();
    // 把后台刚刚生成的随机验证码放在了session里
    ctx.session.captcha = captcha.text;
    // 设置了响应头的类型
    ctx.response.type = 'image/svg+xml';
    // 然后把数据传送了回去
    ctx.body = captcha.data;
  }
  // 给邮箱发送验证码
  async email() {
    // controller 写业务逻辑，通用的逻辑，抽象成service
    const { ctx } = this;
    const email = ctx.query.email;
    const code = Math.random()
      .toString()
      .slice(2, 6);

    console.log('邮件' + email + '验证码是' + code);
    const title = '开课吧验证码';
    const html = `
      <h1>开课吧注册验证码</h1>
      <div>
        <a href="https://kaikeba.com/">${code}</a>
      </div>
    `;
    const hasSend = await this.service.tools.sendEmail(email, title, html);
    if (hasSend) {
      ctx.session.emailcode = code;
      this.message('发送成功');
    } else {
      this.error('发送失败');
    }
  }
  // 是否关注了该文章
  async isFollow() {
    // 前端把写文章的账号的ID传送过来了
    const { ctx } = this;
    // 首先我们根据我们自己的ID 把我们的表里的所有的字段都查询出来
    const me = await ctx.model.User.findById(ctx.state.userid);
    // 然后看看我们的following字段里的数据有没有我们前端传过来的ID
    const isFollow = !!me.following.find(v => v.toString() === ctx.params.id);
    // 然后返回给前端 前端会根据这个字段去判断我有没有关注该文章
    this.success({
      isFollow,
    });
  }
  // 关注
  async follow() {
    const { ctx } = this;
    // 还是先去库里把我们自己的表的字段查询出来
    const me = await this.ctx.model.User.findById(ctx.state.userid);
    // 然后看看我们有没有关注该片文章 返回布尔值
    const isFollow = !!me.following.find(v => v.toString() === ctx.params.id);
    // 如果没有关注 我们就往我们follow的字段里 去把这个作者的ID 添加一下 也就是关注
    if (!isFollow) {
      me.following.push(ctx.params.id);
      // 然后保存
      me.save();
      this.message('关注成功');
    }
  }
  // 取消关注
  async unfollow() {
    const { ctx } = this;
    const me = await this.ctx.model.User.findById(ctx.state.userid);
    // 还是看看能不能找到 如果找到了就删除
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.following.splice(index, 1);
      me.save();
      this.message('取消成功');
    }
  }
  // 获取自己关注的人
  async following() {
    const { ctx } = this;
    // 只要去查看自己的表里follow字段即可
    const users = await ctx.model.User.findById(ctx.params.id).populate('following');
    console.log(users, '-----关注');
    this.success(users.following);
  }
  // 获取关注自己的人
  async followers() {
    const { ctx } = this;
    // 只要去查看自己的表里follow字段即可
    const users = await ctx.model.User.find({ following: ctx.params.id });
    this.success(users);
  }
  // 文章点赞
  async likeArticle() {
    console.log('文章点赞');
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    console.log(me);
    if (!me.likeArticle.find(id => id.toString() === ctx.params.id)) {
      me.likeArticle.push(ctx.params.id);
      me.save();
      await ctx.model.Article.findByIdAndUpdate(ctx.params.id, { $inc: { like: 1 } });
      return this.message('点赞成功');
    }
  }
  // 取消点赞
  async cancellikeArticle() {
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    const index = me.likeArticle.map(id => id.toString().indexOf(ctx.params.id));
    if (index > -1) {
      me.likeArticle.splice(index, 1);
      me.save();
      await ctx.model.Article.findByIdAndUpdate(ctx.params.id, { $inc: { like: -1 } });
      return this.message('取消点赞成功');
    }
    console.log(ctx);
  }
}

module.exports = UserController;
