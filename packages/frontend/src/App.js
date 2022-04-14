import logo from './logo.svg';
import './App.css';
import {useMutation, useQuery} from "urql";
import {groupBy, last, reverse, sumBy} from "lodash";

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
  const [, addMeal] = useMutation(/* GraphQL */ `
    mutation insert_meal($quantity: Int!, $date: timestamptz) {
      insert_meals_one(object: { quantity: $quantity, date: $date }) {
        id
      }
    }
  `)
  
  return <form onSubmit={async (e) => {
    e.preventDefault()
    const result = await addMeal({quantity: e.target.quantity.value, date: e.target.date.value })
    console.log(result)
  }}>
    <input type="number" name="quantity" placeholder="Quantité"/>
    <input type="datetime-local" name="date" defaultValue={new Date().toISOString()}/>
    <button type="submit">Ajouter</button>
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
      <p>Dernier repas: {lastMeal.quantity} à <strong>{
        lastMeal.date.toLocaleString('fr-FR', {
          timeStyle: "short",
          timeZone: "Europe/Paris"
        })
      }</strong></p>
      <ul>
        {reverse(Object.entries(dates)).map(([date, meals]) => (
          <li key={date}>
            {date} : Total de {sumBy(meals, 'quantity')} ml
            <ul>
              {meals.map(meal => (
                <li key={meal.id}>
                  {meal.quantity} à{' '}
                  {meal.date.toLocaleString('fr-FR', {timeStyle: "short", timeZone: "Europe/Paris"})}
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

export default App;
