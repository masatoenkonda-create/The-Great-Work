# Game music

`menu-theme.mp3` is the original file supplied by Maxence: **The Great Work (Late Night Menu Theme)**. Copied without audio modification (3,453,510 bytes).

Intended use: title/menu background music. This commit adds the asset only; it does not enable playback.

When integrating, start playback after a player interaction, respect the existing sound setting, avoid overlapping copies, and stop or transition it deliberately when leaving the menu. Seamless loop points have not been established; preview the end-to-start transition before assuming the track loops cleanly.
