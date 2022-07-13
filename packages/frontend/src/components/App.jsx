import {AddMeal} from "./meals";
import {AddPoop} from "./poops";
import {AddMedication} from "./medications";
import {Tabs} from "./tabs";
import {Tracker} from "./tracker";
import {Graphs} from "./graphs";
import {AddPuree} from "./puree";

function App() {
  return (
    <>
      <h1>Le tracker de la Loupiote</h1>
      
      <AddMeal/>
      <AddMedication />
      <AddPoop />
      <AddPuree />
  
      <Tabs>
        <Tracker tabTitle="Tracking"/>
        <Graphs tabTitle="Graphs"/>
      </Tabs>
    </>
  );
}

export default App;
