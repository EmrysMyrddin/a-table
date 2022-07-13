import {useMutation} from "urql";
import {useEffect, useState} from "react";
import {intervalToDuration, isAfter} from "date-fns";
import {formatDate, formatDateTime} from "../utils";

export function maxTarget(date) {
  const { target } = maxTargets.find(({ until }) => !date || isAfter(until, date))
  return target
}

export const maxTargets = [
  { until: new Date("2022-04-25"), target: 6 * (90 + 3 * 4) },  // 0-1 mois
  { until: new Date("2022-05-25"), target: 6 * (120 + 4 * 4) }, // 1-2 mois
  { until: new Date("2022-06-25"), target: 5 * (150 + 5 * 4) }, // 2-3 mois
  { until: new Date("2022-07-25"), target: 5 * (180 + 6 * 4) }, // 3-4 mois
  { until: new Date("2022-08-25"), target: 4 * (210 + 7 * 4) }, // 4-6 mois
]

export function AddMeal() {
  const [{fetching}, addMeal] = useMutation(/* GraphQL */ `
    mutation insert_meal($quantity: Int!, $date: timestamptz) {
      insert_meals_one(object: { quantity: $quantity, date: $date }) {
        id
      }
    }
  `)
  
  return <form onSubmit={async (e) => {
    e.preventDefault()
    await addMeal({quantity: e.target.quantity.value, date: new Date(e.target.date.value)})
    e.target.reset()
  }}>
    <input type="number" name="quantity" placeholder="Quantité" required style={{width: "75px"}}/>
    <input type="datetime-local" name="date" required/>
    <button type="submit" disabled={fetching}>Ajouter</button>
  </form>
}

export function LastMeal({meal}) {
  const [end, setEnd] = useState(() => new Date())
  const start = new Date(meal.date)
  
  useEffect(() => {
    const interval = setInterval(() => setEnd(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])
  
  if (!meal) {
    return <p>Pas encore de repas</p>
  }
  
  const timeSinceLastMeal = intervalToDuration({start, end})
  
  return (
    <p>
      Dernier repas: {meal.quantity} ml à{' '}
      <strong>
        {formatDateTime(start)}
      </strong>{' '}
      (il y a <strong>{timeSinceLastMeal.hours}h{timeSinceLastMeal.minutes.toString().padStart(2, '0')}</strong>)
    </p>
  )
}

export function DeleteMeal({id}) {
  const [{fetching}, deleteMeal] = useMutation(/* GraphQL */`
    mutation delete_meal($id: uuid!) {
      delete_meals_by_pk(id: $id) {
        id
      }
    }
  `)
  
  return <button disabled={fetching} onClick={() => window.confirm("Salade bien sûre ?") && deleteMeal({id})}>🗑</button>
}

export function Meal({event}) {
  const {sincePrevious} = event
  return (
    <li key={event.id}>
      <DeleteMeal id={event.id}/>&nbsp;&nbsp;🍼&nbsp;&nbsp;
      <span style={{width: '1.5em', display: 'inline-block', textAlign: 'end'}}>{event.quantity}</span> ml à{' '}
      {formatDateTime(event.date)}{' '}
      {sincePrevious && (
        <>
          ({sincePrevious.hours}h{event.sincePrevious.minutes.toString().padStart(2, '0')})
        </>
      )}
      
    </li>
  )
}

export function MealDaySummary({day : {date, count, sum, avg }}) {
  return (
    <>
      <span className="column" style={{width: '2.5em'}}>{formatDate(date)}</span>{' '}
      <span className="column" style={{width: '5.1em'}}>📊 {sum} ml</span>
      <span className="column" style={{width: '2.5em'}}>🍼 {count}</span>
      <span className="column" style={{width: '5em'}}>📈 {formatNumber(avg)} ml</span>
      <span className="column" style={{width: '5em'}}>🔼 <Target target={maxTarget(date)} value={sum}/> ml</span>
    </>
  )
}

function Target({target, value}) {
  return (
    <span style={{color: value > target ? 'green' : 'red'}}>{Math.abs(target - value)}</span>
  )
}

function formatNumber(number){
  return (number || 0).toLocaleString('fr-FR', {maximumFractionDigits: 0})
}
