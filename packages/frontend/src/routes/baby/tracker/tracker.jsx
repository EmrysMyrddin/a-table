import {Meal, MealDaySummary} from "./meals";
import {Medication} from "./medications";
import {Poop} from "./poops";
import {useQuery} from "urql";
import {orderBy} from "lodash";
import {endOfDay, intervalToDuration, startOfDay} from "date-fns";
import {formatDate} from "../../../utils";
import {useState} from "react";
import {Puree} from "./puree";
import {useParams} from "react-router-dom";
import cn from "classnames";

const  trackerQueriesContext = { additionalTypenames: ['medications', 'poops', 'purees'] }

export function Tracker() {
  const { id } = useParams()
  const [{data, fetching, error}] = useQuery({
    query: /* GraphQL */ `query list_tracking_infos($id: uuid!){
      baby: babies_by_pk(id: $id) {
        daily_stats(order_by: { day: desc }) {
          day, meals_sum, meals_avg, meals_count, purees_avg, purees_sum, purees_count, start_date, end_date
        }
      }
    }`,
    variables: {id},
    context: trackerQueriesContext
  })
  
  if (fetching) return <p>chargement...</p>
  if (error) return <p>Erreur : {error.message}</p>
  
  return data.baby.daily_stats.map((day, i) => (
    <Day key={formatDate(day.day)} day={day} defaultOpen={i === 0} />
  ))
}

function Day({day, defaultOpen}) {
  const [showDetails, setShowDetails] = useState(defaultOpen)
  return (
    <>
      <div onClick={() => setShowDetails(!showDetails)} className={cn({ "border-t": !defaultOpen }, "m-2 p-2 pb-0")}>
        {showDetails ? '▼' : '▶'}︎ <MealDaySummary day={day} />
      </div>
      
      {showDetails && <DayDetails day={day} />}
    </>
  )
}

function DayDetails({day}) {
  const [{data, fetching, error}] = useQuery({
    query: /* GraphQL */ `query list_tracking_infos($startDate: timestamptz!, $endDate: timestamptz!){
      meals(where: { date: { _gte: $startDate, _lte: $endDate} }, order_by: [{date: asc}]) {
        id, date, quantity,
        previous_meal { id, date }
      }
      medications(where: { date: { _gte: $startDate, _lte: $endDate} }) { id, date, medication }
      poops(where: { date: { _gte: $startDate, _lte: $endDate} }) { id, date, quantity }
      purees(where: {date: {_gte: $startDate, _lte: $endDate}}) { id, date, quantity, name }
    }`,
    variables: { startDate: startOfDay(new Date(day.start_date)), endDate: endOfDay(new Date(day.end_date)) },
    context: trackerQueriesContext,
  })
  
  if (fetching) return null
  if (error) return <p>Erreur : {error.message}</p>
  
  const events = orderBy(
    [
      ...data.meals.map(meal => {
        const [previous] = meal.previous_meal
        return ({
          ...meal,
          type: 'meal',
          sincePrevious: previous && intervalToDuration({start: new Date(previous.date), end: new Date(meal.date)})
        });
      }),
      ...data.medications.map(medication => ({...medication, type: 'medication'})),
      ...data.poops.map(poop => ({...poop, type: 'poop'})),
      ...data.purees.map(puree => ({...puree, type: 'puree'}))
    ],
    ['date', 'asc']
  ).map(event => ({...event, date: new Date(event.date)}))
  
  return (
    <ul className="pl-14">
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
  puree: Puree,
}
