import {useMutation} from "urql";
import {useEffect, useState} from "react";
import {intervalToDuration, isAfter} from "date-fns";
import {formatDate, formatDateTime, formatNumber} from "../../../utils";
import {Small} from "../../../components/text";

export function maxTarget(date) {
  date = new Date(date)
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
    <input type="number" pattern="\d+" name="quantity" placeholder="Quantité" required style={{width: "75px"}}/>
    <input type="datetime-local" name="date" required/>
    <button type="submit" disabled={fetching}>Ajouter</button>
  </form>
}

export function LastMeal({meal}) {
  const [end, setEnd] = useState(() => new Date())
  
  useEffect(() => {
    const interval = setInterval(() => setEnd(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])
  
  if (!meal) {
    return <p>Pas encore de repas</p>
  }
  
  console.log(meal)
  
  const start = new Date(meal?.date)
  
  const timeSinceLastMeal = intervalToDuration({start, end})
  
  return (
    <div>{meal.quantity}<Small> ml il y a</Small> {timeSinceLastMeal.hours}h{timeSinceLastMeal.minutes.toString().padStart(2, '0')}</div>
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

export function MealDaySummary({day : {start_date, meals_count, meals_sum, meals_avg, purees_sum, purees_avg, purees_count }}) {
  return (
    <div className="inline-block">
      <div className="inline-block">{formatDate(start_date)}</div>{' '}
      <div className="inline-grid gap-2" style={{ gridTemplateColumns: 'repeat(3, max-content)'}}>
        <div>🍼 {meals_count}</div>
        <div>📊 {meals_sum} ml</div>
        <div>📈 {formatNumber(meals_avg)} ml</div>
        
        {purees_sum && (
          <>
            <div>🥣 {purees_count}</div>
            <div>📊 {purees_sum} g</div>
            <div>📈 {formatNumber(purees_avg)} g</div>
          </>
        )}
      </div>
    </div>
  )
}
