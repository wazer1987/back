'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema({
    // select就是在我们查询数据库的时候不返还给前端的设置
    __v: { type: String, select: false },
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
    nickname: { type: String, required: true },
    // 关注的人字段
    following: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    likeArticle: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    },
    disArticle: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    },
    // 关注的人，
    // 点赞文章
    // 点赞的答案

  }, { timestamps: true });

  return mongoose.model('User', UserSchema);
};
