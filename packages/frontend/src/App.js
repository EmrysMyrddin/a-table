import {useMutation, useQuery} from "urql";
import {groupBy, last, reverse, sumBy, meanBy} from "lodash";
import { intervalToDuration, formatDuration } from 'date-fns'

function App() {
  return (
    <>
      <h1>Les repas d'Arya</h1>
      
      <AddMeal/>
      
      <h2>Liste des repas :</h2>
      <MealList />
    </>
  );
}

function AddMeal() {
  const [{ fetching }, addMeal] = useMutation(/* GraphQL */ `
    mutation insert_meal($quantity: Int!, $date: timestamptz) {
      insert_meals_one(object: { quantity: $quantity, date: $date }) {
        id
      }
    }
  `)
  
  return <form onSubmit={async (e) => {
    e.preventDefault()
    await addMeal({quantity: e.target.quantity.value, date: new Date(e.target.date.value) })
    e.target.reset()
  }}>
    <input type="number" name="quantity" placeholder="Quantité" required style={{width: "75px"}}/>
    <input type="datetime-local" name="date" required/>
    <button type="submit" disabled={fetching}>Ajouter</button>
  </form>
}

function MealList() {
  const [{ data, fetching, error }] = useQuery({
    query: /* GraphQL */ `
      query list_meals {
        meals(order_by: [{date: asc}]) {
          id, date, quantity
        }
      }
    `
  })
  
  if(fetching) return <p>chargement...</p>
  if(error) return <p>Erreur : {error.message}</p>
  
  const allMeals = data.meals.map(meal => ({...meal, date: new Date(meal.date)}))
  
  const dates = groupBy(allMeals, ({date}) => date.toLocaleString('fr-FR', {dateStyle: "short", timeZone: "Europe/Paris"}))
  
  const lastMeal = last(allMeals)
  
  return (
    <>
      <p>Dernier repas: {lastMeal
        ? (
          <>{lastMeal.quantity} ml à <strong>{
              lastMeal.date.toLocaleString('fr-FR', {
              timeStyle: "short",
              timeZone: "Europe/Paris"
              })}</strong>{' '}
            (il y a <strong>{formatDuration(intervalToDuration({ start: lastMeal.date, end: new Date()}))}</strong>)
          </>
        ) : (
          "Pas encore de repas"
        )}
      </p>
      <ul>
        {reverse(Object.entries(dates)).map(([date, meals]) => (
          <li key={date}>
            {date} : Total de {sumBy(meals, 'quantity')} ml (moy. {meanBy(meals, 'quantity').toLocaleString('fr-FR', {maximumFractionDigits: 2})} ml)
            <ul>
              {meals.map(meal => (
                <li key={meal.id}>
                  {meal.quantity} ml à{' '}
                  {meal.date.toLocaleString('fr-FR', {timeStyle: "short", timeZone: "Europe/Paris"})}{' '}
                  <DeleteMeal id={meal.id}/>
                </li>
              ))}
            </ul>
            <br />
          </li>
        ))}
      </ul>
    </>
  )
}


function DeleteMeal({ id }) {
  const [{ fetching }, deleteMeal] = useMutation(/* GraphQL */`
    mutation delete_meal($id: uuid!) {
      delete_meals_by_pk(id: $id) {
        id
      }
    }
  `)
  
  return <button disabled={fetching} onClick={() => deleteMeal({ id })}>🗑</button>
}
export default App;
