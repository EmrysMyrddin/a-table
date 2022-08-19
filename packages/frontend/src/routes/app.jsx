import {Link, Navigate, Outlet, Route, Routes} from "react-router-dom";
import {BabyScreen} from "./baby";
import {BabyChoiceScreen} from "./babies";
import {Tracker} from "./baby/tracker/tracker";
import {Graphs} from "./baby/graphs";
import {WithAuth} from "../components/auth-provider";
import {LoginScreen} from "./login";
import {RegisterScreen} from "./register";
import {ShareModal, ShareScreen} from "./share";
import {Header} from "../components/header";
import {SecondaryButton} from "../components/button";
import {ReactComponent as ShareIcon} from "../components/icons/share-svgrepo-com.svg";
import {LogoutButton} from "../components/logout";
import {useState} from "react";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen/>}/>
      <Route path="/register" element={<RegisterScreen/>}/>
      <Route element={<WithAuth />}>
        <Route element={<><MainHeader/><Outlet/></>}>
          <Route path="/share-to/:shareTo" element={<ShareScreen />} />
          <Route path="/babies" element={<BabyChoiceScreen/>}/>
        </Route>
        
        <Route path="/babies/:id" element={<BabyScreen/>}>
          <Route path="tracker" element={<Tracker/>}/>
          <Route path="graphs" element={<Graphs/>}/>
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/babies"/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Routes>
  );
}

export function MainHeader() {
  const [showSharing, setShowSharing] = useState(false);
  
  return (
    <>
      <Header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          Baby Tracker
          <SecondaryButton className="rounded-full" onClick={() => setShowSharing(true)}><ShareIcon className="h-5"/></SecondaryButton>
        </div>
        <LogoutButton className="justify-self-end" />
      </Header>
      {showSharing && <ShareModal close={() => setShowSharing(false)}/>}
    </>
    
  )
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
