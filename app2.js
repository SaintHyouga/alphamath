const express = require('express');
const session = require('express-session');

const app = express();
const path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended : true }));

var mysql = require('./dbconfig');
app.use(express.static('./public'));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'myLittleSeiya',
  resave: true,
  saveUninitialized: true
}));


app.get('/about', (req, res) => {
  res.render('about', { title: 'About Page'});
});

app.get('/', (req, res) => {
  res.redirect("/mbanking");
});

app.get('/login', (req, res) => {
    if(req.session.userWarning){
      userWarning = req.session.userWarning;
    }else{
      userWarning = "";
    }
    res.render('login',{userWarning:userWarning});
});

app.get('/signup', (req, res) => {
    res.render('signup');
});


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.all('/check_login', (req, res) => {
    var username = (req.body.username).trim();
    var password = (req.body.password).trim();
    //req.session.username = username;

    /*
    if(username=="Wittaya" && password=="Seiya211"){
      req.session.username = username;
      res.redirect('/mbanking');
    }else{
      req.session.userWarning = "username หรือ password ไม่ถูกต้อง";
      res.redirect('/login');
    }
    */
    var sql = "select itemContent from mathdb where itemStatus=2";
    mysql.query(sql,(err,result)=>{
      if(err) throw err;
      console.log(result);

      if(result.length== 0){
        res.render('qStudent',{ title: 'Quiz for Student',txtOutput:0,sayHi:"Hi, Nodemon is coming!"});
      }else{
        res.render('qStudent',{ title: 'Quiz for Student',txtOutput:result[0].itemContent,sayHi:"Hi, Nodemon is coming!"});
      }
      //res.render('qStudent',{ title: 'Quiz for Student',txtOutput:result[0].itemContent,sayHi:"Hi, Nodemon is coming!"});
    });






    //res.render('check_login',{username:req.session.username,password:password});
});

app.all('/jap', (req, res) => {
    //req.session.username = {};
    if(req.body.username){
      req.session.username = req.body.username;
    }

    //username = req.session.username;
    res.render('jap',{username:req.session.username});
});

app.all('/mbanking', (req, res) => {
  var txtInput  = "";
  var txtOutput = "";
  var txtInput2  ="";
  var codeSave = 0;
  var itemTag = "";
  var curItem = "0";
  var nRow = 0;

  if(req.body.txtInput){
    txtInput = req.body.txtInput;
    txtInput = txtInput.trim();
    txtOutput = txtInput;
    codeSave = req.body.codeSave;
    itemTag = req.body.itemTag;
    curItem = req.body.curItem;
    var mydata = [[txtInput,itemTag]];

    if(codeSave=="1"){
        var sql = "select * from mathdb where itemId = ?";
        mysql.query(sql,[curItem],function(err,result){
            if(err) throw err;
            nRow = result.length;
            if(nRow>0){
                //update
                var sql = "update mathdb set itemContent = ?,itemTag= ? where itemId = ?";
                mysql.query(sql,[txtInput,itemTag,curItem],(err,result)=>{
                  if(err) throw err;
                  res.render('mbanking', { title: 'M-Banking',txtInput:txtInput,txtOutput:txtOutput,codeSave:codeSave,itemTag:itemTag,username:req.session.username,curItem:curItem});
                });
            }else{
              //insert
              var sql = "insert into mathdb (itemContent,itemTag) values ?";
              mysql.query(sql,[mydata],function(err,result){
                if(err) throw err;
                res.render('mbanking', { title: 'M-Banking',txtInput:txtInput,txtOutput:txtOutput,codeSave:codeSave,itemTag:itemTag,username:req.session.username,curItem:result.insertId});
              });
            }
          });
  }else{
      res.render('mbanking', { title: 'M-Banking',txtInput:txtInput,txtOutput:txtOutput,codeSave:codeSave,itemTag:itemTag,username:req.session.username,curItem:curItem});
  }
}else{
  if(req.body.itemToEdit){
    itemToEdit = req.body.itemToEdit;

    var sql = "select itemId,itemContent,itemTag from mathdb where itemId= ?";
    mysql.query(sql,[itemToEdit],(err,result)=>{
      if(err) throw err;
      res.render('mbanking', { title: 'M-Banking',txtInput:result[0].itemContent,txtOutput:result[0].itemContent,codeSave:codeSave,itemTag:result[0].itemTag,username:req.session.username,curItem:result[0].itemId});
    });
  }else{

    if(req.body.toUndo){
      curItem = req.body.curItem;
      if(curItem !="0"){
        var sql = "select itemId,itemContent,itemTag from mathdb where itemId= ?";
        mysql.query(sql,[curItem],(err,result)=>{
          if(err) throw err;
          res.render('mbanking', { title: 'M-Banking',txtInput:result[0].itemContent,txtOutput:result[0].itemContent,codeSave:codeSave,itemTag:result[0].itemTag,username:req.session.username,curItem:result[0].itemId});
        });
      }
    }else{
      res.render('mbanking', { title: 'M-Banking',txtInput:txtInput,txtOutput:txtOutput,codeSave:codeSave,itemTag:itemTag,username:req.session.username,curItem:"0"});
    }
  }
}
});


