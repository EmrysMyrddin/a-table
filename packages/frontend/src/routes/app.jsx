import {Link, Navigate, Route, Routes} from "react-router-dom";
import {BabyScreen} from "./baby";
import {BabyChoiceScreen} from "./babies";
import {Tracker} from "./baby/tracker/tracker";
import {Graphs} from "./baby/graphs";
import {WithAuth} from "../components/auth-provider";
import {LoginScreen} from "./login";
import {RegisterScreen} from "./register";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen/>}/>
      <Route path="/register" element={<RegisterScreen/>}/>
      <Route path="/babies" element={<WithAuth/>}>
        <Route path="" element={<BabyChoiceScreen/>}/>
        <Route path=":id" element={<BabyScreen/>}>
          <Route path="tracker" element={<Tracker/>}/>
          <Route path="graphs" element={<Graphs/>}/>
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/babies"/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Routes>
  );
}

function NotFound() {
  return (
    <>
      <div>Not Found</div>
      <div><Link to="/babies" className="text-blue-500" >Return to baby list</Link></div>
    </>
  )
}


export default App;
