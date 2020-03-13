'use strict';

const Service = require('egg').Service;
// 这个是自动给你的邮箱发送验证码的模块
const nodemailer = require('nodemailer');
// 这个是生成图片验证码的模块
const svgCaptcha = require('svg-captcha');

const userEmail = '1052101962@qq.com';
// 配置了自动往邮箱里生成验证码的模块
const transporter = nodemailer.createTransport({
  service: 'qq',
  port: 465,
  secureConnetion: true,
  auth: {
    user: userEmail,
    pass: 'xmzoiyzsdkbrbdfg',
  },
});

class ToolsService extends Service {
  async captcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
    });
    return captcha;
  }
  async sendEmail(email, title, html) {
    const mailOptions = {
      from: userEmail,
      to: email,
      subject: title,
      text: '',
      html,
    };
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

}


module.exports = ToolsService
;
