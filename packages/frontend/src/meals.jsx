import {useMutation} from "urql";
import {useEffect, useState} from "react";
import {intervalToDuration} from "date-fns";
import {meanBy, sumBy} from "lodash";
import {formatDateTime} from "./utils";

const min_daily_meal_target = 420
const max_daily_meal_target = 540

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
  
  return <button disabled={fetching} onClick={() => deleteMeal({id})}>🗑</button>
}

export function Meal({event}) {
  return (
    <li key={event.id}>
      <DeleteMeal id={event.id}/>&nbsp;&nbsp;🍼&nbsp;&nbsp;
      <span style={{width: '1.5em', display: 'inline-block', textAlign: 'end'}}>{event.quantity}</span> ml à{' '}
      {formatDateTime(event.date)}{' '}
    </li>
  )
}

export function MealDaySummary({meals, date}) {
  const sum = sumBy(meals, 'quantity')
  return (
    <>
      {date} :<br/>
      📊 {sum} ml
      | 🍼 {meals.length}{' '}
      | 📈 {formatNumber(sum / meals.length)} ml
      | 🔽 <Target target={min_daily_meal_target} value={sum}/> ml
      | 🔼 <Target target={max_daily_meal_target} value={sum}/> ml
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
