# talesoftibia.com

A warm and welcoming site for your tales within Tibia, Tools and the Tibian lore and its mysteries.  

The site is hosted in AWS S3, with Cloudflare in front as CDN. Certain assets are hosted in s2ward/tibia repository. Certain articles are hosted in s2ward/docs repository. Both using GitHub Pages.  

This allows for a simple and fast serverless design that costs 2~ dollars per month to host.  

If you have an idea and is able to do the necessary frontend bits, I can setup all infrastructure bits.  

### Related repositories 

- [Tibia](https://github.com/s2ward/tibia) for NPC transcripts, NPSearch and more  
- [Docs](https://github.com/s2ward/tibia) currently for articles hosted in GitHub pages

### How to run  

Install python, go to talesoftibia.com folder and run `python -m http.server` and browse to 'localhost:8000'.  

## NPSearch  

NPSearch works like this:  

1. User uploads transcript of NPC in github.com/s2ward/tibia/npc
2. Github Action converts and adds this transcript into [conversations.json](https://github.com/s2ward/tibia/blob/main/api/conversations.json)  
3. GitHub Action uploads the new conversations.json to GitHub pages URL https://s2ward.github.io/tibia/api/conversations.json
4. pages/tools.html fetches the conversations.json file to client  
5. src/search.js uses conversations.json to perform client-side searches  

## Needs 

- Cleanup of CSS 
- Reworked Search src/search.js to reduce complexity 
    - Reworked [txt_to_json.py](https://github.com/s2ward/tibia/blob/main/src/txt_to_json.py) to get a better more standard .json structure of [conversations.json](https://github.com/s2ward/tibia/blob/main/api/conversations.json)
- Better, visually appealing design. These could be your ideas.   
- A way to add articles that are readable on-site, this could be done with HTML pages and GitHub actions. It could also be GitHub pages and iFrames.  
- More fun things, these could be your ideas. You can raise an issue beforehand and the community can vote. If I instantly like it I will veto it into production.  
    - Do you have a tool you would like to be on site? Raise an issue.  
    - Would you like to submit the story of how you killed the first dragon? Or when you created a massive trap to kill newcommers? Or how you found a cool theory in the lore? That would be a fun read which would definitely fit into the essence of the site.  
- Better mobile support and readability.  
- normalize.css  

## Wants 

- Visible NPC icons next to NPSearch results  
    - Clickable link to NPC on tibia.fandom.com and/or location on tibiamaps.io  
    - We'd likely need to rework txt_to_json.py & search.js beforehand to allow for better customizations and less spaghettification of NPSearch.  
- Favicon. I am leaning towards spellbook of ancient arcana. Ideas welcome.   
- URL rewriting, to get `https://www.talesoftibia.com/index.html` into `https://www.talesoftibia.com` etc. I will likely set this up in Cloudflare when time permits.  
- Privacy statement/policy. Currently no logs are saved at all which I intend to keep, no complexity, no 

## Nice to have  

- An account system for comments and promoting interactivity (and who knows what else might emerge, share your ideas!)  
    - The user inputs an Alias, clicks a button and get a randomly generated number, for example '123456789123'.  
    - The player can now login using their number, and be distinguished as {alias}. No email during registration nor saved anywhere, no GDPR to think about.   
    - This could be realized with AWS Api-Gateway -> AWS Lambda -> AWS DynamoDB.  
    - This would have rate-limiting in front to only allow 1 or 2 accounts to be created per user per day.  
- A way to comment on stuff, see above.  
- A templating system
    - This could be added to ease development if the site grows.  
    - Since we are running serverless, I'd like these to be short jobs running in GitHub Actions. I can help and setup pipelines / infra bits.  
    - Backend functions could be Cloudflare workers or AWS Api-Gateway -> Lambda, preferrably workers.  

#### Disclaimer  

All source material within Tibia is made by CipSoft GmbH.  
I do not own nor did I make any Pictures, books or NPC transcripts and more.   
This is merely a fan-based site to indulge in Tibia.  
