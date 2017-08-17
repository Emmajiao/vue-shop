var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



router.post('/login',function (req,res,next) {
  let param={
    userName:req.body.userName,
    userPwd:req.body.userPwd
  };
  User.findOne(param,function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:'用户名或密码错误'
      })
    }else{
      res.cookie('userId',doc.userId,{
        path:'/',
        maxAge:1000*60*60
      });
      res.cookie('userName',doc.userName,{
        path:'/',
        maxAge:1000*60*60
      });

      if(doc){
        res.json({
          status:'0',
          msg:'',
          result:{
            userName:doc.userName
          }
        })
      }
    }
  })
});

router.get('/checkLogin',function (req,res,next){
  if(req.cookies.userId){
    res.json({
      status:'0',
      msg:'',
      result:req.cookies.userName
    })
  }else{
    res.json({
      status:'1',
      meg:'未登录',
      result:""
    })
  }
});
router.post('/logout',function (req,res,next) {
  res.cookie('userId','',{
    path:'/',
    maxAge:-1
  });
  res.json({
    status:'0',
    msg:'',
    result:'退出成功',
  })
});
router.get('/cartList',function (req,res,next) {
  let userId = req.cookies.userId;
  User.findOne({userId:userId},function (err,doc) {
    if(err){
      res.json({
        status:'1',
        meg:err.message,
        result:''
      })
    }else{
      if(doc){
        res.json({
          status:'0',
          meg:'',
          result:doc.cartList
        })
      }
    }
  })
});

router.post('/cartEdit',function (req,res,next) {
  let userId = req.cookies.userId;
    productId = req.body.productId;
    productNum = req.body.productNum;
    checked = req.body.checked;

    User.update({'userId':userId,"cartList.productId":productId},{
      "cartList.$.productNum":productNum,
      "cartList.$.checked":checked,
    },function (err,doc) {
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        })
      }else{
        res.json({
          status:'0',
          msg:'',
          result:'商品更新成功'
        })
      }
    })
});

router.post('/cartDel',function (req,res,next) {
  let userId= req.cookies.userId,productId = req.body.productId;
  User.update({
    userId:userId
  },{
    $pull:{
      'cartList':{
        "productId":productId
      }
    }
  },function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'商品删除成功'
      })
    }
  })
});
router.post('/ediCheckAll',function (req,res,next) {
  let userId =req.cookies.userId,
    checkAll = req.body.checkAll ? '1':'0';
  User.findOne({'userId':userId},function (err,user) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      user.cartList.forEach((item)=>{
        item.checked=checkAll;
      });
      user.save(function (err1,doc){
        if(err1){
          res.json({
            status:'1',
            msg:err.message,
            result:''
          })
        }else {
          res.json({
            status:'0',
            msg:'',
            result:'操作成功'
          })
        }
      })
    }
  })
});
router.get('*',function(req,res,next){
  res.send('台湾是中国不可分割的一部分！');
});
module.exports = router;
