#!/usr/bin/env bash
# Regenerate the social-share / Open Graph card at public/og.png (1200x630).
#
# Pointed at by <meta property="og:image"> + twitter:image in index.html.
# A real 1200x630 card unfurls correctly on Reddit / Discord / Slack / X —
# the old og:image was the 512x512 favicon under a summary_large_image tag,
# which most unfurlers letterbox or crop badly.
#
# Requires ImageMagick (`magick`). Re-run after a wordmark change.
set -euo pipefail
cd "$(dirname "$0")/.."

AB="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
AR="/System/Library/Fonts/Supplemental/Arial.ttf"

magick -size 1200x630 gradient:'#101014-#08080a' \
  \( public/libre_wide.png -resize 560x \) -gravity north -geometry +0+78 -composite \
  -font "$AB" -fill '#fafafa' -pointsize 72 -gravity north -annotate +0+360 'Learn to code, free.' \
  -font "$AR" -fill '#a1a1aa' -pointsize 31 -gravity north -annotate +0+458 \
    '90+ interactive courses  ·  26 languages  ·  open source  ·  no paywall' \
  -font "$AB" -fill '#f97316' -pointsize 30 -gravity south -annotate +0+44 'libre.academy' \
  public/og.png

echo "wrote public/og.png ($(sips -g pixelWidth -g pixelHeight public/og.png 2>/dev/null | awk '/pixel/{printf "%s ",$2}'))"
