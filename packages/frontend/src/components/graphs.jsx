import {ResponsiveLine} from '@nivo/line'
import {useQuery} from "urql";
import {drop, groupBy, meanBy, orderBy, sumBy, take} from "lodash";
import {intervalToDuration} from "date-fns";
import {formatDate} from "../utils";
import {useMemo, useState} from "react";
import {maxTarget, min_daily_meal_target} from "./meals";

export function Graphs() {
  const [{data, fetching, error}] = useQuery({
    query: /* GraphQL */ `query list_tracking_infos{
      meals { id, date, quantity }
    }`
  })
  
  const [smoothSpan, setSmoothSpan] = useState(3)
  
  const meals = useMemo(() => data && orderBy(
      data.meals.map((meal, i) => {
        const previous = data.meals[i - 1]
        return ({
          ...meal,
          date: new Date(meal.date),
          sincePrevious: previous && intervalToDuration({start: new Date(previous.date), end: new Date(meal.date)})
        });
      }),
    ['date', 'asc']
  ), [data])
  
  const mealsByDate = useMemo(() => {
    if(!meals) return null
    const groups = groupBy(meals, ({date}) => formatDate(date))
    delete groups[formatDate(new Date())] // remove today to avoid last point being weird
    return Object.entries(groups)
  }, [meals])
  
  if (fetching) return <p>chargement...</p>
  if (error) return <p>Erreur : {error.message}</p>
  
  return (
    <div>
      <label>
        Lissé sur {smoothSpan} jours <input
          type="range" min="1" max="7"
          value={smoothSpan} onChange={({target}) => setSmoothSpan(target.value) }
        />
      </label>
      <div style={{
        display: "grid",
        gridAutoRows: "200px",
        gap: "3em",
      }}>
        <DailySumGraph mealsByDate={mealsByDate} smoothSpan={smoothSpan}/>
        <DailyMeanGraph mealsByDate={mealsByDate} smoothSpan={smoothSpan}/>
        <MealNumberGraph mealsByDate={mealsByDate} smoothSpan={smoothSpan}/>
      </div>
    </div>
  )
}

function DailySumGraph({ mealsByDate, smoothSpan }) {
  const data = useMemo(() =>[{
    id: "daily sum",
    data: smooth(smoothSpan, mealsByDate.map(([, meals]) => ({
      x: meals[0].date,
      y: sumBy(meals, 'quantity'),
    }))),
  }], [mealsByDate, smoothSpan])
  
  return (
    <div>
      <h3>Total journalier</h3>
      <ResponsiveLine
        {...commonConfig}
        data={data}
        xFormat="time:%d/%m/%Y"
        yFormat=">-.0f"
        yScale={{type: 'linear', min: 'auto'}}
        xScale={{type: 'time', format: '%Y-%m-%d', useUTC: false, precision: 'day'}}
        axisBottom={{format: '%b %d', tickValues: 'every 4 days'}}
        markers={[
          {axis: 'y', value: min_daily_meal_target, lineStyle: { stroke: '#b22925' }, legend: 'minimum'},
          {axis: 'y', value: maxTarget(new Date()), lineStyle: { stroke: '#59b225' }, legend: 'objectif'}
        ]}
      />
    </div>
  )
}

function DailyMeanGraph({ mealsByDate, smoothSpan }) {
  const data = useMemo(() =>
    [{
      id: "daily mean",
      data: smooth(smoothSpan, mealsByDate.map(([, meals]) => ({
        x: meals[0].date,
        y: meanBy(meals, 'quantity'),
      }))),
    }], [mealsByDate, smoothSpan])
  
  return (
    <div>
      <h3>Moyenne par biberon journalier</h3>
      <ResponsiveLine
        {...commonConfig}
        data={data}
        xFormat="time:%d/%m/%Y"
        yFormat=">-.0f"
        yScale={{type: 'linear', min: 'auto'}}
        xScale={{type: 'time', format: '%Y-%m-%d', useUTC: false, precision: 'day'}}
        axisBottom={{format: '%b %d', tickValues: 'every 4 days',}}
      />
    </div>
  )
}

function MealNumberGraph({ mealsByDate, smoothSpan }) {
  const data = useMemo(() =>
    [{
      id: "daily mean",
      data: smooth(smoothSpan, mealsByDate.map(([, meals]) => ({
        x: meals[0].date,
        y: meals.length,
      }))),
    }], [mealsByDate, smoothSpan])
  
  return (
    <div>
      <h3>Nombre de biberon journalier</h3>
      <ResponsiveLine
        {...commonConfig}
        data={data}
        xFormat="time:%d/%m/%Y"
        yFormat=">-.1f"
        yScale={{type: 'linear', min: 'auto'}}
        xScale={{type: 'time', format: '%Y-%m-%d', useUTC: false, precision: 'day'}}
        axisBottom={{format: '%b %d', tickValues: 'every 4 days',}}
        axisLeft={{ tickValues: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9] }}
      />
    </div>
  )
}

function tooltip({ slice }) {
  const [{ serieColor, data: {yFormatted, xFormatted } }] = slice.points
  return (
    <div
      style={{
        background: 'white',
        padding: '9px 12px',
        border: '1px solid #ccc',
      }}
    >
      <div style={{color: serieColor, padding: '3px 0'}}>{xFormatted}</div>
      <div style={{color: serieColor, padding: '3px 0'}}>{yFormatted}</div>
    </div>
  )
}

function smooth(n, points) {
  return drop(points, n-1)
    .map(({x, y}, i) => ({
      x,
      y: meanBy(take(drop(points, i), n), 'y')
    }))
}

const commonConfig = {
  curve: "monotoneX",
  enableSlices: "x",
  sliceTooltip: tooltip,
  margin: { bottom: 30, left: 30, right: 20, top: 10 },
  animate: true,
}
