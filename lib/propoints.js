
 
function points(uid,name){
    this.uid = uid;
    this.name=name;
    this.ishide="false";
    this.havedelmenu="true",
    this.point = {
        lng: (function(){return (Math.random() * (120 - 100) + 100)})(), 
        lat: (function(){return (Math.random() * (40 - 25) + 25)})(), 
    };
    this.address = "";
     
    this.win = {
        wintitle: 'title',
        wincontent: "<div class='container-fluid'><div class='row'><input type='text' class='form-control col-sm-12' id='companyname_search' placeholder='公司名称'></div><div class='row'><input  type='checkbox' id='companyname_ischecked'>开始导航</div><div class='row'><button  id='zijia' class='btn bg-danger' onclick=\"zijia('companyname')\">自驾</button><button  id='gongjiao' class='btn bg-danger' onclick=\"gongjiao('companyname')\">公交</button><button  id='buxing' class='btn bg-danger' onclick=\"buxing('companyname')\">步行</button></div></div>"
    };
     
    this.dot = {
        icon: '/public/car.png',
        style: '',
        tip: '',
        width: '',
        height: ''
    };
     
    this.menu = {
        textcolor:"",
        backgroundcolor:"",
        menuitmes:[
            {
                name:"编辑",
                icon:"",               
                action:"hello"      
            },
            {
                name:"删除",
                icon:"",               
                action:"hello"
            }
        ]
    };
}
 
// points.point = {
//     lng: (function(){return (Math.random() * (120 - 100) + 100)})(), 
//     lat: (function(){return (Math.random() * (40 - 25) + 25)})(), 
// };
 
var list = [];
 
for(let i = 0 ; i<100 ; i++){
    list.push(new points(i,"上海慧物"+i));
}
 
exports.data = list;
