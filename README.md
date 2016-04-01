# emoji_slackbot

    git clone https://github.com/libbymiller/emoji_slackbot

## Install the libraries

    npm install

## Get an emoji list of keywords

    curl -O https://raw.githubusercontent.com/notwaldorf/emoji-translate/master/bower_components/emojilib/emojis.json

## Create a sqlite database

    node databaseGenerator_json.js

## Get a bot ID

from https://my.slack.com/services/new/bot

## Run the bot

    BOT_API_KEY="yourkey" node emojibot.js

## links

https://www.npmjs.com/package/slackbots

https://api.slack.com/methods/chat.postMessage#channels

http://blog.victorquinn.com/javascript-promise-while-loop

## ta!

@jarkman for the idea, @barnoid for bot advice, @andrewn for making me read http://www.html5rocks.com/en/tutorials/es6/promises/

data from this brilliant project: https://github.com/notwaldorf/emoji-translate

## p.s.

It's not very good! (yet)
