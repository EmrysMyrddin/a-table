import {useMutation} from "urql";
import {formatDateTime} from "./utils";

export function AddMedication() {
  const [{fetching}, addMedication] = useMutation(/* GraphQL */ `
    mutation insert_medication($medication: String!, $date: timestamptz) {
      insert_medications_one(object: { medication: $medication, date: $date }) {
        id
      }
    }
  `)
  
  return <form onSubmit={async (e) => {
    e.preventDefault()
    await addMedication({medication: e.target.medication.value, date: new Date(e.target.date.value)})
    e.target.reset()
  }}>
    <input name="medication" placeholder="Médicament" required style={{width: "75px"}}/>
    <input type="datetime-local" name="date" required/>
    <button type="submit" disabled={fetching}>Ajouter</button>
  </form>
}

export function DeleteMedication({id}) {
  const [{fetching}, deleteMedication] = useMutation(/* GraphQL */`
    mutation delete_medication($id: uuid!) {
      delete_medications_by_pk(id: $id) {
        id
      }
    }
  `)
  
  return <button disabled={fetching} onClick={() => deleteMedication({id})}>🗑</button>
}

export function Medication({event}) {
  return (
    <li key={event.id}>
      💊&nbsp;&nbsp;
      {event.medication} à{' '}
      {formatDateTime(event.date)}{' '}
      &nbsp;&nbsp;<DeleteMedication id={event.id}/>
    </li>
  )
}
