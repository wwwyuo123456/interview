var LoadMaps = window.LoadMaps = LoadMaps||{};
(function(BMap,$,BMapLib){
    //哈希表
    function HashTable() {
        var size = 0;
        var entry = new Object();
        this.add = function (key, value) {
            if (!this.containsKey(key)) {
                size++;
            }
            entry[key] = value;
        }
        this.getValue = function (key) {
            return this.containsKey(key) ? entry[key] : null;
        }
        this.remove = function (key) {
            if (this.containsKey(key) && (delete entry[key])) {
                size--;
            }
        }
        this.containsKey = function (key) {
            return (key in entry);
        }
        this.containsValue = function (value) {
            for (var prop in entry) {
                if (entry[prop] == value) {
                    return true;
                }
            }
            return false;
        }
        this.getValues = function () {
            var values = new Array();
            for (var prop in entry) {
                values.push(entry[prop]);
            }
            return values;
        }
        this.getKeys = function () {
            var keys = new Array();
            for (var prop in entry) {
                keys.push(prop);
            }
            return keys;
        }
        this.getSize = function () {
            return size;
        }
        this.clear = function () {
            size = 0;
            entry = new Object();
        }
    }
 
    var dynamicLoading = {
        css: function (path) {
            if (!path || path.length === 0) {
                throw new Error('argument "path" is required !');
            }
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.href = path;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            head.appendChild(link);
        },
        js: function (path,callback) {
            if (!path || path.length === 0) {
                throw new Error('argument "path" is required !');
            }
            var ss = document.getElementById('mapjscode');
            if (ss == null || ss == undefined) {
                var head = document.getElementsByTagName('head')[0];
                var script = document.createElement('script');
                script.id = "mapjscode";
                script.src = path;
                script.type = 'text/javascript';
                head.appendChild(script);
                script.onload = script.onreadystatechange = function () {
                    if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                        script.onload = script.onreadystatechange = null;
                        if (callback && typeof (callback) == 'function') {
                            callback();//window[callback]();如果传递字符串过来  调用window['函数名']() 调用方法
 
                        }
                    }
                }
            }
            else
            {
                if (callback && typeof (callback) == 'function') {
                    callback();//window[callback]();如果传递字符串过来  调用window['函数名']() 调用方法
 
                }
            }
 
        }
    }
 
    /**
      * 构造函数
      * map:地图实例
      * options:{
      *    city:初始化地图城市
      * }
      */
    var DevMap = LoadMaps.DevMap = function (map, options) {
        if (!map) {
            return;
        }
        this._map = map;
        this._options = options;
        this._markerClusterer = new BMapLib.MarkerClusterer(this._map);
 
        this._markerhash = new HashTable();
        this._addresshash = new HashTable();
        this._pointhash = new HashTable();
        this._infowindowhash = new HashTable();
        this._iconurlhash = new HashTable();
 
        this._lushuhash = new HashTable();
        this._loxxmarker = [];
        this._loxxpoly = [];
        this._dhpoint = [];
 
        this.PointCity(this._options["city"]);//初始化
        this._top_left_control = new BMap.ScaleControl({ anchor: BMAP_ANCHOR_TOP_LEFT });// 左上角，添加比例尺
        this._top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
        this._top_right_navigation = new BMap.NavigationControl({ anchor: BMAP_ANCHOR_TOP_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL }); //右上角，仅包含平移和缩放按钮
        this._overViewOpen = new BMap.OverviewMapControl({ isOpen: true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT });
        this.add_control();
    }
    /**
     * 加载marker数据
     * marker:json数据
     */
    DevMap.prototype._markerinit = function (markers) {
        var that = this;
        console.log(markers);
        var name = markers["name"]||''; // 名字
        var lng = markers["point"].lng||0; // 经度
        var lat = markers["point"].lat||0; // 纬度
        var address = markers.address||''; // 地址
        var wintitle = markers.win.wintitle || '';// 标题
        var wincontent = markers.win.wincontent || ''; // 窗口
        var iconwidth = markers.dot.width || 50;// icon 宽度
        var iconhight = markers.dot.height || 50;// icon 高度
        var iconurl = markers.dot.icon||'';// icon URL
        var markerMenu = new BMap.ContextMenu();
        var menuitmes = markers["menu"]["menuitmes"]; //菜单
        var img = new BMap.Icon(iconurl, new BMap.Size(iconwidth, iconhight));
        var point = new BMap.Point(lng, lat);
        var marker = new BMap.Marker(point);
        var infowindow = new BMap.InfoWindow(wincontent, {
            title: name
        });
        marker.setTitle(marker["tootip"]||marker["name"]);
        marker.setIcon(img);
        marker.addContextMenu(markerMenu);
        markerMenu.addItem(new BMap.MenuItem("删除",
        (function () {
            that.clearmarker(this);
        }).bind(name)));  //菜单删除回调
        markerMenu.addItem(new BMap.MenuItem("路线",
        (function () {
            var points = [];
            for(var i = 0;i<10;i++){
                var lng = (Math.random() * (120 - 100) + 100);
                var lat = (Math.random() * (40 - 25) + 25);
                var point = new BMap.Point(lng, lat);
                points.push(point);
            }
            that.drawline(this,points);
        }).bind(name)));  //菜单删除回调
        markerMenu.addItem(new BMap.MenuItem("删除路线",
        (function () {
            that.clearline(this);
        }).bind(name)));
        marker.addEventListener("mouseover", function () {
            this.setAnimation(BMAP_ANIMATION_BOUNCE);
        });
        marker.addEventListener("mouseout", function () {
            this.setAnimation(null);
        });
        marker.addEventListener("click", function () {
            that._map.openInfoWindow(infowindow, point);
        });
        this._pointhash.add(name, point);
        this._markerhash.add(name, marker);
        this._infowindowhash.add(name, infowindow);
        this._iconurlhash.add(name,iconurl);
        this._addresshash.add(name, address);      
    }
     /**
     * 在地图实例上加载list点
     * list:json数据
     */
    DevMap.prototype.showAllMarker = function (list) {
        var len = list.length;
        var that = this;
        for(var i = 0; i < len; i++){
            (function(i){
                that._markerinit(list[i]);
            })(i);
        }
        this._markerClusterer.addMarkers(this._markerhash.getValues());
        this._map.setViewport(this._pointhash.getValues()); 
    }
    /**
     * 设置指定name  marker为中心点
     */
    DevMap.prototype._potomarker = function (name) {
        this._map.centerAndZoom(this._pointhash.getValue(name),14);
        this._map.openInfoWindow(this._infowindowhash.getValue(name), this._pointhash.getValue(name));
    }
    //添加控件和比例尺
    DevMap.prototype.add_control = function () {
        this._map.addControl(this._top_left_control);
        this._map.addControl(this._top_left_navigation);
        this._map.addControl(this._top_right_navigation);
        this._map.addControl(this._overViewOpen);
    }
    //移除控件和比例尺
    DevMap.prototype.delete_control = function () {
        this._map.removeControl(this._top_left_control);
        this._map.removeControl(this._top_left_navigation);
        this._map.removeControl(this._top_right_navigation);
        this._map.removeControl(this._overViewOpen);
    }
    //初始化中心点
    DevMap.prototype.PointCity = function (city) {
        var lng = 116.404;
        var lat = 39.915;
        var p = new BMap.Point(lng, lat);
        this._map.centerAndZoom(p, 14);
        this._map.enableScrollWheelZoom(true);
        this._map.centerAndZoom(city, 14);
    }
    /**
     * 在地图实例上加载marker点
     * marker:json数据
     */
    DevMap.prototype.showMarker = function (marker) {
        this._markerinit(marker);
        console.log(marker);
        this._markerClusterer.addMarker(this._markerhash.getValue(marker['name']));
        this._potomarker(marker['name']);
    }
 
    /*
    载入地图marker网络数据
    */
    DevMap.prototype.LoadMapData = function (m_MapData) {
 
        if (m_MapData.list != null && m_MapData.list != undefined) {
            if (m_MapData.center != null && m_MapData.center.undefined)
                m_MapData.list.push(m_MapData.center);
 
            if (m_MapData.jsfile != null && m_MapData.jsfile != undefined) {
                var saveMap = this;
                var appData = null;
 
                try {
                    appData = this._options["appdata"];
                }
                catch (e1) {
 
                }
                if (m_MapData.jsfile != "")
                    dynamicLoading.js(m_MapData.jsfile, function () {
                        try{
                            setMapVar(saveMap, appData);
                        }
                        catch(e){
 
                        }
                    });
 
            }
 
            this.showAllMarker(m_MapData.list);
            /*
            try {
                var saveMap=this;
                var appData = null;
                try
                {
                    appData=this._options["appdata"];
                }
                catch(e1)
                {
 
                }
                setTimeout(function () { setMapVar(saveMap, appData); }, 500);
                 
            }
            catch (err) {
                alert('调用设置地图失败:'+err);
            }
            */
 
        }
    }
    /**
     * 在地图实例上删除所有点
     */
    DevMap.prototype.clearAllMarker = function () {
        this._markerClusterer.removeMarkers(this._markerhash.getValues());
        this._markerhash.clear();
        this._pointhash.clear();
        this._infowindowhash.clear();
        this._map.clearOverlays();
    }
    /**
     * 在地图实例上查看指定点
     * name:string
     */
    DevMap.prototype.lookupmarker = function (name) {
        if (this._markerhash.getValues().length == 0) {
            console.log("没有加载呀");
            return;
        }
        var point = this._pointhash.getValue(name);
        if (name && point) {
           this._potomarker(name);
        } else {
            console.log("找不到呀,找不到呀");
        }
    }
    /**
     * 在地图实例上添加marker点
     * obj:{
     *      name:string
     *      iconurl:string  url
     *      adress:string
     *      profile:string
     * }
     */
    DevMap.prototype.addmarker = function (obj) {
        var that = this;
        var myGeo = new BMap.Geocoder();
        myGeo.getPoint(obj.address, function (point) {
            if (point) {
                var name = obj.name;
                var address = obj.address;
                var iconurl = obj.iconurl||"/public/imgs/pon.png";
                var marker = new BMap.Marker(point);
                var img = new BMap.Icon(iconurl,new BMap.Size(50,50));
                marker.setIcon(img);
                var markerMenu = new BMap.ContextMenu();
                marker.addContextMenu(markerMenu);
                markerMenu.addItem(new BMap.MenuItem("删除",
                (function () {
                    that.clearmarker(this);
                }).bind(name)));  //菜单删除回调
                markerMenu.addItem(new BMap.MenuItem("路线",
                (function () {
                    var points = [];
                    for(var i = 0;i<10;i++){
                        var lng = (Math.random() * (120 - 100) + 100);
                        var lat = (Math.random() * (40 - 25) + 25);
                        var point = new BMap.Point(lng, lat);
                        points.push(point);
                    }
                    that.drawline(this,points);
                }).bind(name)));  //菜单删除回调
                markerMenu.addItem(new BMap.MenuItem("删除路线",
                (function () {
                    that.clearline(this);
                }).bind(name)));
                var infowindow = new BMap.InfoWindow(obj.profile,{
                    title:name
                });
                marker.addEventListener("mouseover", function () {
                    this.setAnimation(BMAP_ANIMATION_BOUNCE);
                });
                marker.addEventListener("mouseout", function () {
                    this.setAnimation(null);
                });
                marker.addEventListener("click", function () {
                    that._map.openInfoWindow(infowindow, point);
                }); 
                that._pointhash.add(name, point);
                that._markerhash.add(name, marker);
                that._infowindowhash.add(name, infowindow);
                that._iconurlhash.add(name,iconurl);
                that._addresshash.add(name, address);
                that._markerClusterer.addMarker(marker);
                that._potomarker(name);               
            } else {
                console.log("地址没有解析到结果!");
            }
        });
      
         
    }
    /**
     * 根据name删除指定marker
     * name:string
     */
    DevMap.prototype.clearmarker = function (name) {
        this._markerClusterer.removeMarker(this._markerhash.getValue(name));
        this._map.closeInfoWindow(this._infowindowhash.getValue(name));
        this._markerhash.remove(name);
        this._pointhash.remove(name);
        this._infowindowhash.remove(name);
        this._addresshash.remove(name);
    }
    /**
     * 在地图实例上规划路线
     * form:naem 起点
     * to:name 终点
     * method:string  步行/自驾/公交
     * isclert:boolean 是否清除上次路线;关闭导航
     * isnavigation:boolean 是否开启导航;
     */
    DevMap.prototype.drawRoute = function (obj) {
        var that = this;
        var p1 = this._pointhash.getValue(obj["form"]);
        var p2 = this._pointhash.getValue(obj["to"]);
        var clean = obj["isclert"] || true;
        var method = obj["method"] || "自驾";
        var isnavigation = obj["isnavigation"] || false;
        if (clean) {
            this.clearRoute();
        }
        switch (method) {
            case "步行":
                var buxing = new BMap.WalkingRoute(this._map, {
                    renderOptions: { map: this._map },
                    autoViewport: true,
                    onMarkersSet: function (pois) {
                        for (var i = 0; i < pois.length; i++) {
                            (function (i) {
                                that._loxxmarker.push(pois[i].marker);
                            })(i);
                        }
                    },
                    onPolylinesSet: function (routes) {
                        for (var i = 0; i < routes.length; i++) {
                            (function (i) {
                                that._loxxpoly.push(routes[i].getPolyline());
                            })(i);
                        }
                    }
                });
                buxing.search(p1, p2);
                break;
            case "自驾":
                var zijia = new BMap.DrivingRoute(this._map, {
                    renderOptions: { map: this._map },
                    autoViewport: true,
                    onMarkersSet: function (pois) {
                        for (var i = 0; i < pois.length; i++) {
                            (function (i) {
                                that._loxxmarker.push(pois[i].marker);
                            })(i);
                        }
                    },
                    onPolylinesSet: function (routes) {
                        for (var i = 0; i < routes.length; i++) {
                            (function (i) {
                                that._loxxpoly.push(routes[i].getPolyline());
                            })(i);
                        }
                    }
                });
                zijia.search(p1, p2);
                break;
            case "公交":
                var gongjiao = new BMap.TransitRoute(this._map, {
                    renderOptions: { map: this._map },
                    autoViewport: true,
                    onMarkersSet: function (transfers, pois) {
                        for (var i = 0; i < pois.length; i++) {
                            (function (i) {
                                that._loxxmarker.push(transfers[i].marker);
                                that._loxxmarker.push(pois[i].marker);
                            })(i);
                        }
                    },
                    onPolylinesSet: function (lines, routes) {
                        for (var i = 0; i < routes.length; i++) {
                            (function (i) {
                                that._loxxpoly.push(lines[i].getPolyline());
                                that._loxxpoly.push(routes[i].getPolyline());
                            })(i);
                        }
                    }
                });
                gongjiao.search(p1, p2);
                break;
        }
 
         
         
        if (isnavigation) {
            var navigationid = navigator.geolocation.getCurrentPosition(geo_success, geo_error, {
                // 指示浏览器获取高精度的位置，默认为false
                enableHighAcuracy: true,
                // 指定获取地理位置的超时时间，默认不限时，单位为毫秒
                timeout: 5000,
                // 最长有效期，在重复获取地理位置时，此参数指定多久再次获取位置。
                maximumAge: 3000
            });
            function geo_success(position) {//                console.log(position);//获得的点
                var point = new BMap.Point(position.coords.longitude, position.coords.latitude);
                var convertor = new BMap.Convertor();
                convertor.translate([point], 1, 5, function (data) {//                    console.log(data);//转换的点
                    if (data.status === 0) {
                        var p = data.points[0];                   
                        console.log(p);//百度地图的点
                        var arr = [];
                        console.log(arr);
                        arr.push(p);
                        var poly = new BMap.Polyline(arr, {
                            strokeColor: "black",
                            strokeOpacity: 0.5,
                        });
                        that._map.addOverlay(poly);
                        console.log(navigationid);
 
                        this._dhpoint.add(navigationid,arr);
                    } else {
                        console.log('转换失败');
                    }
                });
            }
            function geo_error(msg) {
                console.log(msg.message + "游览器定位失败,发送百度定位");
                var bdid = setInterval(function () {
                    var geolocation = new BMap.Geolocation();
                    geolocation.getCurrentPosition(function (r) {
                        if (this.getStatus() != BMAP_STATUS_SUCCESS) {
                            return;
                        }
                        var p = r.point;
                        var arr = [];
                        var poly = new BMap.Polyline(arr, {
                            strokeColor: "black",
                            strokeOpacity: 0.5,
                        });
                        if (p != arr[arr.length - 1]) {
                            arr.push(p);
                            that._map.addOverlay(poly);
                            this._dhpoint.add(bdid,arr);
                        }
                    });
                }, 15000);
            }
 
 
        }
         
    }
    /**
     * 清除规划路线
     */
    DevMap.prototype.clearRoute = function () {
        var that = this;
        for (var i = 0; i < this._loxxmarker.length; i++) {
            (function (i) {
                that._map.removeOverlay(that._loxxmarker[i]);
                that._loxxmarker.clear();
            })(i);
        }
        for (var i = 0; i < this._loxxpoly.length; i++) {
            (function (i) {
                that._map.removeOverlay(that._loxxpoly[i]);
                that._loxxpoly.clear();
            })(i);
        }
    }
    /**
     * 实时导航
     * name:name
     * points:路线数组
     * shudu:行驶速度
     */
    DevMap.prototype.drawline = function(name,points,shudu){
        var point = this._pointhash.getValue(name);
        var marker = this._markerhash.getValue(name); 
        var infowindow = this._infowindowhash.getValue(name);
        if(!point){
            return;
        }
        points.unshift(point);
        var newpoint = points[points.length-1];
        this._map.closeInfoWindow(infowindow);
        this._map.setViewport(points); 
        this._pointhash.add(name,newpoint);
        this._markerClusterer.removeMarker(this._markerhash.getValue(name));
        marker.setPosition(newpoint);
        var that = this;
        marker.addEventListener("click", function () {
            that._map.openInfoWindow(infowindow, newpoint);
        });
        // this._map.openInfoWindow(infowindow, newpoint);
        //this._markerClusterer.addMarker(marker);
        var polyline = new BMap.Polyline(points, {strokeColor:"blue", strokeWeight:2, strokeOpacity:0.5});   //创建折线
        function addArrow(polyline,length,angleValue,map){ //绘制箭头的函数  
            var linePoint=polyline.getPath();//线的坐标串  
            var arrowCount=linePoint.length;  
            for(var i =1;i<arrowCount;i++){ //在拐点处绘制箭头  
            var pixelStart=map.pointToPixel(linePoint[i-1]);  
            var pixelEnd=map.pointToPixel(linePoint[i]);  
            var angle=angleValue;//箭头和主线的夹角  
            var r=length; // r/Math.sin(angle)代表箭头长度  
            var delta=0; //主线斜率，垂直时无斜率  
            var param=0; //代码简洁考虑  
            var pixelTemX,pixelTemY;//临时点坐标  
            var pixelX,pixelY,pixelX1,pixelY1;//箭头两个点  
            if(pixelEnd.x-pixelStart.x==0){ //斜率不存在是时  
                pixelTemX=pixelEnd.x;  
                if(pixelEnd.y>pixelStart.y)  
                {  
                pixelTemY=pixelEnd.y-r;  
                }  
                else  
                {  
                pixelTemY=pixelEnd.y+r;  
                }     
                //已知直角三角形两个点坐标及其中一个角，求另外一个点坐标算法  
                pixelX=pixelTemX-r*Math.tan(angle);   
                pixelX1=pixelTemX+r*Math.tan(angle);  
                pixelY=pixelY1=pixelTemY;  
            }  
            else  //斜率存在时  
            {  
                delta=(pixelEnd.y-pixelStart.y)/(pixelEnd.x-pixelStart.x);  
                param=Math.sqrt(delta*delta+1);  
              
                if((pixelEnd.x-pixelStart.x)<0) //第二、三象限  
                {  
                pixelTemX=pixelEnd.x+ r/param;  
                pixelTemY=pixelEnd.y+delta*r/param;  
                }  
                else//第一、四象限  
                {  
                pixelTemX=pixelEnd.x- r/param;  
                pixelTemY=pixelEnd.y-delta*r/param;  
                }  
                //已知直角三角形两个点坐标及其中一个角，求另外一个点坐标算法  
                pixelX=pixelTemX+ Math.tan(angle)*r*delta/param;  
                pixelY=pixelTemY-Math.tan(angle)*r/param;  
              
                pixelX1=pixelTemX- Math.tan(angle)*r*delta/param;  
                pixelY1=pixelTemY+Math.tan(angle)*r/param;  
            }  
              
            var pointArrow=map.pixelToPoint(new BMap.Pixel(pixelX,pixelY));  
            var pointArrow1=map.pixelToPoint(new BMap.Pixel(pixelX1,pixelY1));  
            var Arrow = new BMap.Polyline([  
                pointArrow,  
             linePoint[i],  
                pointArrow1  
            ], {strokeColor:"blue", strokeWeight:3, strokeOpacity:0.5});  
            map.addOverlay(Arrow);  
            }  
        }  
        addArrow(polyline,10,Math.PI/7,this._map);
        this._map.addOverlay(polyline);
        var lushu = new BMapLib.LuShu(this._map,points,{
            defaultContent:infowindow.getTitle()+infowindow.getContent(),//"从天安门到百度大厦"
            autoView:true,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
            icon  : marker.getIcon(),
            speed: shudu||1000000,
            enableRotation:true,//是否设置marker随着道路的走向进行旋转
            landmarkPois: [
                
            ]
        });  
        lushu.start()
        this._lushuhash.add(name,lushu);
    }
    /**
     * 清除覆盖物
     */
    DevMap.prototype.clearline = function(name){
        this._lushuhash.getValue(name).stop();
        this._map.clearOverlays();
        this._markerClusterer.addMarkers(this._markerhash.getValues());
    }
})(BMap, $, BMapLib);
