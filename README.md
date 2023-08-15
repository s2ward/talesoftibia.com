# talesoftibia.com

A warm and welcoming site for your tales within Tibia, Tools and the Tibian lore and its mysteries.  

The site is hosted in AWS S3, with Cloudflare in front as CDN. Certain assets are hosted in s2ward/tibia repository. Certain articles are hosted in s2ward/docs repository. Both using GitHub Pages.  

This allows for a simple and fast serverless design that costs 2~ dollars per month to host.  

If you have an idea and is able to do the necessary frontend bits, I can setup all infrastructure bits.  

### Related repositories 

- [Tibia](https://github.com/s2ward/tibia) for NPC transcripts, NPSearch and more  
- [Docs](https://github.com/s2ward/docs) currently for articles hosted in GitHub pages

### How to run  

Install python, go to talesoftibia.com folder and run `python -m http.server` and browse to 'localhost:8000'.  

## NPSearch  

NPSearch works like this:  

1. User uploads transcript of NPC in github.com/s2ward/tibia/npc
2. Github Action converts and adds this transcript into [conversations.json](https://github.com/s2ward/tibia/blob/main/api/conversations.json)  
3. GitHub Action uploads the new conversations.json to GitHub pages URL https://s2ward.github.io/tibia/api/conversations.json
4. npsearch.html fetches the conversations.json file to client  
5. js/search.js uses conversations.json to perform client-side searches  

#### Disclaimer  

All source material within Tibia is made by CipSoft GmbH.  
I do not own nor did I make any Pictures, books or NPC transcripts and more.   
This is merely a fan-based site to indulge in Tibia.  
