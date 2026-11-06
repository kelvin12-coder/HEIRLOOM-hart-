package com.heirloom.game;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView web;
    private String siteHost = "";
    private static final String[] OK_HOSTS = {"audiomack.com", "paystack.co", "paystack.com", "supabase.co", "gstatic.com", "googleapis.com", "youtube.com", "youtube-nocookie.com", "ytimg.com"};

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 28) {
            getWindow().getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }
        try { siteHost = Uri.parse(BuildConfig.SITE_URL).getHost(); } catch (Exception e) { siteHost = ""; }
        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false); // music starts by itself in the app
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setSupportMultipleWindows(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setUserAgentString(s.getUserAgentString() + " HeirloomApp/1");
        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(web, true);
        web.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                String sc = u.getScheme() == null ? "" : u.getScheme();
                String h = u.getHost() == null ? "" : u.getHost();
                if (!sc.equals("https") && !sc.equals("http")) { open(u); return true; }
                if (h.equals(siteHost)) return false;
                for (String ok : OK_HOSTS) { if (h.equals(ok) || h.endsWith("." + ok)) return false; }
                open(u);
                return true;
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
                if (r.isForMainFrame()) {
                    String html = "<body style='margin:0;background:#07090f;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center'>"
                            + "<div><h2>No internet</h2><p>Heirloom is an online game. Check your connection.</p>"
                            + "<button style='font-size:20px;padding:14px 28px;border:0;border-radius:12px;background:#ffb020;font-weight:700' onclick=\"location.href='" + BuildConfig.SITE_URL + "'\">Try again</button></div></body>";
                    v.loadDataWithBaseURL(BuildConfig.SITE_URL, html, "text/html", "utf-8", null);
                }
            }

            @Override
            public boolean onRenderProcessGone(WebView v, RenderProcessGoneDetail d) {
                v.loadUrl(BuildConfig.SITE_URL);
                return true;
            }
        });

        if (b != null) { web.restoreState(b); } else { web.loadUrl(BuildConfig.SITE_URL); }
    }

    private void open(Uri u) {
        try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
    }

    @Override
    public void onWindowFocusChanged(boolean f) {
        super.onWindowFocusChanged(f);
        if (f) {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
    }

    @Override protected void onSaveInstanceState(Bundle o) { super.onSaveInstanceState(o); web.saveState(o); }
    @Override protected void onPause() { super.onPause(); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }
    @Override public void onBackPressed() { moveTaskToBack(true); } // never quit the game by accident
    @Override protected void onDestroy() { if (web != null) { web.destroy(); } super.onDestroy(); }
}
