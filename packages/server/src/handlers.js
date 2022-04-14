import { fulfillText } from "./fulfillments.js";

const intentHandlers = {
  "projects/a-table-c1d74/agent/intents/fb45a21a-241e-4250-8164-ae205060c400": async (result) => {
    const { quantity, date: rawDate } = result.parameters
    console.log('received new meal:', result.parameters)
    
    const date = rawDate.date_time ?? rawDate.date ?? rawDate
    
    const insertResponse = await fetch("https://a-table.caprover.cocaud.dev/v1/graphql", {
      method: "POST",
      headers: {'x-hasura-admin-secret': "kM1hJlZ89F5CI5DHrxUYYoZq0Y51vCFMZOgH8YMWxx7UhuYtyW"},
      body: JSON.stringify({
        query: /* GraphQL */`
          mutation insert_meal($quantity: Int!, $date: timestamptz!) {
            insert_meals(objects: {date: $date, quantity: $quantity}) {
              affected_rows
            }
          }
        `,
        variables: {
          quantity, date
        }
      })
    })
    
    const insertResult = await insertResponse.json()
    if (insertResult.errors) {
      console.error('error while inserting meal:', JSON.stringify(insertResult, null, 2))
      throw new Error(insertResult.errors[0].message)
    }
    
    console.log('meal inserted', JSON.stringify(insertResult.data))
    const dateText = new Date(date).toLocaleTimeString('fr-FR', {
      timeStyle: "short", timeZone: "Europe/Paris"
    })
    return fulfillText(`${quantity} à ${dateText}, c'est noté`)
  }
}

export async function assistantHandler(req, res) {
  if (req.headers["Autorization"] === "khsdlfajd; aidfh;asd f;alkjdf aw;oif ja;sdl ifjas;dlkfa;e") {
    res.status(503)
    res.send("Forbidden")
    return
  }
  
  let response = fulfillText("De quoi ?")
  try {
    const intentName = req.body.queryResult.intent.name
    console.log(`received intent ${intentName}`)
    const handler = intentHandlers[intentName]
    if (handler) {
      console.log(`handling intent ${intentName}`)
      response = await handler(req.body.queryResult)
    } else {
      console.warn(`no handler found for intent ${intentName}`)
    }
  } catch(err) {
    response = fulfillText(`Oups, ça n'a pas marché : ${err.message}`)
  }
  
  res.send(response)
}
