import {useMutation} from "urql";
import {formatDateTime} from "./utils";

export function AddPoop() {
  const [{fetching}, addPoop] = useMutation(/* GraphQL */ `
    mutation insert_poop($quantity: String!, $date: timestamptz) {
      insert_poops_one(object: { quantity: $quantity, date: $date }) {
        id
      }
    }
  `)
  
  return <form onSubmit={async (e) => {
    e.preventDefault()
    await addPoop({quantity: e.target.quantity.value, date: new Date(e.target.date.value)})
    e.target.reset()
  }}>
    <select name="quantity" required style={{width: "83px"}} defaultValue="++">
      <option value="traces">Traces</option>
      <option value="+">+</option>
      <option value="++">++</option>
      <option value="+++">+++</option>
    </select>
    <input type="datetime-local" name="date" required/>
    <button type="submit" disabled={fetching}>Ajouter</button>
  </form>
}

export function DeletePoop({id}) {
  const [{fetching}, deletePoop] = useMutation(/* GraphQL */`
    mutation delete_poop($id: uuid!) {
      delete_poops_by_pk(id: $id) {
        id
      }
    }
  `)
  
  return <button disabled={fetching} onClick={() => deletePoop({id})}>🗑</button>
}

export function Poop({event}) {
  return (
    <li key={event.id}>
      <DeletePoop id={event.id}/>&nbsp;&nbsp;💩&nbsp;&nbsp;
      {event.quantity} à{' '}
      {formatDateTime(event.date)}{' '}
    </li>
  )
}
