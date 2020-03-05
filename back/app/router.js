'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/user/info', controller.user.index);
  // 发送手机验证码
  router.get('/user/sendcode', controller.user.email);
  // 生成图片验证码
  router.get('/user/captcha', controller.user.captcha);
  // 注册
  router.post('/user/register', controller.user.create);
};
