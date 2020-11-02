import { AzureFunction, Context } from "@azure/functions";
import * as df from "durable-functions";

const timerTrigger: AzureFunction = async function (
  context: Context,
  myTimer: any
): Promise<void> {
  if (!process.env.RSS) {
    throw new Error("Must provide RSS parameter");
  }

  if (!process.env.WEBHOOK) {
    throw new Error("Must provide WEBHOOK parameter");
  }

  const durableClient = df.getClient(context);
  const alerterEntity = new df.EntityId("AlerterEntity", "main");
  await durableClient.signalEntity(alerterEntity);
};

export default timerTrigger;
