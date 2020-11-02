import axios from "axios";
import * as RssParser from "rss-parser";
import * as df from "durable-functions";

if (!process.env.RSS) {
  throw new Error("Must provide RSS parameter");
}

if (!process.env.WEBHOOK) {
  throw new Error("Must provide WEBHOOK parameter");
}

const parser = new RssParser();

async function fetchFeedGuids(feedUrl) {
  const feed = await parser.parseURL(feedUrl);
  return feed.items[0].guid;
}

export default df.entity(async function (context) {
  const lastTopGuid = context.df.getState(() => null);
  const liveTopGuid = await fetchFeedGuids(process.env.RSS);
  if (liveTopGuid !== lastTopGuid) {
    await axios.get(process.env.WEBHOOK);
    context.df.setState(liveTopGuid);
  }
});
