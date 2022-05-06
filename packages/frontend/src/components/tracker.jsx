import {LastMeal, Meal, MealDaySummary} from "./meals";
import {Medication} from "./medications";
import {Poop} from "./poops";
import {useQuery} from "urql";
import {filter, groupBy, last, orderBy, reverse} from "lodash";
import {intervalToDuration} from "date-fns";
import {formatDate} from "../utils";

export function Tracker() {
  const [{data, fetching, error}] = useQuery({
    query: /* GraphQL */ `query list_tracking_infos{
      meals { id, date, quantity }
      medications { id, date, medication }
      poops { id, date, quantity }
    }`
  })
  
  if (fetching) return <p>chargement...</p>
  if (error) return <p>Erreur : {error.message}</p>
  
  const allEvents = orderBy(
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
  
  const dates = groupBy(allEvents, ({date}) => formatDate(date))
  
  return (
    <>
      <LastMeal meal={last(data.meals)}/>
      {reverse(Object.entries(dates)).map(([date, events], i) => (
        <details open={i === 0} key={date} style={{marginBottom: '1em'}}>
          <summary><MealDaySummary meals={filter(events, {type: 'meal'})} date={date}/></summary>
          <ul style={{listStyleType: 'none'}}>
            {events.map(event => {
              const Component = eventComponents[event.type]
              return <Component event={event} key={event.id}/>
            })}
          </ul>
        </details>
      ))}
    </>
  )
}

const eventComponents = {
  meal: Meal,
  medication: Medication,
  poop: Poop,
}
