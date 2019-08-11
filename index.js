const axios = require('axios');
const Better = require('better-sqlite3');
const Debug = require('debug');
const dotenv = require('dotenv');
const Parser = require('rss-parser');

dotenv.config();
const db = Better('db.sqlite');
const debug = Debug('Alerter:main');
const parser = new Parser();

if (!process.env.RSS) {
    throw new Error('Must provide RSS parameter');
}

if (!process.env.WEBHOOK) {
    throw new Error('Must provide WEBHOOK parameter');
}

['SIGINT', 'SIGTERM'].forEach(signal =>
    process.on(signal, () => process.exit(1))
);

async function fetchFeedGuids(feedUrl) {
    const feed = await parser.parseURL(feedUrl);
    const guids = feed.items.map(({guid}) => guid);
    return guids;
}

async function main() {
    const alreadySeen = db.prepare('select * from feed_items').all();
    const seenGuids = new Set(alreadySeen.map(({guid}) => guid));
    const feedGuids = await fetchFeedGuids(process.env.RSS);
    const newGuids = feedGuids.filter(guid => !seenGuids.has(guid));
    console.log(newGuids);

    if (newGuids.length > 0) {
        await axios.get(process.env.WEBHOOK);
        newGuids.forEach(guid =>
            db.prepare('insert into feed_items (guid) values (?)').run(guid)
        )
    }

    setTimeout(() => main(), 30000);
}

main();
