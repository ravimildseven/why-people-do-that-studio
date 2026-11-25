#!/bin/bash
# Makes public/sfx/yawn.wav: a soft breathy yawn (filtered pink noise with a slow swell and fade).
# Generated, not recorded, so there is no licence to track. Needs ffmpeg.
set -e
cd "$(dirname "$0")/../.."
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=color=pink:duration=1.7:sample_rate=48000:amplitude=0.6" \
  -af "bandpass=f=700:width_type=h:w=900,lowpass=f=2200,afade=t=in:st=0:d=0.75:curve=qsin,afade=t=out:st=0.95:d=0.75:curve=qsin,volume=0.9" \
  -ac 1 public/sfx/yawn.wav
echo "wrote public/sfx/yawn.wav"
