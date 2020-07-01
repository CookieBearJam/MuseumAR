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

var previousBucketTranslateValue = {
    x: 0.8,
    y: 1.232,
    z: -0.097
};

var previousWoodTranslateValue = {
    x: 0.8,
    y: 0.711,
    z: -0.07
};

var previousMeatTranslateValue = {
    x: 0.8,
    y: 0.434,
    z: -0.133
};

var oneFingerGestureAllowed = false;//先禁止单指模式识别

var relicsScale = 0.002;//文物静态模型

var bucketScale = 0.012;//木桶模型
var woodScale = 0.009;//木头模型
var meatScale = 0.0006;//生肉模型

var waterScale = 0.11;// 水模型
var coalScale = 0.02;// 木炭模型
var woodpileScale = 0.015;// 柴堆模型
var cookedMeatScale = 0.0006;// 熟肉模型

var occluderScale = 0.0035;//封堵器

var playingAudioTag = 0;//0表示没有音频正在播放，1、2、3、4分别表示增强界面的音频播放情况

//定义方法，启动二指模式识别（存疑）
AR.context.on2FingerGestureStarted = function() {
    oneFingerGestureAllowed = false;
};

//定义方法，js文件入口
var World = {
    loaded: false,
    drawables: [],//里面依次存放静态文物模型、增强模型的静态模型、增强模型动画、封堵器

    //初始化方法，先创建展示的静态模型资源，再创建对象跟踪器
    init: function initFn() {
        World.createAudios();
        World.createModels();
        World.createOccluder();
        World.createTracker();
    },

    /* 封堵器*/
    createOccluder: function createOccluderFn(){
        this.houMuWuDingOccluder = new AR.Occluder("assets/augmented/houMuWuDing.wt3", {
            scale: {
                x: occluderScale,
                y: occluderScale,
                z: occluderScale
            },
            translate: {
                x: -0.28,
                y: 0.959,
                z: -0.245
            },
            rotate: {
                x: 270
            }
        });
        World.drawables.push(this.houMuWuDingOccluder);//7
    },

    // 对象跟踪器
    createTracker: function createTrackerFn() {
        this.targetCollectionResource = new AR.TargetCollectionResource("assets/augmented/houMuWuDing.wto", {
            onError: World.onError
        });
        this.tracker = new AR.ObjectTracker(this.targetCollectionResource, {
            onError: World.onError
        });
        this.objectTrackable = new AR.ObjectTrackable(this.tracker, "*", {
            drawables: {
                cam: World.drawables
            },
            onObjectRecognized: World.objectRecognized,
            onObjectLost: World.objectLost,
            onError: World.onError
        });
    },

    // 创建介绍需要的音频
    createAudios:function createAudiosFn(){
        this.hmwdInfoAdudio = new AR.Sound("assets/audio/hmwd.mp3", {
//            onLoaded : function(){ World.hmwdInfoAdudio.play(-1); }, // 加载后无限循环
            onError: World.onError
        });
        this.hmwdInfoAdudio.load();//加载

        //先加水
        this.bucketAdudio = new AR.Sound("assets/audio/dy-1.mp3", {
            onError: World.onError
        });
        this.bucketAdudio.load();
        this.pourWaterAudio = new AR.Sound("assets/audio/dy-1.mp3", {//倒水的声音
            onError: World.onError
        });
        this.pourWaterAudio.load();

        //然后放柴火烧水
        this.woodAdudio = new AR.Sound("assets/audio/dy-3.mp3", {
           onError: World.onError
        });
        this.woodAdudio.load();
        this.woodFiringAudio = new AR.Sound("assets/audio/dy-3.mp3", {//柴火燃烧的声音
            onError: World.onError
        });
        this.woodFiringAudio.load();

        //加入生肉，浮沉烹煮
        this.meatAdudio = new AR.Sound("assets/audio/dy-4.mp3", {
            onError: World.onError
        });
        this.meatAdudio.load();
        this.boilingAudio = new AR.Sound("assets/audio/dy-1.mp3",{//水沸腾的声音
            onError: World.onError
        });
        this.boilingAudio.load();

        //煮好后提示声音
        this.endAudio = new AR.Sound("assets/audio/dy-1.mp3",{
            onError: World.onError
        });
        this.endAudio.load();
    },

    // 加载3D模型资源
    createModels:function createModelsFn(){

        /*后母戊鼎的静态文物3D模型*/
        this.houMuWuDing = new AR.Model("assets/augmented/houMuWuDing.wt3", {
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
         //播放出现时的缩放动画
        this.relicsAppearAnimation = this.createAppearingAnimation(this.houMuWuDing, relicsScale);

        /*木桶模型*/
        this.bucket = new AR.Model("assets/augmented/bucket.wt3", {
            scale: {
                x: bucketScale,
                y: bucketScale,
                z: bucketScale
            },
            translate: {
                x: 0.8,
                y: 1.232,
                z: -0.097
            },
            rotate: {
                x:270,
                y:0,
                z:0
            },

            //移动
            onDragBegan: function() {
                oneFingerGestureAllowed=true;
                return true;
            },
            onDragChanged: function(x,y,intersectionX, intersectionY) {
                this.translate = {
                    x:previousBucketTranslateValue.x+x,
                    y:previousBucketTranslateValue.y-y
                }
                return true;
            },
            onDragEnded: function() {
                previousBucketTranslateValue.x = this.translate.x;
                previousBucketTranslateValue.y = this.translate.y;
                if((this.translate.x >= -0.845)&&(this.translate.x <= 0.257)
                    &&(this.translate.y >= 1.447)&&(this.translate.y <= 1.763)
                    &&(this.translate.z >= -0.444)&&(this.translate.z <= 0.147)){
                    World.bucket.enabled = false;
                    //加水的动画


                    //播放下一个操作的提示音频
                    World.woodAdudio.play(1);
                    World.playingAudioTag = 2;
                }
                return true;
            },
            enabled: false,
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

        /*木头模型*/
        this.wood = new AR.Model("assets/augmented/woodpile.wt3",{
            scale: {
                x: woodScale,
                y: woodScale,
                z: woodScale
            },
            translate: {
                x: 0.8,
                y: 0.711,
                z: -0.07
            },
            rotate: {
                x:270,
                y:0,
                z:0
            },
            onDragBegan: function() {
                oneFingerGestureAllowed = true;
                return true;
            },
            onDragChanged: function(x,y) {
                this.translate={
                    x:previousWoodTranslateValue.x + x,
                    y:previousWoodTranslateValue.y - y
                }
                return true;
            },
            onDragEnded: function() {
                previousWoodTranslateValue.x = this.translate.x;
                previousWoodTranslateValue.y = this.translate.y;
                if((this.translate.x >= -0.601)&&(this.translate.x <= 0.055)&&(this.translate.y>= -0.024)&&(this.translate.y <= 0.369)&&(this.translate.z >= -0.467)&&(this.translate.z <= 0.067)){
                        World.wood.scale.x = woodpileScale;
                        World.wood.scale.y = woodpileScale;
                        World.wood.scale.z = woodpileScale;
                        World.wood.translate.x = -0.255;
                        World.wood.translate.y = -0.106;
                        World.wood.translate.z = -0.209;
                        World.coal.enabled = true;
                        World.meatAdudio.play(1);
                        World.playingAudioTag = 3;
                }
//                var position = {
//                    x: -0.255,
//                    y: -0.106,
//                    z: -0.209
//                }
                return true;
            },
            enabled: false,
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

        /* 生肉模型 */
        this.meat = new AR.Model("assets/augmented/rawMeat.wt3",{
            scale: {
                x: meatScale,
                y: meatScale,
                z: meatScale
            },
            translate: {
                x: 0.8,
                y: 0.434,
                z: -0.133
            },
            rotate: {
                x: 180,
                y: -180,
                z: 0
            },
            //移动
            onDragBegan: function() {
                oneFingerGestureAllowed = true;
                return true;
            },
            onDragChanged: function(x,y) {
                this.translate={
                    x:previousMeatTranslateValue.x + x,
                    y:previousMeatTranslateValue.y - y
                }
                return true;
            },
            onDragEnded: function() {
                previousMeatTranslateValue.x = this.translate.x;
                previousMeatTranslateValue.y = this.translate.y;
                if((this.translate.x >= -0.9)&&(this.translate.x <= 0.24)&&(this.translate.y >= 1.65)&&(this.translate.y <= 2.0)&&(this.translate.z >= -0.37)&&(this.translate.z <= 0.032)){
                    World.meat.enabled = false;
                    World.cookedMeat.enabled = true;
                    World.endAudio.play(1);
                    World.playingAudioTag = 4;
                }
                return true;
            },
            enabled: false,
            onLoaded: World.showInfoBar,
            onError: World.onError

        });

        //将创建的所有3D模型添加到drawables数组中，方便多资源调用
        World.drawables.push(this.houMuWuDing);//0
        World.drawables.push(this.bucket);//1
        World.drawables.push(this.wood);//2
        World.drawables.push(this.meat);//3

        /* 创建小精灵动画*/
        // Gif中，每秒12帧，单个帧的大小为260*310，每一行为4帧，一共3行，即源图片大小为(260*4 = 1040)*(310*3 = 930)
        this.imgElf = new AR.ImageResource("assets/icons/elf_1040.png", {
            onError: World.onError
        });

        this.elf = new AR.AnimatedImageDrawable(this.imgElf, 0.5, 260, 310, {//height,frame_width,frame_height
            translate: {
               x: 0.738,
               y: 1.9,
               z: 0.042
            },
            rotates: {
                x: 0,
                y: -180,
                z: 0
            },
            onClick: function() {
                World.elfClicked();
            },
        });

        /* 每帧的播放时间为 84ms(5秒60帧)  参数-1无限循环 */
        this.elf.animate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 84, -1);

        /* 木炭模型 */
        this.coal = new AR.Model("assets/augmented/coal.wt3",{
            scale: {
                x: coalScale,
                y: coalScale,
                z: coalScale
            },
            translate: {
                x: -0.203,
                y: 0.175,
                z: -0.29
            },
            rotate: {
                x:270,
                y:0,
                z:0
            },
            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

        /*熟肉模型*/
        this.cookedMeat = new AR.Model("assets/augmented/cookedMeat.wt3",{
            scale: {
                x: cookedMeatScale,
                y: cookedMeatScale,
                z: cookedMeatScale
            },
            translate: {
                x: -0.282,
                y: 1.259,
                z: -0.194
            },
            rotate: {
                x:300,
                y:45,
                z:0
            },
            enabled: false,//最初设置模型为不可用
            onLoaded: World.showInfoBar,
            onError: World.onError
        });

        World.drawables.push(this.elf);//4
        World.drawables.push(this.coal);//5
        World.drawables.push(this.cookedMeat);//6

        /* 水模型*/

    },

    //点击小精灵时需要进行的操作
    elfClicked: function elfClickedFn(){
        var title_text = document.title;//获取当前页面的标签

        //静态界面点击小精灵
        if(title_text == "static"){
            World.playSound(World.hmwdInfoAdudio);
        }else if(title_text == "dynamic"){ //动态界面根据移动情况，决定要播放哪个音频
            if(World.playingAudioTag == 1){
                World.playSound(World.bucketAdudio);
            }else if(World.playingAudioTag == 2){
                World.playSound(World.woodAdudio);
            }else if(World.playingAudioTag == 3){
                World.playSound(World.meatAdudio);
            }else if(World.playingAudioTag == 4){
               World.playSound(World.endAudio);
            }
        }
    },

    //音频的播放规则
    playSound: function playSoundFn(audio){
        if(audio.state == AR.CONST.STATE.PLAYING){//正在播放则直接暂停
            audio.pause();
        }else if(audio.state == AR.CONST.STATE.PAUSED){//如果之前是被暂停的，重新播放，
            audio.resume();//相当于play(1)
        }else if(audio.state == AR.CONST.STATE.LOADED){//如果是播放完结的
            audio.play(1);
        }
    },

    //对象识别成功时，静态界面设置drawables数组中的小精灵和文物静态模型为可见
    //动态界面设置文物静态模型和所有增强模型为不可见，点击按钮时一次出现一次消失
    objectRecognized: function objectRecognizedFn() {
        World.hideInfoBar();//隐藏提示框

        var title_text = document.title;//获取当前页面的标签
        if(title_text == "static"){//如果是静态文物界面则显示
            World.drawables[0].enabled = true;
            World.setAugmentationsEnabled(1, World.drawables.length - 1, false);
            World.drawables[4].enabled = true;//小精灵
            World.appear(World.relicsAppearAnimation);//播放出现动画

            //加载同时循环播放介绍语音
            World.hmwdInfoAdudio.play(-1);
        }else if(title_text == "dynamic"){

            /*设置按钮可见*/
            document.getElementById("water").style.visibility = "visible";
            document.getElementById("wood").style.visibility = "visible";
            document.getElementById("beef").style.visibility = "visible";
            World.setAugmentationsEnabled(0, World.drawables.length, false);
            World.drawables[4].enabled = true;//小精灵
            World.drawables[7].enabled = true;//封堵器


            //播放动态介绍音频\木桶移动音频
            World.bucketAdudio.play(1);
            World.playingAudioTag = 1;
        }
    },

    stophmwd: function stophmwdFn(){
        World.hmwdInfoAdudio.stop();
    },

    //对象丢失时将所有的模型设置为不可见
    //还需要设置页面跳转时使用不同的js，让当前的效果（包括后续的动态效果）都消失
    objectLost: function objectLostFn() {
        World.hmwdInfoAdudio.stop();

        World.bucketAdudio.stop();
        World.woodAdudio.stop();
        World.meatAdudio.stop();
        World.endAudio.stop();

        World.pourWaterAudio.stop();
        World.woodFiringAudio.stop();
        World.woodFiringAudio.stop();


        World.setAugmentationsEnabled(0, World.drawables.length, false);
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
        if(index == 1){//木桶
            if (World.drawables[1].enabled == false) {
                World.drawables[1].enabled = true;
            } else {
                World.drawables[1].enabled = false;
            }
        }else if(index == 2){//木头
            if (World.drawables[2].enabled == false) {
                World.drawables[2].enabled = true;
            } else {
               World.drawables[2].enabled = false;
            }
        }else if(index == 3){//肉
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