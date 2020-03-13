'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt({ app });
  router.get('/', controller.home.index);
  router.get('/user/info', controller.user.index);
  // 发送手机验证码
  router.get('/user/sendcode', controller.user.email);
  // 生成图片验证码
  router.get('/user/captcha', controller.user.captcha);
  // 注册
  router.post('/user/register', controller.user.create);
  // 登录
  router.post('/user/login', controller.user.login);
  // test测试数据
  router.get('/user/detail', jwt, controller.user.detail);
  // 新建文章
  router.post('/article/create', jwt, controller.article.create);
  // 获取文章
  router.get('/article', controller.article.index);
  // 获取具体文章
  router.get('/article/:id', controller.article.detail);
  // 看看该片文章是否关注
  router.get('/user/isfollow/:id', jwt, controller.user.isFollow);
  // 关注该片文章
  router.put('/user/follow/:id', jwt, controller.user.follow);
  // 取消关注
  router.delete('/user/follow/:id', jwt, controller.user.unfollow);
  // 获取自己的关注的人
  router.get('/user/:id/following', jwt, controller.user.following);
  // // 获取关注自己的人
  router.get('/user/:id/followers', jwt, controller.user.followers);
  // 文章点赞
  router.put('/user/likeArticle/:id', jwt, controller.user.likeArticle);
  // 文章踩
  router.delete('/user/likeArticle/:id', jwt, controller.user.cancellikeArticle);
};
