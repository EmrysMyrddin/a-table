import {useMutation} from "urql";
import {formatDateTime} from "../utils";

export function AddPuree() {
  const [{fetching}, addPuree] = useMutation(/* GraphQL */ `
    mutation insert_puree($name: String!, $quantity: Int! $date: timestamptz) {
      insert_purees_one(object: { name: $name, quantity: $quantity, date: $date }) {
        id
      }
    }
  `)
  
  return <form onSubmit={async (e) => {
    e.preventDefault()
    await addPuree({name: e.target.name.value, date: new Date(e.target.date.value), quantity: Number(e.target.quantity.value)})
    e.target.reset()
  }}
  style={{
    display: 'grid',
    gridTemplate: 'auto auto / 180px auto min-content',
    width: '323px',
    marginBottom: '1em'
  }}>
    <input name="name" placeholder="Purée" required/>
    <input type="number" pattern="\d+" name="quantity" placeholder="Quantité" required style={{ width: '100%', gridRow: '1 / span 2', gridColumn: 2}}/>
    <input type="datetime-local" name="date" required/>
    <button style={{ gridRow: '1 / span 2', gridColumn: '3'}} type="submit" disabled={fetching}>Ajouter</button>
  </form>
}

export function DeletePuree({id}) {
  const [{fetching}, deletePuree] = useMutation(/* GraphQL */`
    mutation delete_puree($id: uuid!) {
      delete_purees_by_pk(id: $id) {
        id
      }
    }
  `)
  
  return <button disabled={fetching} onClick={() => window.confirm("Salade bien sûre ?") && deletePuree({id})}>🗑</button>
}

export function Puree({event}) {
  let vegetableEmoji = null
  if(event.name.includes('pomme')) vegetableEmoji = '🍎'
  if(event.name.includes('poire')) vegetableEmoji = '🍐'
  if(event.name.includes('banane')) vegetableEmoji = '🍌'
  if(event.name.includes('fraise')) vegetableEmoji = '🍓'
  if(event.name.includes('avocat')) vegetableEmoji = '🥑'
  if(event.name.includes('aubergine')) vegetableEmoji = '🍆'
  if(event.name.includes('brocoli')) vegetableEmoji = '🥦'
  if(event.name.includes('concombre')) vegetableEmoji = '🥒'
  if(event.name.includes('patate') || event.name.includes('pomme de terre')) vegetableEmoji = '🥔'
  if(event.name.includes('carotte')) vegetableEmoji = '🥕'
  
  return (
    <li key={event.id}>
      <DeletePuree id={event.id}/>&nbsp;&nbsp;🥣&nbsp;{vegetableEmoji}&nbsp;
      {event.quantity}ml de {event.name} à{' '}
      {formatDateTime(event.date)}{' '}
    </li>
  )
}