app.all('/itemEdit', (req, res) => {
  var txtInput  = "";
  var txtOutput = "xxx";
  var txtInput2  ="";
  var codeUpdate = 0;
  var result = 99;
  var myItem = 0;
  var optSearch = 0;
  var cutItem = 0;

  var itemToEdit = 1;

  optSearch = req.body.optSearch;
  curItem = req.body.curItem;

  if(req.body.updateCode){

    var itemId = req.body.itemId;
    var txtUpdate = req.body.txtUpdate;
    var itemTag = req.body.itemTag;

    var sql = "update mathdb set itemContent = ?,itemTag= ? where itemId = ?";
    mysql.query(sql,[txtUpdate,itemTag,itemId],(err,result)=>{
      if(err) throw err;
      console.log(result);
      //res.render('itemEdit', { title:'แก้ไขคำถาม',result:result,myItem:itemToEdit,codeUpdate:codeUpdate});
    });

    var sql = "select itemId,itemContent,itemTag from mathdb where itemId= ?";
    mysql.query(sql,[itemId],(err,result)=>{
      if(err) throw err;
      console.log(result);
        res.render('itemEdit', { title:'แก้ไขคำถาม:',result:result,myItem:itemId,toPreview:"0",curItem:curItem,optSearch:optSearch});
    });
  }

  if(req.body.itemToEdit){

    itemToEdit = req.body.itemToEdit;


    var sql = "select itemId,itemContent,itemTag from mathdb where itemId= ?";
    mysql.query(sql,[itemToEdit],(err,result)=>{
      if(err) throw err;
      console.log(result);
        res.render('itemEdit', { title:'แก้ไขคำถาม:',result:result,myItem:itemToEdit,toPreview:"0",curItem:curItem,optSearch:optSearch});
    });
  }

  if(req.body.toPreview){
    itemId = req.body.itemId;
    txtInput = req.body.txtInput;
    var itemTag = req.body.itemTag;
    res.render('itemEdit', { title:'แก้ไขคำถาม:',itemId:itemId,txtInput:txtInput,itemTag:itemTag,toPreview:1,curItem:curItem,optSearch:optSearch});
  }
});


app.all('/qStudent', (req, res) => {
  //var txtOutput = "no";
  var sql = "select itemContent from mathdb where itemStatus=2";
  mysql.query(sql,(err,result)=>{
    if(err) throw err;
    console.log(result);

    if(result.length== 0){
      res.render('qStudent',{ title: 'Quiz for Student',txtOutput:0,sayHi:"Hi, Nodemon is coming!"});
    }else{
      res.render('qStudent',{ title: 'Quiz for Student',txtOutput:result[0].itemContent,sayHi:"Hi, Nodemon is coming!"});
    }
    //res.render('qStudent',{ title: 'Quiz for Student',txtOutput:result[0].itemContent,sayHi:"Hi, Nodemon is coming!"});
  });
});

