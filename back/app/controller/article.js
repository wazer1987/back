'use strict';
const marked = require('marked');
const BaseController = require('./base');
class ArticleContoller extends BaseController {
  async detail() {
    const { ctx } = this;
    const { id } = ctx.params;
    // 这个意思就是去数据库里查询 为了能看到这个文章访问了多少字 所以 findOneAndUpdate 让我们的views字段 增长一次 然后联合author表去查询
    const info = await ctx.model.Article.findOneAndUpdate({ _id: id }, { $inc: { views: 1 } }).populate('author');
    console.log(info, '----根据ID查的文章');
    this.success(info);
  }
  async index() {
    const { ctx } = this;
    const ret = await ctx.model.Article.find().populate('author');
    console.log(ret, '----后端文章');
    this.success(ret);
  }
  async create() {
    const { ctx } = this;
    const { userid } = ctx.state;
    const { content } = ctx.request.body;

    const title = content.split('\n').find(v => {
      return v.indexOf('#') === 0;
    });

    const obj = {
      title: title.replace('#', ''),
      article: content,
      article_html: marked(content),
      author: userid,
    };
    const ret = await ctx.model.Article.create(obj);
    if (ret._id) {
      this.success({
        id: ret.id,
        title: ret.title,
      });
    } else {
      this.error('新建失败');
    }
  }
}

module.exports = ArticleContoller;
