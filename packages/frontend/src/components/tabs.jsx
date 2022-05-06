import {useState} from "react";

export function Tabs({children}) {
  const [current, setCurrent] = useState(children[0].props.tabTitle)
  
  return (
    <>
      <div onChange={e => setCurrent(e.target.value)}>
        {children.map(({props: {tabTitle}}) => (
          <label key={tabTitle}>
            <input type="radio" value={tabTitle} name="tab" checked={tabTitle === current}/> {tabTitle}
          </label>
        ))}
      </div>
      
      <h2>{current}</h2>
      
      {children.find(({props: {tabTitle}}) => tabTitle === current)}
    </>
  )
}
