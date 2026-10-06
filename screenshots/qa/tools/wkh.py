# Offscreen WebKit harness for FlipStax QA. Page audio is muted (nothing a
# test does may be heard); console errors/warnings, uncaught errors, rejected
# promises and failed/!ok fetches are captured into window.__qa.
import os, sys, time, json, base64
import objc, AppKit, WebKit, Foundation
REPO = '/Users/rickymartin/FlipStax'
OUT = os.path.join(REPO, 'screenshots', 'qa'); os.makedirs(OUT, exist_ok=True)
CAPTURE = r"""
(function(){
  window.__qa = { errors:[], warns:[], rejections:[], fetchFails:[], fetches:0 };
  try{ if (!sessionStorage.getItem('qaSeeded')){ localStorage.setItem('flipstax_sound','off'); localStorage.setItem('flipstax_seen_run_intro','1'); sessionStorage.setItem('qaSeeded','1'); } }catch(e){}
  const ce = console.error.bind(console), cw = console.warn.bind(console);
  console.error = function(){ window.__qa.errors.push(Array.from(arguments).map(String).join(' ').slice(0,300)); ce.apply(null, arguments); };
  console.warn = function(){ window.__qa.warns.push(Array.from(arguments).map(String).join(' ').slice(0,300)); cw.apply(null, arguments); };
  addEventListener('error', e=> window.__qa.errors.push('UNCAUGHT ' + (e.message || (e.target && (e.target.src || e.target.href)) || 'resource error')));
  addEventListener('unhandledrejection', e=> window.__qa.rejections.push(String(e.reason).slice(0,300)));
  const of = window.fetch;
  window.fetch = function(u, o){
    window.__qa.fetches++;
    if (window.__qaOffline) return Promise.reject(new TypeError('Load failed (simulated offline)'));
    return of.apply(this, arguments).then(r=>{ if (!r.ok) window.__qa.fetchFails.push((o && o.method || 'GET') + ' ' + String(u).slice(0,80) + ' -> ' + r.status); return r; },
      err=>{ window.__qa.fetchFails.push((o && o.method || 'GET') + ' ' + String(u).slice(0,80) + ' -> ' + err); throw err; });
  };
})();
"""
app = AppKit.NSApplication.sharedApplication(); app.setActivationPolicy_(AppKit.NSApplicationActivationPolicyProhibited)
class View:
    def __init__(self, W, H, extra_js='', allow_media=False):
        self.W, self.H = W, H
        cfg = WebKit.WKWebViewConfiguration.alloc().init()
        cfg.setMediaTypesRequiringUserActionForPlayback_(WebKit.WKAudiovisualMediaTypeNone if allow_media else WebKit.WKAudiovisualMediaTypeAll)
        cfg.setWebsiteDataStore_(WebKit.WKWebsiteDataStore.nonPersistentDataStore())
        cfg.userContentController().addUserScript_(WebKit.WKUserScript.alloc().initWithSource_injectionTime_forMainFrameOnly_(CAPTURE + extra_js, WebKit.WKUserScriptInjectionTimeAtDocumentStart, True))
        self.wv = WebKit.WKWebView.alloc().initWithFrame_configuration_(((0,0),(W,H)), cfg)
        try: self.wv._setWindowOcclusionDetectionEnabled_(False)
        except Exception: pass
        self.wv._setPageMuted_(1)   # never audible
        self.win = AppKit.NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(((-20000,-20000),(W,H)), AppKit.NSWindowStyleMaskBorderless, AppKit.NSBackingStoreBuffered, False)
        self.win.setContentView_(self.wv); self.win.orderFrontRegardless()
    def resize(self, W, H):
        self.W, self.H = W, H
        self.win.setContentSize_((W,H)); self.wv.setFrame_(((0,0),(W,H)))
    def load(self, debug=True, http=None, page='flipstax.html'):
        q = '?debug=fast' if debug else ''
        if http:
            self.wv.loadRequest_(Foundation.NSURLRequest.requestWithURL_(Foundation.NSURL.URLWithString_(http + q)))
        else:
            u = Foundation.NSURL.URLWithString_(Foundation.NSURL.fileURLWithPath_(REPO + '/' + page).absoluteString() + q)
            self.wv.loadFileURL_allowingReadAccessToURL_(u, Foundation.NSURL.fileURLWithPath_(REPO))
        spin(0.3); self.until("document.readyState === 'complete'", 20); spin(1.5)
    def js(self, code, timeout=30):
        b = {}
        self.wv.evaluateJavaScript_completionHandler_(code, lambda r, e: b.update(r=r, e=e))
        end = time.time() + timeout
        while 'r' not in b and time.time() < end: spin(0.01)
        if b.get('e'): raise RuntimeError(str(b['e'].userInfo().get('WKJavaScriptExceptionMessage', b['e'])))
        return b.get('r')
    def J(self, code):  # evaluate an expression and JSON-decode it
        r = self.js('JSON.stringify((' + code + '))'); return json.loads(r) if r is not None else None
    def until(self, expr, timeout=30, step=0.05):
        end = time.time() + timeout
        while time.time() < end:
            if self.js('!!(' + expr + ')'): return True
            spin(step)
        raise TimeoutError(expr)
    def snap(self, name, path=None):
        b = {}
        self.wv.takeSnapshotWithConfiguration_completionHandler_(WebKit.WKSnapshotConfiguration.alloc().init(), lambda img, e: b.update(img=img))
        while 'img' not in b: spin(0.005)
        rep = AppKit.NSBitmapImageRep.imageRepWithData_(b['img'].TIFFRepresentation())
        path = path or os.path.join(OUT, name)
        rep.representationUsingType_properties_(AppKit.NSBitmapImageFileTypePNG, None).writeToFile_atomically_(path, True)
        return path
    def qa(self): return self.J('window.__qa')
def spin(sec):
    end = time.time() + sec
    while time.time() < end:
        Foundation.NSRunLoop.currentRunLoop().runMode_beforeDate_(Foundation.NSDefaultRunLoopMode, Foundation.NSDate.dateWithTimeIntervalSinceNow_(0.01))
