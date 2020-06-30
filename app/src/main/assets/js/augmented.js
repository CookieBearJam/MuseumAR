/*展示静态文物模型界面*/

//声明全局变量，存储控制的模型的位置数据
var previousTranslateValue = {
    x:0,
    y:0,
    z:0
};

//声明全局变量，存储控制的模型的角度数据
var previousRotationValue = {
    x:0,
    y:0,
    z:0
};

var relicsScale = 0.002;//文物静态模型的大小

var oneFingerGestureAllowed = false;//先禁止单指模式识别（存疑）

var bucketScale = 0.01;//木桶模型的大小
var woodScale = 0.008;//木头模型的大小
var meetScale = 0.003;//肉的模型大小

var bucketPouringScale = 0.11;//倒水动画的大小
var woodFiringScale = 0.07;//火苗燃烧动画的大小
var meetBurntScale = 0.02;//沸水动画的大小

//定义方法，启动二指模式识别（存疑）
AR.context.on2FingerGestureStarted = function() {
    oneFingerGestureAllowed = false;
};

//定义方法，js文件的入口
var World = {
    loaded: false,
    drawables: [],//里面依次存放静态文物模型、增强模型的静态模型、增强模型动画（若分开）

    //初始化方法，先创建展示的静态模型资源，再创建对象跟踪器
    init: function initFn() {
        World.createModels();
        World.createTracker();
    },

    //创建对象跟踪器
    createTracker: function createTrackerFn() {
        //声明并加载对象识别文件：tracker.wto
        this.targetCollectionResource = new AR.TargetCollectionResource("assets/object/houMuWuDing.wto", {
            onError: World.onError
        });
        //利用wto文件创建跟踪器tracker
        this.tracker = new AR.ObjectTracker(this.targetCollectionResource, {
            onError: World.onError
        });
        //根据识别对象的名字加载识别资源
        this.objectTrackable = new AR.ObjectTrackable(this.tracker, "*", {
            drawables: {
                cam: World.drawables
            },
            onObjectRecognized: World.objectRecognized,//如果识别成功，调用该回调方法
            onObjectLost: World.objectLost,//如果是被对象消失，调用该回调方法
            onError: World.onError//如果出现错误，调用onError方法
        });
    },


    /*创建展示的静态3D模型，所有可能出现的模型都在drawables数组中一次性加载的情况*/
    createModels:function createModelsFn(){

        /*添加后母戊鼎的静态文物3D模型*/
        this.houMuWuDing = new AR.Model("assets/object/houMuWuDing.wt3", {
            scale: {
                x: relicsScale,
                y: relicsScale,
                z: relicsScale
            },
            translate: {
                x: -0.176,
                y: 0.751,
                z: 0.648
            },
            rotate: {
                global:{
                    x:270,
                    y:0,
                    z:0
                }
            },
            //旋转
            onDragBegan:function(){
                oneFingerGestureAllowed=true;
                return true;
            },
            onDragChanged:function(x,y,intersectionX, intersectionY){
                if(oneFingerGestureAllowed){
                    this.rotate={
                        x:previousRotationValue.x + y * 250,
                        z:previousRotationValue.z + x * 100
                    };
                }
                return true;
            },
            onDragEnded:function(){
                previousRotationValue.x = this.rotate.x;
                previousRotationValue.z = this.rotate.z;
                return true;
            },
            //移动
            onPanBegan: function() {
                oneFingerGestureAllowed = false;
                return true;
            },
            onPanChanged: function(x, y) {
            //有问题，把y轴都换成了z轴
            this.translate = {
                x:previousTranslateValue.x + x,
                z:previousTranslateValue.z - y
            }
            return true;
            },
            onPanEnded: function() {
                previousTranslateValue.x = this.translate.x;
                previousTranslateValue.z = this.translate.z;
                return true;
            },
            //放大
            onScaleBegan: function() {
                oneFingerGestureAllowed=false;
                return true;
            },
            onScaleChanged: function(scale) {
                var scaleValue = relicsScale * scale;
                this.scale = {
                    x: scaleValue,
                    y: scaleValue,
                    z: scaleValue
                };
                return true;
            },
            onScaleEnded: function() {
                relicsScale = this.scale.x;
                return true;
            },
            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

         //播放后母戊鼎的出现时的缩放动画
        this.relicsAppearAnimation = this.createAppearingAnimation(this.houMuWuDing, relicsScale);

        /*添加木桶的模型*/
        this.bucket = new AR.Model("assets/augmented/bucket.wt3", {
            scale: {
                x: bucketScale,
                y: bucketScale,
                z: bucketScale
            },
            translate: {
                x: 1.013,
                y: 1.232,
                z: 0.116
            },
            rotate: {
                x:270,
                y:0,
                z:0
            },

            //移动
            onPanBegan: function() {
                oneFingerGestureAllowed=false;
                return true;
            },
            onPanChanged: function(x,y) {
                //有问题，把y轴都换成了z轴
                this.translate = {
                    x:previousTranslateValue.x+x,
                    z:previousTranslateValue.z-y
                }
                return true;
            },
            onPanEnded: function() {
                previousTranslateValue.x = this.translate.x;
                previousTranslateValue.z = this.translate.z;
                //当移动到一个固定的区域时触发动画/其他函数
                if((this.translate.x >=-0.97) && (this.translate.x <= 0) &&(this.translate.y >= 0.033)&&(this.translate.y<=0.696)){
                    World.meet.enabled = false;
                }
                return true;
            },

            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

        /*木头（可拖动）按键对应的模型*/
        this.wood = new AR.Model("assets/augmented/wood.wt3",{
            scale: {
                x: woodScale,
                y: woodScale,
                z: woodScale
            },
            translate: {
                x: 1.021,
                y: 0.86,
                z: 0
            },
            rotate: {
                x:-45,
                y:52,
                z:0
            },
            //移动
            onPanBegan: function() {
                oneFingerGestureAllowed = false;
                return true;
            },
            onPanChanged: function(x,y) {
                //有问题，把y轴都换成了z轴
                this.translate={
                    x:previousTranslateValue.x + x,
                    z:previousTranslateValue.z - y
                }
                return true;
            },
            onPanEnded: function() {
                previousTranslateValue.x = this.translate.x;
                previousTranslateValue.z = this.translate.z;
                return true;
            },
            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

        /* 肉（可拖动）按键对应的模型 */
        this.meet = new AR.Model("assets/augmented/meet.wt3",{
            scale: {
                x: meetScale,
                y: meetScale,
                z: meetScale
            },
            translate: {
                x: 1.052,
                y: 0.135,
                z: 0.06
            },
            rotate: {
                x:180,
                y:-90,
                z:-90
            },
            //移动
            onPanBegan: function() {
                oneFingerGestureAllowed = false;
                return true;
            },
            onPanChanged: function(x,y) {
                //有问题，把y轴都换成了z轴
                this.translate={
                    x:previousTranslateValue.x + x,
                    z:previousTranslateValue.z - y
                }
                return true;
            },
            onPanEnded: function() {
                previousTranslateValue.x = this.translate.x;
                previousTranslateValue.z = this.translate.z;
                return true;
            },
            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError

        });

        //将创建的所有3D模型添加到drawables数组中，方便多资源调用
        World.drawables.push(this.houMuWuDing);//0
        World.drawables.push(this.bucket);//1
        World.drawables.push(this.wood);//2
        World.drawables.push(this.meet);//3

        /*创建小精灵的gif动画*/
        // Gif中，每秒12帧，单个帧的大小为260*310，每一行为4帧，一共3行，即源图片大小为(260*4 = 1040)*(310*3 = 930)
        this.imgElf = new AR.ImageResource("assets/icons/elf_1040.png", {
            onError: World.onError
        });

        this.elf = new AR.AnimatedImageDrawable(this.imgElf, 0.75, 260, 310, {//height,frame_width,frame_height
            translate: {
               x: 0.877,
               y: 2.106,
               z: 0.141
            },
            rotates: {
                x: 0,
                y: 0,
                z: 0
            },
//            onClick: { //点击以后触发的播放音频操作，目前报错说没有这个属性
//
//            }
        });

        /* 每帧的播放时间为 84ms(5秒60帧)  参数-1 表示无限循环 */
        this.elf.animate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 84, -1);
        World.drawables.push(this.elf);//4
    },

    //对象识别成功时，设置drawables数组中所有的模型为可见
    objectRecognized: function objectRecognizedFn() {
        World.hideInfoBar();//隐藏提示框

        var title_text = document.title;//获取当前页面的标签
        if(title_text == "static"){//如果是静态文物界面则显示
            World.drawables[0].enabled = true;
            World.setAugmentationsEnabled(1, 3, false);
            World.appear(World.relicsAppearAnimation);//播放出现动画
        }else if(title_text == "dynamic"){
            /*设置按钮可见*/
            document.getElementById("water").style.visibility = "visible";
            document.getElementById("wood").style.visibility = "visible";
            document.getElementById("beef").style.visibility = "visible";
            World.setAugmentationsEnabled(0, 3, false);
        }
    },

    //对象丢失时将所有的模型设置为不可见
    //还需要设置页面跳转时使用不同的js，让当前的效果都消失
    objectLost: function objectLostFn() {
        World.setAugmentationsEnabled(0, 3, false);
    },

    //设置所有的增强模型为enabled的值
    setAugmentationsEnabled: function setAugmentationsEnabledFn(start, num, enabled) {
        for (var i = start; i <start + num; i++) {
            World.drawables[i].enabled = enabled;
        }
    },

    //创建静态模型的出现动画
    createAppearingAnimation: function createAppearingAnimationFn(model, scale) {
        var sx = new AR.PropertyAnimation(model, "scale.x", 0, scale, 1500, {
            type: AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC
        });
        var sy = new AR.PropertyAnimation(model, "scale.y", 0, scale, 1500, {
            type: AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC
        });
        var sz = new AR.PropertyAnimation(model, "scale.z", 0, scale, 1500, {
            type: AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC
        });
        return new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [sx, sy, sz]);//返回一个动画组
    },

    appear: function appearFn(animation) {
        World.hideInfoBar();
        World.relicsAppearAnimation.start();//播放静态模型的出现动画
    },

    onError: function onErrorFn(error) {
        alert(error);
    },

    hideInfoBar: function hideInfoBarFn() {
        document.getElementById("infoBox").style.display = "none";
    },

    showInfoBar: function WorldLoadedFn() {
        document.getElementById("infoBox").style.display = "table";
        document.getElementById("loadingMessage").style.display = "none";
    },

    showAugmented: function showAugmentedFn(index){
        if(index == 1){//木桶的按钮
            if (World.drawables[1].enabled == false) {
                World.drawables[1].enabled = true;
            } else {
                World.drawables[1].enabled = false;
            }
        }else if(index == 2){//木头的按钮
            if (World.drawables[2].enabled == false) {
                World.drawables[2].enabled = true;
            } else {
               World.drawables[2].enabled = false;
            }
        }else if(index == 3){//肉的按钮
            if (World.drawables[3].enabled == false) {
                World.drawables[3].enabled = true;
            } else {
               World.drawables[3].enabled = false;
            }
        }else{
            World.onError();
        }
    }
};

World.init();