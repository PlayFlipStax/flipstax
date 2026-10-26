// FlipStax - pull still frames out of a video (no ffmpeg needed): swift tools/video-frames.swift in.mp4 outPrefix t1 t2 ... ("last" = the last frame)
// Writes <outPrefix>-<t>.png and prints the video's size and duration.
import Foundation
import AVFoundation
import AppKit
let a = CommandLine.arguments
guard a.count >= 4 else { print("usage: video-frames in.mp4 outPrefix t1 [t2 ...]"); exit(2) }
let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let dur = CMTimeGetSeconds(asset.duration)
if let tr = asset.tracks(withMediaType: .video).first { print("size \(tr.naturalSize) fps \(tr.nominalFrameRate) duration \(dur)") }
let gen = AVAssetImageGenerator(asset: asset); gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .zero; gen.requestedTimeToleranceAfter = .zero
for t in a[3...] {
  let sec = t == "last" ? max(0, dur - 0.05) : Double(t) ?? 0
  do {
    let cg = try gen.copyCGImage(at: CMTime(seconds: sec, preferredTimescale: 600), actualTime: nil)
    let rep = NSBitmapImageRep(cgImage: cg)
    try rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: "\(a[2])-\(t).png"))
    print("frame \(t) -> \(cg.width)x\(cg.height)")
  } catch { print("frame \(t) failed: \(error)") }
}
