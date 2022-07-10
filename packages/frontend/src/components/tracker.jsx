import {LastMeal, maxTarget, Meal, MealDaySummary} from "./meals";
import {Medication} from "./medications";
import {Poop} from "./poops";
import {useQuery} from "urql";
import {orderBy} from "lodash";
import {addDays, intervalToDuration} from "date-fns";
import {formatDate} from "../utils";
import {useState} from "react";

export function Tracker() {
  const [{data, fetching, error}] = useQuery({
    query: /* GraphQL */ `query list_tracking_infos{
      daily_stats(order_by: { date: desc }) { date, sum, avg, count }
      last_meal: meals(order_by: { date: desc }, limit: 1) {
        id, date, quantity
      }
    }`
  })
  
  if (fetching) return <p>chargement...</p>
  if (error) return <p>Erreur : {error.message}</p>
  
  const days = data.daily_stats.map((day) => ({...day, date: new Date(day.date)}))
  
  return (
    <>
      <LastMeal meal={data.last_meal[0]}/>
      <p>Objectifs: {maxTarget(new Date())}</p>
      {days.map((day, i) => (
        <Day key={formatDate(day.date)} day={day} defaultOpen={i === 0} />
      ))}
    </>
  )
}

function Day({day, defaultOpen}) {
  const [showDetails, setShowDetails] = useState(defaultOpen)
  return (
    <>
      <div onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? '▼' : '▶'}︎ <MealDaySummary day={day} />
      </div>
      
      {showDetails && <DayDetails day={day} />}
    </>
  )
}

function DayDetails({day}) {
  const [{data, fetching, error}] = useQuery({
    query: /* GraphQL */ `query list_tracking_infos($dateFilter: timestamptz_comparison_exp){
      meals(where: { date: $dateFilter }, order_by: [{date: asc}]) { id, date, quantity }
      medications(where: { date: $dateFilter }) { id, date, medication }
      poops(where: { date: $dateFilter }) { id, date, quantity }
    }`,
    variables: { dateFilter: { _gte: day.date, _lt: addDays(day.date, 1) } },
  })
  
  if (fetching) return <p>chargement...</p>
  if (error) return <p>Erreur : {error.message}</p>
  
  const events = orderBy(
    [
      ...data.meals.map((meal, i) => {
        const previous = data.meals[i - 1]
        return ({
          ...meal,
          type: 'meal',
          sincePrevious: previous && intervalToDuration({start: new Date(previous.date), end: new Date(meal.date)})
        });
      }),
      ...data.medications.map(medication => ({...medication, type: 'medication'})),
      ...data.poops.map(poop => ({...poop, type: 'poop'}))
    ],
    ['date', 'asc']
  ).map(event => ({...event, date: new Date(event.date)}))
  
  return (
    <ul style={{listStyleType: 'none'}}>
      {events.map(event => {
        const Component = eventComponents[event.type]
        return <Component event={event} key={event.id}/>
      })}
    </ul>
  )
}

const eventComponents = {
  meal: Meal,
  medication: Medication,
  poop: Poop,
}
