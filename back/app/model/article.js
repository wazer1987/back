'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ArticleSchema = new Schema({
    // select就是在我们查询数据库的时候不返还给前端的设置
    __v: { type: String, select: false },
    title: { type: String, required: true },
    article: { type: String, required: true },
    article_html: { type: String, required: true },
    views: { type: Number, required: false },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 文章的赞数
    like: { type: Number, required: false, defualt: 0 },
    // 文章的踩数
    dilike: { type: Number, required: false, defualt: 0 },
    // 上面两者是互斥的
  }, { timestamps: true });

  return mongoose.model('Article', ArticleSchema);
};
