import {ResponsiveLine} from '@nivo/line'
import {ResponsiveBar} from "@nivo/bar"
import {ResponsiveScatterPlot} from '@nivo/scatterplot'
import {useQuery} from "urql";
import {drop, groupBy, meanBy, orderBy, range, sumBy, take, takeRight} from "lodash";
import {intervalToDuration} from "date-fns";
import {formatDate} from "../../utils";
import {useMemo, useState} from "react";
import {maxTarget} from "./tracker/meals";
import {useParams} from "react-router-dom";

export function Graphs() {
  const { id } = useParams()
  const [{data, fetching, error}] = useQuery({
    query: /* GraphQL */ `query list_tracking_infos($id: uuid!){
      meals(where: { baby_id: {_eq: $id}},order_by: [{date: asc}]) { id, date, quantity }
    }`,
    variables: {id},
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
      <label style={{display: "inline-flex", alignItems: "center", gap: '1em'}}>
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
        <StackedMealsGraph mealsByDate={mealsByDate}/>
        <MealsQuantityByTimeGraph meals={meals}/>
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
        {...lineConfig}
        {...timeScale}
        data={data}
        yFormat=">-.0f"
        yScale={{type: 'linear', min: 'auto'}}
        markers={[
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
        {...lineConfig}
        data={data}
        yFormat=">-.0f"
        yScale={{type: 'linear', min: 'auto'}}
        {...timeScale}
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
        {...lineConfig}
        data={data}
        yFormat=">-.1f"
        yScale={{type: 'linear', min: 'auto'}}
        {...timeScale}
        axisLeft={{ tickValues: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9] }}
      />
    </div>
  )
}

function StackedMealsGraph({ mealsByDate }) {
  const data = useMemo(() => takeRight(mealsByDate, 10).map(([date, meals]) => ({
    date,
    ...meals.map(({quantity}) => quantity),
  })), [mealsByDate])
  
  return (
    <div>
      <h3>Biberons journalier</h3>
      <ResponsiveBar
        margin={{ bottom: 60, left: 30, right: 20, top: 10 }}
        data={data}
        keys={range(20).map(n => n.toString())}
        indexBy="date"
        padding={0.1}
        axisBottom={{ tickRotation: 60}}
        valueScale={{ type: 'linear', max: 'auto' }}
        tooltip={barTooltip}
      />
    </div>
  )
}

function MealsQuantityByTimeGraph({ meals }) {
  const data = useMemo(() => [{
    id: 'meals quantity',
    data: takeRight(meals
      .filter(({sincePrevious}) => sincePrevious)
      .map(({quantity, sincePrevious}) => ({
        x: sincePrevious.hours + sincePrevious.minutes/60,
        y: quantity
      })), 7 * 15)
  }], [meals])
  
  return (
    <div>
      <h3>Quantité en fonction de l'interval entre biberons</h3>
      <ResponsiveScatterPlot
        {...lineConfig}
        data={data}
        xFormat={duration => `${Math.floor(duration)}h${((duration - Math.floor(duration)) * 60).toFixed(0).padStart(2, '0')}`}
        yScale={{type: 'linear', min: 'auto'}}
        yFormat=">-.1f"
        xScale={{type: 'linear', format: '>-.2f', min: 'auto'}}
        axisBottom={{format: '>-.2f'}}
      />
    </div>
  )
}

function tooltip(x, y, color) {
  return (
    <div style={{background: 'white', padding: '9px 12px', border: '1px solid #ccc', color}}>
      <div style={{padding: '3px 0'}}>{x}</div>
      <div style={{padding: '3px 0'}}>{y}</div>
    </div>
  )
}

function lineTooltip({ slice }) {
  const [{ serieColor, data: {yFormatted, xFormatted } }] = slice.points
  return tooltip(xFormatted, yFormatted, serieColor)
}

function barTooltip({indexValue, id, value, color}) {
  return tooltip(`${indexValue} (${Number(id) + 1})`, value, color)
}

function smooth(n, points) {
  return drop(points, n-1)
    .map(({x, y}, i) => ({
      x,
      y: meanBy(take(drop(points, i), n), 'y')
    }))
}

const lineConfig = {
  curve: "monotoneX",
  enableSlices: "x",
  sliceTooltip: lineTooltip,
  margin: { bottom: 30, left: 30, right: 20, top: 10 },
  animate: true,
}

const timeScale = {
  xFormat:"time:%d/%m/%Y",
  xScale: {type: 'time', format: '%Y-%m-%d', useUTC: false, precision: 'day'},
  axisBottom: {format: '%b %d', tickValues: 'every 4 days'},
}