app.all('/qTeacher', (req, res) => {
  //var txtOutput = "no";
  var txtInput = "";
  var curItem = 1;
  var optSearch = 1;
  var curPresent = 0;

  if(req.body.curItem){
    curItem = req.body.curItem;
    curItem = curItem.trim();
    optSearch = req.body.optSearch;
  }

  if(req.body.cancelPresent){
    var sql = "update mathdb set itemStatus = 0";
    mysql.query(sql);
  }

  if(req.body.itemToDel){
    var myItem = req.body.itemToDel;
    var sql = "delete from mathdb where itemId = ?";
    mysql.query(sql,[myItem],(err,result)=>{
      if(err) throw err;
      console.log(result);
    });
  }

  if(req.body.itemPresent){
    var itemPresent = req.body.itemPresent;
    var sql = "update mathdb set itemStatus = 0";
    mysql.query(sql);

    var sql = "update mathdb set itemStatus = 2 where itemId = ?";
    mysql.query(sql,[itemPresent],(err,result)=>{
      if(err) throw err;
      console.log(result);
      //res.render('itemEdit', { title:'แก้ไขคำถาม',result:result,myItem:itemToEdit,codeUpdate:codeUpdate});
    });
  }

//หา curPresent
   var sql = "select itemId from mathdb where itemStatus= 2";
   mysql.query(sql,(err,result)=>{
     if(err) throw err;
     if(result.length>0){
        curPresent = result[0].itemId;
     }
   });

 if(optSearch==1){
   var sql = "select itemId,itemContent,itemTag from mathdb where itemId= ?";
   mysql.query(sql,[curItem],(err,result)=>{
     if(err) throw err;
     console.log(result);
     res.render('qTeacher', { title: 'จัดการคำถาม',items:result,curItem:curItem,optSearch:optSearch,curPresent:curPresent});
   });
 }else{
   var sql = "select itemId,itemContent,itemTag from mathdb where itemTag like ?";
   mysql.query(sql,["%"+curItem+"%"],(err,result)=>{
     if(err) throw err;
     console.log(result);
    res.render('qTeacher', { title: 'จัดการคำถาม',items:result,curItem:curItem,optSearch:optSearch,curPresent:curPresent});
   });
 }
});

///////////////////////////////    จัดชุดข้อสอบ   /////////////////////////////////////////////////////
app.all('/gQuestion', (req, res) => {
  //var txtOutput = "no";
  //var txtInput = "";
  var curItem = "expo";
  var results = [];
  var testArray = "5,72,1,52";
  var k  = "";
  k = "("+testArray+")";

  var sql = "select itemId,itemContent from mathdb where itemId in "+k;
    mysql.query(sql,(err,result)=>{
      if(err) throw err;
      res.send(result);
  });



  //res.send(k);
//res.send(results);
  //res.send(results);




  /*
  var curItem = 1;
  var optSearch = 1;
  var curPresent = 0;
  var codeOperation = 2;

  if(req.body.codeOperation){
    codeOperation = req.body.codeOperation;
    var testArray = req.body.testArray;
    var groupName = req.body.groupName;
  }

  if(codeOperation !=2){
    //res.end("test");
    res.render('gQuestion', { title: 'จัดชุดข้อสอบ',codeOperation:codeOperation,testArray:testArray,groupName:groupName,items:"",curItem:curItem,optSearch:optSearch});
  }else{
    if(req.body.curItem){
      curItem = req.body.curItem;
      curItem = curItem.trim();
      optSearch = req.body.optSearch;
    }

   if(optSearch==1){
     var sql = "select itemId,itemContent,itemTag from mathdb where itemId= ?";
     mysql.query(sql,[curItem],(err,result)=>{
       if(err) throw err;
       console.log(result);
       res.render('gQuestion', { title: 'จัดชุดข้อสอบ',codeOperation:codeOperation,testArray:testArray,groupName:groupName,items:result,curItem:curItem,optSearch:optSearch});
     });
   }else if(optSearch==2){
     var sql = "select itemId,itemContent,itemTag from mathdb where itemTag like ?";
     mysql.query(sql,["%"+curItem+"%"],(err,result)=>{
       if(err) throw err;
       console.log(result);
      res.render('gQuestion', { title: 'จัดชุดข้อสอบ',codeOperation:codeOperation,testArray:testArray,groupName:groupName,items:result,curItem:curItem,optSearch:optSearch});
      //res.render('gQuestion', { title: 'จัดชุดข้อสอบ',items:result,curItem:curItem,optSearch:optSearch});
     });
   }

  }

  */
});


///////////////////////////////////// สิ้นสุดจัดชุดข้อสอบ /////////////////////////////

app.listen();
