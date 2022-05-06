import {ResponsiveLine} from '@nivo/line'
import {useQuery} from "urql";
import {groupBy, orderBy, sumBy} from "lodash";
import {intervalToDuration} from "date-fns";
import {formatDate} from "../utils";
import {useMemo} from "react";

export function Graphs() {
  const [{data, fetching, error}] = useQuery({
    query: /* GraphQL */ `query list_tracking_infos{
      meals { id, date, quantity }
    }`
  })
  
  if (fetching) return <p>chargement...</p>
  if (error) return <p>Erreur : {error.message}</p>
  
  const meals = orderBy(
      data.meals.map((meal, i) => {
        const previous = data.meals[i - 1]
        return ({
          ...meal,
          date: new Date(meal.date),
          sincePrevious: previous && intervalToDuration({start: new Date(previous.date), end: new Date(meal.date)})
        });
      }),
    ['date', 'asc']
  )
  
  return (
    <div style={{
      display: "grid",
      gridAutoRows: "200px",
      gap: "3em",
    }}>
      <DailySumGraph meals={meals}/>
      <SmoothDailySum meals={meals}/>
    </div>
  )
}

function DailySumGraph({ meals, min0 }) {
  const data = useMemo(() => {
    const groups = groupBy(meals, ({ date }) => formatDate(date))
    delete groups[formatDate(new Date())] // remove today to avoid last point being weird
    const dates = Object.entries(groups)
    return [{
      id: "daily sum",
      data: dates.map(([date, meals]) => ({
        x: meals[0].date,
        y: sumBy(meals, 'quantity'),
      })),
    }];
  }, [meals])
  
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
        axisBottom={{format: '%b %d', tickValues: 'every 4 days',}}
      />
    </div>
  )
}

function SmoothDailySum({ meals, min0 }) {
  const data = useMemo(() => {
    const groups = groupBy(meals, ({ date }) => formatDate(date))
    delete groups[formatDate(new Date())] // remove today to avoid last point being weird
    const dates = Object.entries(groups)
    return [{
      id: "daily sum",
      data: dates
        .filter((_, i) => i > 1)
        .map(([, meals], i) => {
          const last3days = [...dates[i][1], ...dates[i + 1][1], ...meals]
          return ({
            x: last3days[0].date,
            y: sumBy(last3days, 'quantity') / 3,
          });
        }),
    }];
  }, [meals])
  
  return (
    <div>
      <h3>Total journalier lissé sur 3 jours</h3>
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

const commonConfig = {
  curve: "monotoneX",
  enableSlices: "x",
  sliceTooltip: tooltip,
  margin: { bottom: 30, left: 30, right: 20, top: 10 },
  animate: true,
}
