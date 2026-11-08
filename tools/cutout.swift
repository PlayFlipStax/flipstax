// FlipStax - lift a character off its plain studio background (Run 3).
// The character renders come as flat PNGs with a light grey backdrop and no alpha. This uses macOS Vision's
// subject lifting (VNGenerateForegroundInstanceMaskRequest, the same as "Copy Subject" in Photos) to write a
// PNG with a real alpha channel. tools/build-art.py then trims, aligns and converts it to WebP.
//   swift tools/cutout.swift in.png out.png
import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count == 3 else { print("usage: swift tools/cutout.swift in.png out.png"); exit(2) }
let inURL = URL(fileURLWithPath: args[1]), outURL = URL(fileURLWithPath: args[2])
guard let src = CGImageSourceCreateWithURL(inURL as CFURL, nil), let cg = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
  print("cannot read \(args[1])"); exit(1)
}
let req = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
do { try handler.perform([req]) } catch { print("vision failed: \(error)"); exit(1) }
guard let obs = req.results?.first else { print("no subject found in \(args[1])"); exit(1) }
let buf: CVPixelBuffer
do { buf = try obs.generateMaskedImage(ofInstances: obs.allInstances, from: handler, croppedToInstancesExtent: false) }
catch { print("mask failed: \(error)"); exit(1) }
let ci = CIImage(cvPixelBuffer: buf), ctx = CIContext()
guard let out = ctx.createCGImage(ci, from: ci.extent, format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!),
      let dst = CGImageDestinationCreateWithURL(outURL as CFURL, UTType.png.identifier as CFString, 1, nil) else { print("cannot write"); exit(1) }
CGImageDestinationAddImage(dst, out, nil)
CGImageDestinationFinalize(dst)
print("\(args[1]) -> \(args[2]) (\(obs.allInstances.count) subject)")
