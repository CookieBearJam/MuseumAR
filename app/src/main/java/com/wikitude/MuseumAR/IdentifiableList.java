package com.wikitude.MuseumAR;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.content.Intent;
import android.content.res.AssetManager;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.text.Layout;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.AdapterView;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;

public class IdentifiableList extends AppCompatActivity{
    private static final String TAG = "IdentifiableList";
    private ArrayList<String> titleList = new ArrayList<String>();
    private ArrayList<Bitmap> picList = new ArrayList<Bitmap>();
    //手指按下的点为(x1, y1)手指离开屏幕的点为(x2, y2)
    float x1 = 0;
    float x2 = 0;
    float y1 = 0;
    float y2 = 0;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.identifiable_list);

        ListView listView = (ListView) findViewById(R.id.listView);
        MyBaseAdapter myBaseAdapter = new MyBaseAdapter();
        this.getData();
        listView.setAdapter(myBaseAdapter);
        listView.setItemsCanFocus(true);
    }

    public void getData(){
        try {
            AssetManager assetManager = getAssets(); //获得assets资源管理器（assets中的文件无法直接访问，可以使用AssetManager访问）
            InputStreamReader inputStreamReader = new InputStreamReader(assetManager.open("items.json"),"UTF-8"); //使用IO流读取json文件内容
            BufferedReader br = new BufferedReader(inputStreamReader);//使用字符高效流
            String line;
            StringBuilder builder = new StringBuilder();
            while ((line = br.readLine())!=null){
                builder.append(line);
            }
            br.close();
            inputStreamReader.close();

            JSONObject testJson = new JSONObject(builder.toString()); // 从builder中读取了json中的数据。
            // 直接传入JSONObject来构造一个实例
            JSONArray array = testJson.getJSONArray("items");

            for (int i = 0;i<array.length();i++){
                JSONObject jsonObject = array.getJSONObject(i);
                titleList.add(jsonObject.getString("name"));
                Bitmap bitmap = null;
                try {
                    InputStream inputStream = assetManager.open("assets/items/"+jsonObject.getString("pic_path"));//filename是assets目录下的图片名
                    bitmap = BitmapFactory.decodeStream(inputStream);
                    picList.add(bitmap);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        } catch (IOException | JSONException e) {
            e.printStackTrace();
        }
    }

    class MyBaseAdapter extends BaseAdapter{

        @Override
        public int getCount() { return titleList.size(); }

        @Override
        public Object getItem(int position) {
            return titleList.get(position);
        }

        @Override
        public long getItemId(int position) {
            return position;
        }

        @Override
        public View getView(final int position, View convertView, ViewGroup parent) {
            @SuppressLint("ViewHolder")
            //设计页面的listView内容
            View view = View.inflate(IdentifiableList.this, R.layout.identifiable_item, null);
            TextView title = (TextView) view.findViewById(R.id.item_title);
            ImageView pic = (ImageView) view.findViewById(R.id.item_pic);
            title.setText(titleList.get(position));//设置文本
            pic.setImageBitmap(picList.get(position));//设置图片
            view.setClickable(true);
            view.setOnClickListener(new View.OnClickListener() {
                @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
                @Override
                public void onClick(View v) {//为列表项设置跳转到detail页面
                    int pos = position+1;//position从0开始
                    final WebView webView;
                    setContentView(R.layout.details);
                    webView  = (WebView) findViewById(R.id.webview_compontent);
                    WebSettings webSettings = webView.getSettings();
                    webSettings.setLoadWithOverviewMode(true);
                    webSettings.setJavaScriptEnabled(true);
                    webSettings.setUseWideViewPort(true);
                    webSettings.setDefaultTextEncodingName("GBK");
                    webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK); //关闭webview中缓存
                    webSettings.setAllowFileAccess(true); //设置可以访问文件
                    webSettings.setJavaScriptCanOpenWindowsAutomatically(true); //支持通过JS打开新窗口
                    webSettings.setLoadsImagesAutomatically(true); //支持自动加载图片
                    webSettings.setDefaultTextEncodingName("utf-8");//设置编码格式
                    webSettings.setDomStorageEnabled(true);
                    webSettings.setAllowFileAccessFromFileURLs(true);
                    webSettings.setDomStorageEnabled(true);
                    webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
                    webView.loadUrl("file:///android_asset/html/detail.html?id="+pos);
                    webView.addJavascriptInterface(new Object(){//设置返回按键操作，以区别与index页面跳转时的返回操作
                        @JavascriptInterface
                        public void backToApp() {
                            finish();
                        }
                        @JavascriptInterface
                        public void goToAr() {
                            Intent intent = new Intent(IdentifiableList.this,MainActivity.class);
                            startActivity(intent);
                        }
                    }, "Android");
                }
            });
            return view;
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {//设置下拉回到Home页面
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
            if(y2 - y1 > 100) {
                Intent intent = new Intent(IdentifiableList.this, Home.class);
                startActivity(intent);
                overridePendingTransition(R.anim.in_from_down, R.anim.out_to_down);
            }
        }
        return super.onTouchEvent(event);
    }

    @Override
    public boolean onKeyDown(int KeyCode, KeyEvent event) {
        if (KeyCode == KeyEvent.KEYCODE_BACK && event.getRepeatCount() == 0) {
            return true;
        }
        return super.onKeyDown(KeyCode, event);
    }
}
