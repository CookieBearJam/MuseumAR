package com.wikitude.MuseumAR;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;

import android.support.v7.app.AppCompatActivity;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

public class Home extends AppCompatActivity {
    private static final String TAG = "Home";
    //手指按下的点为(x1, y1)手指离开屏幕的点为(x2, y2)
    float x1 = 0;
    float x2 = 0;
    float y1 = 0;
    float y2 = 0;
    private GuideView guideView1;
    private GuideView guideView2;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.home);

        FrameLayout main_button = findViewById(R.id.main_button);//通过按钮进入MainActivity
        main_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent();
                intent.setClass(Home.this, MainActivity.class);
                startActivity(intent);
            }
        });
    }

    private void setGuideView() {
        // 使用图片引导
        final ImageView iv = new ImageView(this);
        iv.setImageResource(R.drawable.img_new_task_guide2);
        RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        iv.setLayoutParams(params);

        // 使用文字引导
        TextView tv = new TextView(this);
        tv.setText("上滑拉出文物列表");
        tv.setTextColor(getResources().getColor(R.color.white));
        tv.setTextSize(20
        );
        tv.setGravity(Gravity.CENTER);

        ImageView camera = findViewById(R.id.camera);
        guideView1 = GuideView.Builder
                .newInstance(this)
                .setTargetView(camera)//设置目标
                .setCustomGuideView(iv)
                .setDirction(GuideView.Direction.LEFT_BOTTOM)
                .setShape(GuideView.MyShape.CIRCULAR)   // 设置圆形显示区域，
                .setBgColor(getResources().getColor(R.color.shadow))
                .setOnclickListener(new GuideView.OnClickCallback() {
                    @Override
                    public void onClickedGuideView() {
                        guideView1.hide();
                        guideView2.show();
                    }
                })
                .build();


        ImageView slide_up = findViewById(R.id.slide_up);
        guideView2 = GuideView.Builder
                .newInstance(this)
                .setTargetView(slide_up)
                .setCustomGuideView(tv)
                .setDirction(GuideView.Direction.TOP)
                .setShape(GuideView.MyShape.CIRCULAR)   // 设置椭圆形显示区域，
                .setBgColor(getResources().getColor(R.color.shadow))
                .setOnclickListener(new GuideView.OnClickCallback() {
                    @Override
                    public void onClickedGuideView() {
                        guideView2.hide();
                    }
                })
                .build();

        guideView1.show();
    }

    @Override
    protected void onResume() {
        super.onResume();
        //setGuideView();
        //使用SHarePreferences记录用户是否第一次进入程序
        SharedPreferences sharedPreferences = this.getSharedPreferences("share", MODE_PRIVATE);
        boolean isFirstRun = sharedPreferences.getBoolean("isFirstRun", true);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        if(isFirstRun) {
            Log.v("debug", "第一次运行");
            setGuideView();
            editor.putBoolean("isFirstRun", false);
            editor.apply();
        }else{
            Log.v("debug", "不是第一次运行");
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {///设置上划到可识别列表页面
        //继承了Activity的onTouchEvent方法，直接监听点击事件
        if (event.getAction() == MotionEvent.ACTION_DOWN) {
            //当手指按下的时候
            x1 = event.getX();
            y1 = event.getY();
        }
        if (event.getAction() == MotionEvent.ACTION_MOVE) {
            //当手指滑动的时候
            x2 = event.getX();
            y2 = event.getY();

        }
        if (event.getAction()==MotionEvent.ACTION_UP){
            //当手指离开的时候
            if(y1 - y2 > 100) {
                Intent intent = new Intent(Home.this, IdentifiableList.class);
                startActivity(intent);
                overridePendingTransition(R.anim.in_from_up, R.anim.out_to_up);
            }
        }
        return super.onTouchEvent(event);
    }
}