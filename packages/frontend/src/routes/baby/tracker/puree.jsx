import {useMutation} from "urql";
import {formatDateTime} from "../../../utils";

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
    gridTemplate: 'auto auto / min-content 1fr min-content',
    width: '323px',
    marginBottom: '1em'
  }}>
    <input name="name" placeholder="Purée" required/>
    <input type="number" pattern="\d+" name="quantity" placeholder="Quantité" required style={{ width: '100%', gridRow: '1 / span 2', gridColumn: 2}}/>
    <input type="datetime-local" name="date" required style={{width: '100%'}}/>
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
  if(event.name.toLowerCase().includes('pomme')) vegetableEmoji = '🍎'
  if(event.name.toLowerCase().includes('poire')) vegetableEmoji = '🍐'
  if(event.name.toLowerCase().includes('banane')) vegetableEmoji = '🍌'
  if(event.name.toLowerCase().includes('fraise')) vegetableEmoji = '🍓'
  if(event.name.toLowerCase().includes('avocat')) vegetableEmoji = '🥑'
  if(event.name.toLowerCase().includes('aubergine')) vegetableEmoji = '🍆'
  if(event.name.toLowerCase().includes('brocoli')) vegetableEmoji = '🥦'
  if(event.name.toLowerCase().includes('concombre')) vegetableEmoji = '🥒'
  if(event.name.toLowerCase().includes('patate') ||
    event.name.toLowerCase().includes('pomme de terre') ||
    event.name.toLowerCase().includes('pdt')) vegetableEmoji = '🥔'
  if(event.name.toLowerCase().includes('carotte')) vegetableEmoji = '🥕'
  
  return (
    <li key={event.id}>
      <DeletePuree id={event.id}/>&nbsp;&nbsp;🥣&nbsp;{vegetableEmoji}&nbsp;
      {event.quantity} g de {event.name} à{' '}
      {formatDateTime(event.date)}{' '}
    </li>
  )
}
