
var express = require("express");
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');



mongoose.connect('mongodb://127.0.0.1:27017/shop');

mongoose.connection.on('connected',function(){
  console.log("Mongodb connected success");
});

mongoose.connection.on('error',function(){
  console.log("Mongodb connected fail");
});

mongoose.connection.on('disconnected',function(){
  console.log("Mongodb connected disconnected");
});

router.get("/list",function(req,res,next){
  let page = parseInt(req.param('page'));
  let pagesize = parseInt(req.param('pagesize'));
  let skip = parseInt((page-1) * pagesize);

  let sort = req.param('sort');
  let priceLevel = req.param('priceLevel');
  let priceGt ='', priceLte ='';

  let param ={};
  if(priceLevel !== 'all'){
    switch (priceLevel){
      case '0':priceGt = 0; priceLte =100;break;
      case '1':priceGt = 100; priceLte =500;break;
      case '2':priceGt = 500; priceLte =1000;break;
      case '3':priceGt =1000; priceLte =5000;break;
    }
    param = {
      salePrice:{
        $gt:priceGt,
        $lte:priceLte,
      }
    }
  }

  // param.json();
  let goodModel = Goods.find(param).limit(pagesize).skip(skip);
  goodModel.sort({'salePrice':sort});
  goodModel.exec({},function(err, docs){
    console.log(docs);
    res.json({
      status:'0',
      result:docs,
    })
  })

});
// 加入购物车
router.post('/addCart',function (req,res,next) {
  if(req.cookies.userId){
    var userId = req.cookies.userId;
  }else{
    res.json({
      status:'1',
      msg:'用户信息不存在'
    })
  }
  // var userId = '100000077';
  var productId = req.body.productId;
  var User  = require('../models/user');
  User.findOne({userId:userId},function (err,userDoc) {
    let goodItem ='';
    userDoc.cartList.forEach(function (item) {
      if(item.productId == productId){
        goodItem = item;
        item.productNum++;
      }
    });
    if(goodItem){
      userDoc.save(function(err3,doc3){
        if(err3){
          res.json({
            status:"1",
            msg:err.message
          })
        }else{
          res.json({
            status: "0",
            result: "商品添加成功！"
          })
        }
      });
    }else{
      Goods.findOne({productId:productId},function (err1,goodsDoc) {
        goodsDoc.productNum = 1;
        goodsDoc.checked = 1;
        userDoc.cartList.push(goodsDoc);
        userDoc.save(function (err2,doc2) {
          if(err2){
            res.json({
              status:"1",
              msg:err.message
            })
          }else{
            res.json({
              status:0,
              msg:'',
              result:"此商品第一次加入购物车!"
            })
          }
        })
      })
    }
  })
});
module.exports = router;
