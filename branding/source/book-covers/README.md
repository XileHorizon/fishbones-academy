High-resolution masters for book covers served at
`libre.academy/starter-courses/<id>.jpg`.

These are the source PNG/JPEG files (typically 800–2000px on the long
edge) that the rendered covers in `public/starter-courses/<id>.jpg`
and `public/learn/starter-courses/<id>.jpg` were derived from. Keep
the original here so the next time the cover needs to be re-exported
(higher DPI, different aspect crop, etc.) we don't have to re-source
the artwork.

## Cover sizing convention

The catalog references covers by filename only (`cover: "testing-rust.jpg"`
in `starter-courses/manifest.json`). Two variants per cover live next
to the manifest in `public/starter-courses/` and `public/learn/starter-courses/`:

- `<id>.jpg` — **288×~430** at quality 88 (~25–40 KB). Standard
  density. The manifest-referenced filename.
- `<id>@2x.jpg` — **576×~860** at quality 88 (~100–150 KB). Retina /
  high-DPI. Currently unused by the catalog; future-ready for when
  a `<picture>` / `srcset` consumer lands.

## Regenerating a cover from a master

```sh
# 1x (the manifest-referenced filename)
magick branding/source/book-covers/<id>.png \
  -resize '288x' -quality 88 \
  public/starter-courses/<id>.jpg

# 2x (retina variant)
magick branding/source/book-covers/<id>.png \
  -resize '576x' -quality 88 \
  public/starter-courses/<id>@2x.jpg
```

After staging the files in `public/`, deployment copies them to
`dist/starter-courses/` and `dist/learn/starter-courses/` as part of
the standard build pipeline. For a one-off cover swap that needs to
land before the next deploy, mirror the same files to all four
directories manually.

## Aspect ratio

Standard is **2:3 portrait** (288×432, 576×864). Some imported covers
land at 288×429 because their source PNGs were a few pixels off — that
drift is fine, it doesn't read at thumbnail sizes. Source PNGs at any
2:3-adjacent ratio (3:4 also fine, 4:5 starts to look square at
thumbnail) will render correctly.
