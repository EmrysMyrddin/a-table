import {useQuery} from "urql";
import {filter, groupBy, last, orderBy, reverse, sortBy} from "lodash";
import {AddMeal, LastMeal, Meal, MealDaySummary} from "./meals";
import {AddPoop, Poop} from "./poops";
import {AddMedication, Medication} from "./medications";
import {formatDate} from "./utils";

function App() {
  return (
    <>
      <h1>Le tracker de la Loupiote</h1>
      
      <AddMeal/>
      <AddMedication />
      <AddPoop />
      
      <h2>Tracking</h2>
      <Tracker />
    </>
  );
}


function Tracker() {
  const [{ data, fetching, error }] = useQuery({
    query: /* GraphQL */ `query list_tracking_infos{
      meals { id, date, quantity }
      medications { id, date, medication }
      poops { id, date, quantity }
    }`
  })
  
  if(fetching) return <p>chargement...</p>
  if(error) return <p>Erreur : {error.message}</p>
  
  const allEvents = orderBy(
    [
      ...data.meals.map(meal => ({...meal, type: 'meal'})),
      ...data.medications.map(medication => ({...medication, type: 'medication'})),
      ...data.poops.map(poop => ({...poop, type: 'poop'}))
    ],
    ['date', 'asc']
  ).map(event => ({...event, date: new Date(event.date)}))
  
  const dates = groupBy(allEvents, ({date}) => formatDate(date))
  
  return (
    <>
      <LastMeal meal={last(data.meals)} />
      <ul>
        {reverse(Object.entries(dates)).map(([date, events]) => (
          <li key={date}>
            <MealDaySummary meals={filter(events, { type: 'meal' })} date={date}/>
            <ul style={{listStyleType: 'none'}}>
              {events.map(event => {
                const Component = eventComponents[event.type]
                return <Component event={event}/>
              })}
            </ul>
            <br />
          </li>
        ))}
      </ul>
    </>
  )
}

const eventComponents = {
  meal: Meal,
  medication: Medication,
  poop: Poop,
}

export default App;
