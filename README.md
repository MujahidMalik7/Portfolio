# Portfolio: Muhammad Mujahid Tufail

Plain HTML + CSS + a little JavaScript. No build step, no framework.

```
index.html  style.css  script.js  resume.pdf  vercel.json  robots.txt
assets/  headshot.jpg  og.png  favicon.svg  upwork-profile.png
         rag-architecture.svg  chatbot-architecture.svg  resume-data.js
         posters/ (wenet-poster.jpg, dowdy-poster.jpg)
```

## Test locally (do not double-click index.html)
YouTube embeds and the resume viewer behave differently from `file://`.
```
python -m http.server 8000      # then open http://localhost:8000
```

## Replace the resume
1. Overwrite `resume.pdf` (same name).
2. Regenerate the viewer data from the project root:
```
python -c "import base64;open('assets/resume-data.js','w').write('window.RESUME_B64=\"'+base64.b64encode(open('resume.pdf','rb').read()).decode()+'\";')"
```
The viewer reads the PDF from `assets/resume-data.js` (loaded on first open), not from a `.pdf` URL, so download managers like IDM cannot hijack it. If you skip step 2, the viewer shows the OLD resume.

## Change the demo videos
Top of `script.js`: `WENET_YOUTUBE_ID`, `DOWDY_YOUTUBE_ID` (the part after `v=`) and the two poster paths (1280x720 JPG in `assets/posters/`). Videos are Unlisted on YouTube and load only when clicked.

## Update the Upwork card
Replace `assets/upwork-profile.png` (see the comment above the card in `index.html` for the crop numbers).

## Change text
Everything is in `index.html`. Project descriptions are the `.desc` paragraphs; stack chips are the `.stack` spans.

## Deploy on Vercel
1. Put the contents of this folder at the ROOT of a GitHub repo (index.html must be at the top level).
2. vercel.com > Add New > Project > import the repo. Framework Preset: **Other**. Leave Build Command and Output Directory empty. Deploy.
3. Open the live URL, then replace `YOUR-SITE.vercel.app` in the two `og:` lines in `index.html` with it, commit and push. Vercel redeploys automatically.
4. Check the link preview at https://www.opengraph.xyz and test on a phone.
