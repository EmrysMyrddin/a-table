export function fulfillText(text) {
  return {
    "fulfillmentMessages": [
      {
        "text": {
          "text": [
            text
          ]
        }
      }
    ]
  }
}
