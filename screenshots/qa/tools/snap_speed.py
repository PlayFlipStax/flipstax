import os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
import WebKit, AppKit
v = View(390, 844); v.load(debug=True)
v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
def timeit(width, kind, n=15):
    t0 = time.time()
    for i in range(n):
        b = {}; cfg = WebKit.WKSnapshotConfiguration.alloc().init()
        if width: cfg.setSnapshotWidth_(width)
        v.wv.takeSnapshotWithConfiguration_completionHandler_(cfg, lambda img, e: b.update(img=img))
        while 'img' not in b: spin(0.002)
        if kind == 'none': continue
        tiff = b['img'].TIFFRepresentation()
        if kind == 'tiff': open('/tmp/x.tiff', 'wb').write(bytes(tiff)); continue
        rep = AppKit.NSBitmapImageRep.imageRepWithData_(tiff)
        t = AppKit.NSBitmapImageFileTypeJPEG if kind == 'jpg' else AppKit.NSBitmapImageFileTypePNG
        props = { AppKit.NSImageCompressionFactor: 0.9 } if kind == 'jpg' else None
        rep.representationUsingType_properties_(t, props).writeToFile_atomically_('/tmp/x.' + kind, False)
    return round(n / (time.time() - t0), 1)
for w in (None, 390):
    for k in ('none', 'tiff', 'jpg', 'png'):
        print('width', w or '2x', k, 'fps', timeit(w, k))
